import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import AuthPage      from './pages/AuthPage.jsx'
import Feed          from './pages/Feed.jsx'
import Configuration from './pages/Configuration.jsx'
import Profile       from './pages/Profile.jsx'
import UserProfile   from './pages/UserProfile.jsx'
import Messages      from './pages/Messages.jsx'
import Courses       from './pages/Courses.jsx'
import NotFoundPage  from './pages/NotFoundPage.jsx'

const router = createBrowserRouter([
  { path: '/login', element: <AuthPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { index: true,            element: <Feed /> },
      { path: '/profile',       element: <Profile /> },
      { path: '/user/:uid',     element: <UserProfile /> },
      { path: '/configuration', element: <Configuration /> },
      { path: '/messages',      element: <Messages /> },
      { path: '/courses',       element: <Courses /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)