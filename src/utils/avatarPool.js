const AVATAR_NAMES = [
  'cachorro1.jpeg',
  'cachorro2.jpeg',
  'cachorro3.jpeg',
  'cachorro4.jpeg',
  'cachorro5.jpeg',
  'cachorro6.jpeg',
  'cachorro7.jpeg',
  'cachorro8.jpeg',
  'cachorro9.jpeg',
  'cachorro10.jpeg',
  'cachorro11.jpeg',
  'cachorro12.jpeg',
  'cachorro13.jpeg',
  'cachorro14.jpeg',
  'cachorro15.jpeg',
]

export const avatarPool = AVATAR_NAMES.map(name => `/avatars/${name}`)

export function getAvatarForUser(uid) {
  if (!avatarPool.length) return '/avatars/cachorro1.jpeg'
  if (!uid) return avatarPool[0]
  const hash = uid.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return avatarPool[hash % avatarPool.length]
}