import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register, login } from '../firebase'
import './AuthPage.css'

const COURSES = [
  'Técnico em Informática para Web',
  'Desenvolvimento de Sistemas',
  'Redes de Computadores',
  'Design Gráfico',
  'Administração',
  'Outro',
]

const FIREBASE_ERRORS = {
  'auth/email-already-in-use':   'Este e-mail já está cadastrado.',
  'auth/invalid-email':          'E-mail inválido.',
  'auth/weak-password':          'Senha fraca. Use pelo menos 6 caracteres.',
  'auth/user-not-found':         'Usuário não encontrado.',
  'auth/wrong-password':         'Senha incorreta.',
  'auth/invalid-credential':     'E-mail ou senha incorretos.',
  'auth/too-many-requests':      'Muitas tentativas. Tente novamente mais tarde.',
}

function AuthPage() {
  const navigate              = useNavigate()
  const [mode, setMode]       = useState('login')   // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    name:      '',
    email:     '',
    password:  '',
    confirm:   '',
    course:    '',
    location:  '',
  })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  function switchMode(newMode) {
    setMode(newMode)
    setError('')
    setForm({ name: '', email: '', password: '', confirm: '', course: '', location: '' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.email.endsWith('@aluno.senai.br')) {
      return setError('Use seu e-mail institucional (@aluno.senai.br).')
    }

    if (mode === 'register') {
      if (!form.name.trim())              return setError('Informe seu nome.')
      if (!form.course)                   return setError('Selecione seu curso.')
      if (form.password.length < 6)       return setError('Senha deve ter pelo menos 6 caracteres.')
      if (form.password !== form.confirm) return setError('As senhas não coincidem.')
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register({
          name:     form.name.trim(),
          email:    form.email,
          password: form.password,
          course:   form.course,
          location: form.location.trim(),
        })
      }
      navigate('/')
    } catch (err) {
      setError(FIREBASE_ERRORS[err.code] || 'Ocorreu um erro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-brand">
        <div className="auth-brand-inner">
          <h1 className="auth-logo">SENAIHub</h1>
          <p className="auth-tagline">A rede social da sua turma.</p>
          <ul className="auth-features">
            <li>Compartilhe conquistas e projetos</li>
            <li>Conecte-se com colegas e professores</li>
            <li>Acesse cursos e materiais</li>
          </ul>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card">

          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'auth-tab-active' : ''}`}
              onClick={() => switchMode('login')}
              type="button"
            >
              Entrar
            </button>
            <button
              className={`auth-tab ${mode === 'register' ? 'auth-tab-active' : ''}`}
              onClick={() => switchMode('register')}
              type="button"
            >
              Cadastrar
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>

            {mode === 'register' && (
              <>
                <div className="auth-field">
                  <label className="auth-label">Nome completo</label>
                  <input
                    className="auth-input"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label">Curso</label>
                  <select
                    className="auth-input auth-select"
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione seu curso</option>
                    {COURSES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="auth-field">
                  <label className="auth-label">Cidade (opcional)</label>
                  <input
                    className="auth-input"
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Ex: São Paulo, SP"
                  />
                </div>
              </>
            )}

            <div className="auth-field">
              <label className="auth-label">E-mail institucional</label>
              <input
                className="auth-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nome@aluno.senai.br"
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Senha</label>
              <input
                className="auth-input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                required
              />
            </div>

            {mode === 'register' && (
              <div className="auth-field">
                <label className="auth-label">Confirmar senha</label>
                <input
                  className="auth-input"
                  type="password"
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Repita a senha"
                  required
                />
              </div>
            )}

            {error && <p className="auth-error">{error}</p>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading
                ? (mode === 'login' ? 'Entrando...' : 'Cadastrando...')
                : (mode === 'login' ? 'Entrar' : 'Criar conta')}
            </button>

          </form>

          <p className="auth-switch">
            {mode === 'login'
              ? <>Não tem conta? <button className="auth-switch-btn" onClick={() => switchMode('register')}>Cadastre-se</button></>
              : <>Já tem conta? <button className="auth-switch-btn" onClick={() => switchMode('login')}>Entrar</button></>
            }
          </p>

        </div>
      </div>

    </div>
  )
}

export default AuthPage