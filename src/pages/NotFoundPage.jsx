import { NavLink } from 'react-router-dom'
function NotFoundPage(){
    return(
        <>
        <div className="notFoundPage">
            <h1>Página não encontrada! ❌</h1>
            <NavLink to={"/"}>Voltar para o Feed</NavLink>
        </div>

        </>
    )
}

export default NotFoundPage