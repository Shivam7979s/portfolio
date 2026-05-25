import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'

import MainPortfolio from './pages/MainPortfolio'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* MAIN PORTFOLIO */}
        <Route path="/" element={<MainPortfolio />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
      </Routes>

      {/* VERCEL ANALYTICS */}
      <Analytics />
    </BrowserRouter>
  )
}

export default App