import { Outlet } from 'react-router-dom'
import Aside from './components/Aside'
import Footer from './components/Footer'
import './App.css'

function App(){
  return(
    <>
      <main>
        <Aside />

        <div className='container'>
          <Outlet />
          <Footer />
        </div>
      </main>
    </>    
  )
}

export default App
