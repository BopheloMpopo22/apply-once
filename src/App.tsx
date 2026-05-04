import { Route, Routes } from 'react-router-dom'
import { ApplicationGate, ApplicationPage } from './pages/ApplicationPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ProfileGate, ProfilePage } from './pages/ProfilePage'
import { AdminPage } from './pages/AdminPage'
import { RegisterPage } from './pages/RegisterPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/profile"
        element={
          <ProfileGate>
            <ProfilePage />
          </ProfileGate>
        }
      />
      <Route
        path="/application"
        element={
          <ApplicationGate>
            <ApplicationPage />
          </ApplicationGate>
        }
      />
    </Routes>
  )
}
