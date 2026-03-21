import defaultAvatar from '../assets/default-avatar.jpg'

const suggested = [
  { name: "Ana Lima", course: "Design Gráfico" },
  { name: "Carlos Souza", course: "Redes de Computadores" },
  { name: "Mariana Ferreira", course: "Desenvolvimento de Sistemas" },
  { name: "João Pereira", course: "Técnico em Informática para Web" },
]

function SuggestedUsers() {
  return (
    <aside className="suggested-panel">
      <h2 className="suggested-title">Sugeridos para você</h2>

      <ul className="suggested-list">
        {suggested.map((user, index) => (
          <li key={index} className="suggested-item">
            <img src={defaultAvatar} alt="avatar" className="user-avatar" />
            <div className="suggested-info">
              <span className="suggested-name">{user.name}</span>
              <span className="suggested-course">{user.course}</span>
            </div>
            <button className="suggested-btn">Seguir</button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default SuggestedUsers