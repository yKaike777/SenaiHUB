import { NavLink } from 'react-router-dom'
function NotFoundPage(){
    return(
        <>
            <h1>Page Not Found! ❌</h1>
            <NavLink to={"/"}>Go back home</NavLink>
        </>
    )
}

export default NotFoundPage