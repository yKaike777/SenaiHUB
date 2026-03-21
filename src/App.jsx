import { Outlet } from 'react-router-dom'
import Aside from './components/Aside'
import './App.css'

function App(){
  return(
    <>
      <main>
        <Aside />

        <div className='container'>
          <Outlet />
        </div>
      </main>
    </>    
  )
}

export default App
