import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// ─── Estrutura ──────────────────────────────────────────────────────────────
//
//  courses/{courseId}
//  ├── name            string
//  ├── description     string
//  ├── workLoad        number       (horas)
//  ├── studentCount    number       (mantido em sync — evita contar subcoleção)
//  ├── thumbnail       string       (URL da imagem de capa)
//  └── createdAt       timestamp
//
//  courses/{courseId}/students/{uid}            ← subcoleção
//  └── enrolledAt      timestamp
//
//  Por que subcoleção para students?
//  - Um curso popular pode ter centenas de alunos
//  - Array embutida explodiria o tamanho do documento
//  - Subcoleção permite verificar matrícula em O(1) com getDoc
// ───────────────────────────────────────────────────────────────────────────

/**
 * Cria um novo curso.
 */
export async function createCourse({ name, description, workLoad, thumbnail = '' }) {
  const ref = await addDoc(collection(db, 'courses'), {
    name,
    description,
    workLoad,
    thumbnail,
    studentCount: 0,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

/**
 * Retorna um curso pelo ID.
 */
export async function getCourse(courseId) {
  const snap = await getDoc(doc(db, 'courses', courseId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

/**
 * Retorna todos os cursos ordenados por nome.
 */
export async function getAllCourses() {
  const q = query(collection(db, 'courses'), orderBy('name'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * Atualiza dados do curso (name, description, workLoad, thumbnail).
 */
export async function updateCourse(courseId, fields) {
  const allowed = ['name', 'description', 'workLoad', 'thumbnail']
  const safe = Object.fromEntries(
    Object.entries(fields).filter(([key]) => allowed.includes(key))
  )
  await updateDoc(doc(db, 'courses', courseId), safe)
}

/**
 * Matricula um aluno no curso.
 */
export async function enrollStudent(courseId, uid) {
  const studentRef = doc(db, 'courses', courseId, 'students', uid)
  const already = await getDoc(studentRef)
  if (already.exists()) return

  await setDoc(studentRef, { enrolledAt: serverTimestamp() })
  await updateDoc(doc(db, 'courses', courseId), {
    studentCount: (await getCourse(courseId)).studentCount + 1,
  })
}

/**
 * Remove a matrícula de um aluno do curso.
 */
export async function unenrollStudent(courseId, uid) {
  const studentRef = doc(db, 'courses', courseId, 'students', uid)
  const snap = await getDoc(studentRef)
  if (!snap.exists()) return

  await deleteDoc(studentRef)
  await updateDoc(doc(db, 'courses', courseId), {
    studentCount: (await getCourse(courseId)).studentCount - 1,
  })
}

/**
 * Verifica se um usuário está matriculado em um curso.
 */
export async function isEnrolled(courseId, uid) {
  const snap = await getDoc(doc(db, 'courses', courseId, 'students', uid))
  return snap.exists()
}

/**
 * Retorna a lista de UIDs de todos os alunos de um curso.
 */
export async function getCourseStudents(courseId) {
  const snap = await getDocs(collection(db, 'courses', courseId, 'students'))
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }))
}
/**
 * Exclui um curso e todos os seus alunos (subcoleção).
 */
export async function deleteCourse(courseId) {
  const studentsSnap = await getDocs(collection(db, 'courses', courseId, 'students'))
  await Promise.all(studentsSnap.docs.map(d => deleteDoc(d.ref)))
  await deleteDoc(doc(db, 'courses', courseId))
}