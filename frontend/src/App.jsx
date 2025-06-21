import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Login from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ChatBox from './components/ChatBox'

function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'))

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => setAuthed(true)} />} />
        <Route path="/dashboard" element={authed ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/chat" element={authed ? <ChatBox /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  )
}

export default App