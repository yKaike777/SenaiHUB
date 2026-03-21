import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebase'
import { createUser, getUser } from './userService'
import { getAvatarForUser } from '../utils/avatarPool'

export async function register({ name, email, password, course, location }) {
  const credential     = await createUserWithEmailAndPassword(auth, email, password)
  const uid            = credential.user.uid
  const profilePicture = getAvatarForUser(uid)

  await createUser(uid, { name, email, course, location, profilePicture })

  return credential.user
}

export async function login(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  const uid        = credential.user.uid
  const userData   = await getUser(uid)
  return { authUser: credential.user, userData }
}

export async function logout() {
  await signOut(auth)
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}