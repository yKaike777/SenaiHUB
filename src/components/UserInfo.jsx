import defaultAvatar from '../assets/default-avatar.jpg'

function UserInfo(){
    return(
        <div className="user-info">
          <img
            src={defaultAvatar}
            alt="avatar"
            className='user-avatar'
          />
          <span className="user-name">
                NOME DE USUÁRIO
                <span className='user-course'>Técnico em Informática para Web ● <span className="post-date">2h Atrás</span></span>
            </span>
        </div>
    )
}

export default UserInfo