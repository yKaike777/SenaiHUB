import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  increment,
  query,
  where,
  limit,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase'

export async function createUser(uid, { name, email, course = '', location = '' }) {
  const ref = doc(db, 'users', uid)
  await setDoc(ref, {
    name, email, location, course,
    profilePicture: '', bio: '',
    followers: [], following: [],
    postCount: 0,
    createdAt: serverTimestamp(),
  })
}

export async function getUser(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function updateUserProfile(uid, fields) {
  const allowed = ['name', 'location', 'bio', 'profilePicture', 'course']
  const safe = Object.fromEntries(
    Object.entries(fields).filter(([key]) => allowed.includes(key))
  )
  await updateDoc(doc(db, 'users', uid), safe)
}

export async function followUser(currentUid, followedUid) {
  await updateDoc(doc(db, 'users', currentUid), { following: arrayUnion(followedUid) })
  await updateDoc(doc(db, 'users', followedUid), { followers: arrayUnion(currentUid) })
}

export async function unfollowUser(currentUid, followedUid) {
  await updateDoc(doc(db, 'users', currentUid), { following: arrayRemove(followedUid) })
  await updateDoc(doc(db, 'users', followedUid), { followers: arrayRemove(currentUid) })
}

export async function incrementPostCount(uid) {
  await updateDoc(doc(db, 'users', uid), { postCount: increment(1) })
}

/**
 * Retorna usuários sugeridos: exclui o próprio usuário e quem ele já segue.
 * Traz no máximo `limitCount` resultados.
 */
export async function getSuggestedUsers(currentUid, alreadyFollowing = [], limitCount = 6) {
  const snap = await getDocs(
    query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(30))
  )
  const excluded = new Set([currentUid, ...alreadyFollowing])
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(u => !excluded.has(u.id))
    .slice(0, limitCount)
}

/**
 * Retorna os dados completos de uma lista de UIDs (usuários seguidos).
 */
export async function getUsersByIds(uids) {
  if (!uids?.length) return []
  const snaps = await Promise.all(uids.map(uid => getDoc(doc(db, 'users', uid))))
  return snaps
    .filter(s => s.exists())
    .map(s => ({ id: s.id, ...s.data() }))
}