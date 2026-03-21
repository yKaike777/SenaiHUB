import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

/**
 * Faz upload de uma imagem de perfil e retorna a URL pública.
 * O arquivo é salvo em: profile-pictures/{uid}/avatar
 */
export async function uploadProfilePicture(uid, file) {
  const storageRef = ref(storage, `profile-pictures/${uid}/avatar`)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  return url
}