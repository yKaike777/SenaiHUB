import { NavLink } from 'react-router-dom'
import AsideFooter from './AsideFooter'

function Aside(){
    return(
        <>
            <div className='Aside'>
                <h1>SENAIHub</h1>
                
                <NavLink to="/" className={({ isActive }) => isActive ? "link ativo" : "link"}>Feed</NavLink>
                <NavLink to="/configuration" className={({ isActive }) => isActive ? "link ativo" : "link"}>Configuration</NavLink>
                <NavLink to="/courses" className={({ isActive }) => isActive ? "link ativo" : "link"}>Courses</NavLink>
                <NavLink to="/messages" className={({ isActive }) => isActive ? "link ativo" : "link"}>Messages</NavLink>
                <NavLink to="/profile" className={({ isActive }) => isActive ? "link ativo" : "link"}>Profile</NavLink>

                <AsideFooter />
            </div>

        </>
    )
}

export default Aside