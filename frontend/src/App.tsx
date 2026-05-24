import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainPortfolio from './pages/MainPortfolio'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import CustomCursor from './components/CustomCursor'
import InfiAIChat from './components/InfiAIChat'
import CommandConsole from './components/CommandConsole'

function App() {
  return (
    <Router>
      <div className="noise"></div>
      <CustomCursor />
      <InfiAIChat />
      <CommandConsole />
      <Routes>
        <Route path="/" element={<MainPortfolio />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
