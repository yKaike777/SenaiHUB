// Importa automaticamente todas as imagens de cachorro da pasta assets.
// Para adicionar mais fotos, basta colocar cachorro4.jpg, cachorro5.png etc.
// O Vite detecta e inclui automaticamente — não precisa mudar nada aqui.

const modules = import.meta.glob(
  '../assets/cachorro*',
  { eager: true }
)

// Extrai as URLs das imagens
export const avatarPool = Object.values(modules).map(m => m.default)

/**
 * Retorna uma foto aleatória do pool com base em uma string (uid).
 * O mesmo uid sempre retorna a mesma foto — é determinístico.
 */
export function getAvatarForUser(uid) {
  if (!avatarPool.length) return null
  if (!uid) return avatarPool[0]

  // Converte o uid em um índice estável
  const hash = uid.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return avatarPool[hash % avatarPool.length]
}