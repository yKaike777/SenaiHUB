export const ADMIN_EMAILS = [
  'kaike@aluno.senai.br',  // ← seu e-mail real aqui
]

export function isAdmin(email) {
  return ADMIN_EMAILS.includes(email)
}