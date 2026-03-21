import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'

// ─── Estrutura ──────────────────────────────────────────────────────────────
//
//  conversations/{convId}
//  ├── participants    string[]     [uid1, uid2]
//  ├── lastMessage     string       último texto enviado
//  ├── lastSenderId    string       quem enviou por último
//  └── updatedAt       timestamp
//
//  conversations/{convId}/messages/{msgId}
//  ├── senderId        string
//  ├── content         string
//  └── createdAt       timestamp
//
//  Por que ID determinístico para a conversa?
//  Ordenamos os dois UIDs alfabeticamente e concatenamos com '_'.
//  Assim uid_A + uid_B e uid_B + uid_A sempre geram o mesmo ID,
//  evitando conversas duplicadas entre o mesmo par de usuários.
// ───────────────────────────────────────────────────────────────────────────

function buildConvId(uid1, uid2) {
  return [uid1, uid2].sort().join('_')
}

/**
 * Garante que o documento da conversa existe.
 * Se não existir, cria com os participantes.
 */
async function ensureConversation(uid1, uid2) {
  const convId = buildConvId(uid1, uid2)
  const ref    = doc(db, 'conversations', convId)
  const snap   = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      participants:  [uid1, uid2],
      lastMessage:   '',
      lastSenderId:  '',
      updatedAt:     serverTimestamp(),
    })
  }
  return convId
}

/**
 * Envia uma mensagem entre dois usuários.
 * Cria a conversa se ainda não existir.
 */
export async function sendMessage(senderUid, receiverUid, content) {
  const convId = await ensureConversation(senderUid, receiverUid)

  await addDoc(collection(db, 'conversations', convId, 'messages'), {
    senderId:  senderUid,
    content:   content.trim(),
    createdAt: serverTimestamp(),
  })

  await updateDoc(doc(db, 'conversations', convId), {
    lastMessage:  content.trim(),
    lastSenderId: senderUid,
    updatedAt:    serverTimestamp(),
  })
}

/**
 * Escuta mensagens de uma conversa em tempo real.
 * @returns {Function} unsubscribe
 */
export function subscribeToMessages(uid1, uid2, callback) {
  const convId = buildConvId(uid1, uid2)
  const q = query(
    collection(db, 'conversations', convId, 'messages'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, snap => {
    const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(messages)
  })
}

/**
 * Retorna o ID da conversa entre dois usuários (sem criar).
 */
export function getConvId(uid1, uid2) {
  return buildConvId(uid1, uid2)
}