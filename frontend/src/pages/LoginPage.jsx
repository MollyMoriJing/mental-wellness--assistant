import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const login = async () => {
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      onLogin()
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <input
        className="block w-full mb-2 border px-2 py-1 rounded"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="block w-full mb-4 border px-2 py-1 rounded"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button
        onClick={login}
        className="w-full bg-blue-600 text-white px-4 py-1 rounded"
      >
        Sign In
      </button>
    </div>
  )
}
