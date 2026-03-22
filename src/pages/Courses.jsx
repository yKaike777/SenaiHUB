import { useEffect, useState, useCallback } from 'react'
import { FaClock, FaUserGraduate, FaBookOpen, FaPlus, FaTimes, FaCheck, FaTrash } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { getAllCourses, enrollStudent, unenrollStudent, isEnrolled, createCourse, deleteCourse } from '../firebase'
import { isAdmin as checkAdmin } from '../utils/adminConfig'

const EMPTY_FORM = { name: '', description: '', workLoad: '', thumbnail: '' }

function Courses() {
  const { currentUser }               = useAuth()
  const [courses, setCourses]         = useState([])
  const [enrolled, setEnrolled]       = useState({})
  const [loading, setLoading]         = useState(true)
  const [actionId, setActionId]       = useState(null)
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [creating, setCreating]       = useState(false)
  const [formError, setFormError]     = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null) // id do curso aguardando confirmação

  const isAdmin = checkAdmin(currentUser?.email)

  const loadCourses = useCallback(async () => {
    try {
      const data = await getAllCourses()
      setCourses(data)
      if (currentUser) {
        const checks = await Promise.all(
          data.map(c => isEnrolled(c.id, currentUser.id).then(v => [c.id, v]))
        )
        setEnrolled(Object.fromEntries(checks))
      }
    } catch (err) {
      console.error('Erro ao carregar cursos:', err)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => { loadCourses() }, [loadCourses])

  useEffect(() => {
    function handleKey(e) {
      if (isAdmin && e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault()
        setShowModal(true)
      }
      if (e.key === 'Escape') {
        setShowModal(false)
        setConfirmDelete(null)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isAdmin])

  async function handleEnroll(courseId) {
    if (!currentUser || actionId) return
    setActionId(courseId)
    try {
      if (enrolled[courseId]) {
        await unenrollStudent(courseId, currentUser.id)
        setEnrolled(prev => ({ ...prev, [courseId]: false }))
        setCourses(prev => prev.map(c => c.id === courseId
          ? { ...c, studentCount: (c.studentCount || 1) - 1 }
          : c
        ))
      } else {
        await enrollStudent(courseId, currentUser.id)
        setEnrolled(prev => ({ ...prev, [courseId]: true }))
        setCourses(prev => prev.map(c => c.id === courseId
          ? { ...c, studentCount: (c.studentCount || 0) + 1 }
          : c
        ))
      }
    } catch (err) {
      console.error('Erro na matrícula:', err)
    } finally {
      setActionId(null)
    }
  }

  async function handleDeleteCourse(courseId) {
    if (confirmDelete !== courseId) {
      setConfirmDelete(courseId)
      return
    }
    setActionId(courseId)
    try {
      await deleteCourse(courseId)
      setCourses(prev => prev.filter(c => c.id !== courseId))
      setConfirmDelete(null)
    } catch (err) {
      console.error('Erro ao excluir curso:', err)
    } finally {
      setActionId(null)
    }
  }

  async function handleCreateCourse(e) {
    e.preventDefault()
    if (!form.name.trim())        return setFormError('Informe o nome do curso.')
    if (!form.description.trim()) return setFormError('Informe a descrição.')
    if (!form.workLoad || isNaN(Number(form.workLoad)) || Number(form.workLoad) <= 0)
      return setFormError('Informe a carga horária.')

    setCreating(true)
    setFormError('')
    try {
      await createCourse({
        name:        form.name.trim(),
        description: form.description.trim(),
        workLoad:    Number(form.workLoad),
        thumbnail:   form.thumbnail.trim(),
      })
      setForm(EMPTY_FORM)
      setShowModal(false)
      await loadCourses()
    } catch (err) {
      setFormError('Erro ao criar curso. Tente novamente.')
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="courses-layout">

      <div className="courses-header">
        <h2 className="courses-title">Cursos disponíveis</h2>
        {isAdmin && (
          <button className="course-create-btn" onClick={() => setShowModal(true)} title="Novo curso (Ctrl+Shift+N)">
            <FaPlus /> Novo curso
          </button>
        )}
      </div>

      {loading && (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Carregando cursos...</p>
      )}
      {!loading && courses.length === 0 && (
        <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Nenhum curso cadastrado ainda.</p>
      )}

      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            {course.thumbnail
              ? <img src={course.thumbnail} alt={course.name} className="course-thumbnail" />
              : <div className="course-thumbnail-placeholder"><FaBookOpen /></div>
            }
            <div className="course-body">
              <h3 className="course-name">{course.name}</h3>
              <p className="course-description">{course.description}</p>

              <div className="course-meta">
                <span className="course-meta-item"><FaClock /> {course.workLoad}h</span>
                <span className="course-meta-item">
                  <FaUserGraduate /> {course.studentCount || 0} aluno{course.studentCount !== 1 ? 's' : ''}
                </span>
              </div>

              <button
                className={`course-btn ${enrolled[course.id] ? 'course-btn-enrolled' : ''}`}
                onClick={() => handleEnroll(course.id)}
                disabled={actionId === course.id}
              >
                <FaBookOpen />
                {actionId === course.id && !confirmDelete
                  ? 'Aguarde...'
                  : enrolled[course.id]
                    ? 'Matriculado ✓'
                    : 'Matricular-se'}
              </button>

              {isAdmin && (
                <button
                  className={`course-delete-btn ${confirmDelete === course.id ? 'course-delete-confirm' : ''}`}
                  onClick={() => handleDeleteCourse(course.id)}
                  disabled={actionId === course.id}
                >
                  <FaTrash />
                  {confirmDelete === course.id
                    ? 'Confirmar exclusão'
                    : 'Excluir curso'}
                </button>
              )}

              {confirmDelete === course.id && (
                <button
                  className="course-delete-cancel"
                  onClick={() => setConfirmDelete(null)}
                >
                  <FaTimes /> Cancelar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de criação */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Novo curso</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>

            <form className="modal-form" onSubmit={handleCreateCourse}>
              <div className="modal-field">
                <label className="modal-label">Nome do curso *</label>
                <input className="modal-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Técnico em Informática" />
              </div>
              <div className="modal-field">
                <label className="modal-label">Descrição *</label>
                <textarea className="modal-input modal-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descreva o curso..." rows={3} />
              </div>
              <div className="modal-field">
                <label className="modal-label">Carga horária (horas) *</label>
                <input className="modal-input" type="number" min="1" value={form.workLoad} onChange={e => setForm(f => ({ ...f, workLoad: e.target.value }))} placeholder="Ex: 800" />
              </div>
              <div className="modal-field">
                <label className="modal-label">URL da imagem de capa (opcional)</label>
                <input className="modal-input" value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))} placeholder="https://..." />
              </div>

              {formError && <p className="modal-error">{formError}</p>}

              <div className="modal-actions">
                <button type="button" className="modal-btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="modal-btn-save" disabled={creating}>
                  <FaCheck /> {creating ? 'Criando...' : 'Criar curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Courses