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
  limit,
  where,
  serverTimestamp,
  onSnapshot,
  increment,
} from 'firebase/firestore'
import { db } from './firebase'
import { incrementPostCount } from './userService'

export async function createPost({ authorId, authorName, authorPicture, authorCourse, content }) {
  const ref = await addDoc(collection(db, 'posts'), {
    authorId,
    authorName,
    authorPicture,
    authorCourse: authorCourse || '',
    content,
    likes: {},
    likeCount: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
  })
  await incrementPostCount(authorId)
  return ref.id
}

export async function getPost(postId) {
  const snap = await getDoc(doc(db, 'posts', postId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function getRecentPosts(limitCount = 20) {
  const q = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getFeedForUser(followingIds, limitCount = 20) {
  if (!followingIds.length) return []
  const q = query(
    collection(db, 'posts'),
    where('authorId', 'in', followingIds.slice(0, 30)),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function subscribeToRecentPosts(callback, limitCount = 20) {
  const q = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  return onSnapshot(q, snap => {
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(posts)
  })
}

export async function toggleLike(postId, uid) {
  const ref  = doc(db, 'posts', postId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const likes        = snap.data().likes || {}
  const alreadyLiked = !!likes[uid]

  await updateDoc(ref, {
    [`likes.${uid}`]: alreadyLiked ? null : true,
    likeCount: (snap.data().likeCount || 0) + (alreadyLiked ? -1 : 1),
  })
}

export async function updatePost(postId, newContent) {
  await updateDoc(doc(db, 'posts', postId), {
    content:  newContent,
    editedAt: serverTimestamp(),
  })
}

export async function deletePost(postId) {
  const commentsSnap = await getDocs(collection(db, 'posts', postId, 'comments'))
  await Promise.all(commentsSnap.docs.map(d => deleteDoc(d.ref)))
  await deleteDoc(doc(db, 'posts', postId))
}

export async function addComment(postId, { authorId, authorName, authorPicture, content }) {
  await addDoc(collection(db, 'posts', postId, 'comments'), {
    authorId,
    authorName,
    authorPicture,
    content,
    createdAt: serverTimestamp(),
  })
  // Usa increment atômico — sem precisar ler o documento antes
  await updateDoc(doc(db, 'posts', postId), {
    commentCount: increment(1),
  })
}

export async function getComments(postId) {
  const q = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function subscribeToComments(postId, callback) {
  const q = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, snap => {
    const comments = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(comments)
  })
}

export async function deleteComment(postId, commentId) {
  await deleteDoc(doc(db, 'posts', postId, 'comments', commentId))
  await updateDoc(doc(db, 'posts', postId), {
    commentCount: increment(-1),
  })
}