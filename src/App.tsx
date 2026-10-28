import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthGuard, GuestGuard } from './components/AuthGuard'
import AttendanceReportPage from './pages/attendance/AttendanceReportPage.tsx'
import DashboardPage from './pages/dashboard/DashboardPage.tsx'
import EmployeeFormPage from './pages/employee/EmployeeFormPage.tsx'
import HomePage from './pages/employee/EmployeeList.tsx'
import LeadListPage from './pages/leads/LeadListPage.tsx'
import OrderListPage from './pages/orders/OrderListPage.tsx'
import CategoryListPage from './pages/inventory/CategoryListPage.tsx'
import PriceListPage from './pages/inventory/PriceListPage.tsx'
import ProductFormPage from './pages/inventory/ProductFormPage.tsx'
import ProductListPage from './pages/inventory/ProductListPage.tsx'
import StockListPage from './pages/inventory/StockListPage.tsx'
import VendorFormPage from './pages/vendors/VendorFormPage.tsx'
import VendorListPage from './pages/vendors/VendorListPage.tsx'
import ProfilePage from './pages/profile/ProfilePage.tsx'
import LoginPage from './pages/auth/LoginPage.tsx'
import VerifyOtpPage from './pages/auth/VerifyOtpPage.tsx'
import { useAppSelector } from './store/hooks'

function RootRedirect() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
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
          path="/dashboard"
          element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          }
        />
        <Route
          path="/attendance"
          element={
            <AuthGuard>
              <AttendanceReportPage />
            </AuthGuard>
          }
        />
        <Route
          path="/profile"
          element={<Navigate to="/profile/personal-information" replace />}
        />
        <Route
          path="/profile/:section"
          element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          }
        />
        <Route
          path="/leads"
          element={<Navigate to="/leads/pending" replace />}
        />
        <Route
          path="/leads/:status"
          element={
            <AuthGuard>
              <LeadListPage />
            </AuthGuard>
          }
        />
        <Route
          path="/orders"
          element={<Navigate to="/orders/pending" replace />}
        />
        <Route
          path="/orders/:status"
          element={
            <AuthGuard>
              <OrderListPage />
            </AuthGuard>
          }
        />
        <Route
          path="/inventory"
          element={<Navigate to="/inventory/category" replace />}
        />
        <Route
          path="/inventory/category"
          element={
            <AuthGuard>
              <CategoryListPage />
            </AuthGuard>
          }
        />
        <Route
          path="/inventory/products"
          element={
            <AuthGuard>
              <ProductListPage />
            </AuthGuard>
          }
        />
        <Route
          path="/inventory/products/new"
          element={
            <AuthGuard>
              <ProductFormPage />
            </AuthGuard>
          }
        />
        <Route
          path="/inventory/products/:id/edit"
          element={
            <AuthGuard>
              <ProductFormPage />
            </AuthGuard>
          }
        />
        <Route
          path="/inventory/stock"
          element={
            <AuthGuard>
              <StockListPage />
            </AuthGuard>
          }
        />
        <Route
          path="/inventory/stock/:productId"
          element={
            <AuthGuard>
              <StockListPage />
            </AuthGuard>
          }
        />
        <Route
          path="/inventory/price"
          element={
            <AuthGuard>
              <PriceListPage />
            </AuthGuard>
          }
        />
        <Route
          path="/vendors"
          element={
            <AuthGuard>
              <VendorListPage />
            </AuthGuard>
          }
        />
        <Route
          path="/vendors/new"
          element={
            <AuthGuard>
              <VendorFormPage />
            </AuthGuard>
          }
        />
        <Route
          path="/vendors/:id/edit"
          element={
            <AuthGuard>
              <VendorFormPage />
            </AuthGuard>
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
        <Route
          path="/home/new"
          element={
            <AuthGuard>
              <EmployeeFormPage />
            </AuthGuard>
          }
        />
        <Route
          path="/home/:id/edit"
          element={
            <AuthGuard>
              <EmployeeFormPage />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
