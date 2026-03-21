import { NavLink } from 'react-router-dom'

function Configuration(){
    return(
        <>
        <div className="content config">
            <h1 className="content-title">Configurações</h1>
            <p className="teste">Área em desenvolvimento, volte mais tarde!</p>
            <NavLink to={"/"} ><button>Voltar para o feed</button></NavLink>
        </div>  
        </>
    )
}

export default Configuration