import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Auth
import LoginPage from './module/auth/pages/LoginPage'
import RegisterPage from './module/auth/pages/RegisterPage'
import ProtectedRoute from './module/auth/components/ProtectedRoute'

// Home
import HomePage from './module/home/pages/HomePage'

// Quotation
import QuotationList from './module/quotation/pages/QuotationList'
import CreateQuotation from './module/quotation/pages/CreateQuotation'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Protected ── */}
        <Route path="/" element={
          <ProtectedRoute><HomePage /></ProtectedRoute>
        } />
        <Route path="/quotations" element={
          <ProtectedRoute><QuotationList /></ProtectedRoute>
        } />
        <Route path="/quotation/create" element={
          <ProtectedRoute><CreateQuotation /></ProtectedRoute>
        } />
        <Route path="/quotation/:id" element={
          <ProtectedRoute><CreateQuotation /></ProtectedRoute>
        } />

        {/* ── 404 ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App