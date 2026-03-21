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
} from 'firebase/firestore'
import { db } from './firebase'
import { incrementPostCount } from './userService'

// ─── Estrutura ──────────────────────────────────────────────────────────────
//
//  posts/{postId}
//  ├── authorId        string       (UID do usuário)
//  ├── authorName      string       (denormalizado para evitar join no feed)
//  ├── authorPicture   string       (URL — denormalizado, igual acima)
//  ├── content         string
//  ├── likes           { [uid]: true }   (mapa: 1 like por usuário, fácil de checar)
//  ├── likeCount       number       (mantido em sync para ordenação eficiente)
//  ├── commentCount    number       (mantido em sync)
//  └── createdAt       timestamp
//
//  posts/{postId}/comments/{commentId}          ← subcoleção
//  ├── authorId        string
//  ├── authorName      string
//  ├── authorPicture   string
//  ├── content         string
//  └── createdAt       timestamp
//
//  Por que subcoleção para comments?
//  - Documentos do Firestore têm limite de 1 MB
//  - Com array embutida, um post viral travaria na hora de carregar
//  - Subcoleção permite paginar, ordenar e excluir comentários individualmente
// ───────────────────────────────────────────────────────────────────────────

// ── Posts ──────────────────────────────────────────────────────────────────

/**
 * Cria um novo post e incrementa o contador do autor.
 */
export async function createPost({ authorId, authorName, authorPicture, authorCourse, content }) {
  const ref = await addDoc(collection(db, 'posts'), {
    authorId,
    authorName,
    authorPicture,
    authorCourse: authorCourse || "",
    content,
    likes: {},
    likeCount: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
  })
  await incrementPostCount(authorId)
  return ref.id
}

/**
 * Retorna um post pelo ID.
 */
export async function getPost(postId) {
  const snap = await getDoc(doc(db, 'posts', postId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

/**
 * Retorna os N posts mais recentes do feed (todos os usuários).
 * Para um feed personalizado (só quem o usuário segue), use getFeedForUser().
 */
export async function getRecentPosts(limitCount = 20) {
  const q = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * Retorna posts de uma lista de UIDs (feed personalizado).
 * O Firestore suporta até 30 itens no `in` — para listas maiores, pagine os seguidos.
 */
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

/**
 * Escuta em tempo real os posts mais recentes.
 * @returns {Function} unsubscribe — chame ao desmontar o componente
 */
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

/**
 * Alterna like em um post (dá like se não curtiu, remove se já curtiu).
 */
export async function toggleLike(postId, uid) {
  const ref = doc(db, 'posts', postId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const likes = snap.data().likes || {}
  const alreadyLiked = !!likes[uid]

  await updateDoc(ref, {
    [`likes.${uid}`]: alreadyLiked ? null : true,  // null remove o campo no Firestore
    likeCount: (snap.data().likeCount || 0) + (alreadyLiked ? -1 : 1),
  })
}

/**
 * Deleta um post e todos os seus comentários.
 */
export async function deletePost(postId) {
  const commentsSnap = await getDocs(collection(db, 'posts', postId, 'comments'))
  await Promise.all(commentsSnap.docs.map(d => deleteDoc(d.ref)))
  await deleteDoc(doc(db, 'posts', postId))
}

// ── Comentários ────────────────────────────────────────────────────────────

/**
 * Adiciona um comentário na subcoleção do post.
 */
export async function addComment(postId, { authorId, authorName, authorPicture, content }) {
  await addDoc(collection(db, 'posts', postId, 'comments'), {
    authorId,
    authorName,
    authorPicture,
    authorCourse: authorCourse || "",
    content,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'posts', postId), {
    commentCount: (await getPost(postId)).commentCount + 1,
  })
}

/**
 * Retorna os comentários de um post, ordenados por data.
 */
export async function getComments(postId) {
  const q = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/**
 * Escuta comentários em tempo real.
 * @returns {Function} unsubscribe
 */
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

/**
 * Deleta um comentário específico.
 */
export async function deleteComment(postId, commentId) {
  await deleteDoc(doc(db, 'posts', postId, 'comments', commentId))
  await updateDoc(doc(db, 'posts', postId), {
    commentCount: (await getPost(postId)).commentCount - 1,
  })
}
/**
 * Edita o conteúdo de um post existente.
 * Marca editedAt para indicar que foi modificado.
 */
export async function updatePost(postId, newContent) {
  await updateDoc(doc(db, 'posts', postId), {
    content:  newContent,
    editedAt: serverTimestamp(),
  })
}