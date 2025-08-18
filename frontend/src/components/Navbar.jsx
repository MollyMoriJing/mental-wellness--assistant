import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }
  return (
    <div className="w-full bg-white border-b">
      <div className="container flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="font-semibold">Wellness</Link>
          <Link to="/chat" className="text-sm">Chat</Link>
        </div>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  )
}
