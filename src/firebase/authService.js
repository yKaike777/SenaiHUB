import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebase'
import { createUser, getUser } from './userService'

/**
 * Cadastra um novo usuário via Firebase Auth e cria seu documento no Firestore.
 * A senha é gerenciada inteiramente pelo Firebase Auth — nunca é salva no banco.
 */
export async function register({ name, email, password, course, location }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const uid = credential.user.uid

  await createUser(uid, { name, email, course, location })

  return credential.user
}

/**
 * Faz login com email e senha.
 * Retorna o usuário do Firestore junto com o user do Auth.
 */
export async function login(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  const uid = credential.user.uid
  const userData = await getUser(uid)
  return { authUser: credential.user, userData }
}

/**
 * Faz logout do usuário atual.
 */
export async function logout() {
  await signOut(auth)
}

/**
 * Observa mudanças no estado de autenticação.
 * Útil para manter sessão entre recarregamentos.
 * @param {Function} callback - Recebe o user do Auth (ou null se deslogado)
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}