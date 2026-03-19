import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

import Feed from './pages/Feed.jsx'
import Configuration from './pages/Configuration.jsx'
import Profile from './pages/Profile.jsx'
import Messages from './pages/Messages.jsx'
import Courses from './pages/Courses.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

const router = createBrowserRouter([
  {
    path: "/", 
    element: <App />,
    children: [
      { index: true, element: <Feed />},

      { path: "/", element: <Feed /> },
      { path: "/profile", element: <Profile />},
      { path: "/configuration", element: <Configuration /> },
      { path: "/messages", element: <Messages /> },
      { path: "/courses", element: <Courses /> },

    ], 
  },
  { path: "*", element: <NotFoundPage /> }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
