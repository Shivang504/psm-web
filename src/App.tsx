import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthGuard, GuestGuard } from './components/AuthGuard'
import HomePage from './pages/HomePage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import VerifyOtpPage from './pages/VerifyOtpPage.tsx'
import { useAppSelector } from './store/hooks'

function RootRedirect() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  return <Navigate to={isAuthenticated ? '/home' : '/login'} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route
          path="/login"
          element={
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <GuestGuard>
              <VerifyOtpPage />
            </GuestGuard>
          }
        />
        <Route
          path="/home"
          element={
            <AuthGuard>
              <HomePage />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
