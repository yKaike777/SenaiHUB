import { FaCog } from 'react-icons/fa'
import { Link } from 'react-router-dom'

function AsideFooter(){
    return(
        <>
            <div className="aside-footer">
                <span><div className="config-icon"><Link to={"/configuration"} className='Link-config'><FaCog /></Link></div> <p>Usuário</p></span>
            </div>
        </>
    )
}

export default AsideFooter