import axios from 'axios'

// Force production to hit Railway API directly (env var not being picked up on Vercel)
const api = axios.create({
  baseURL: 'https://mental-wellness-assistant-production.up.railway.app/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err?.response?.status === 401 || err?.response?.status === 422) {
      localStorage.removeItem('token')
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api