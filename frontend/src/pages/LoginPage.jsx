import { useState } from 'react'
import { Brain, Mail, Lock, UserPlus, LogIn } from 'lucide-react'
import api from '../api'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [loading, setLoading] = useState(false)

  const login = async () => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      onLogin()
    } catch (err) {
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const register = async () => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await api.post('/auth/register', { email, password })
      localStorage.setItem('token', res.data.token)
      onLogin()
    } catch (err) {
      setError('Registration failed. Email might already exist.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isRegistering) {
      register()
    } else {
      login()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-10rem',
          right: '-10rem',
          width: '24rem',
          height: '24rem',
          background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
          borderRadius: '50%',
          mixBlendMode: 'multiply',
          filter: 'blur(3rem)',
          opacity: 0.2,
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-10rem',
          left: '-10rem',
          width: '24rem',
          height: '24rem',
          background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
          borderRadius: '50%',
          mixBlendMode: 'multiply',
          filter: 'blur(3rem)',
          opacity: 0.2,
          animation: 'pulse 4s ease-in-out infinite 2s'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '18rem',
          height: '18rem',
          background: 'linear-gradient(45deg, #6366f1, #3b82f6)',
          borderRadius: '50%',
          mixBlendMode: 'multiply',
          filter: 'blur(3rem)',
          opacity: 0.2,
          animation: 'pulse 4s ease-in-out infinite 1s'
        }}></div>
      </div>

      {/* Dot Pattern Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.2,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
        backgroundSize: '20px 20px'
      }}></div>

      <div style={{
        maxWidth: '28rem',
        width: '100%',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Logo and Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '6rem',
            height: '6rem',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #6366f1)',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
            <Brain style={{ width: '3rem', height: '3rem', color: 'white' }} />
          </div>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #60a5fa, #a78bfa, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1rem',
            letterSpacing: '-0.025em',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            MindCare
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.25rem', fontWeight: '300' }}>
            Your personal mental wellness assistant
          </p>
        </div>

        {/* Login Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '2.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative'
        }}>
          {/* Inner glow */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))',
            borderRadius: '1rem'
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '0.75rem'
              }}>
                {isRegistering ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '1.125rem' }}>
                {isRegistering ? 'Join MindCare and start your wellness journey' : 'Sign in to continue your wellness journey'}
              </p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                color: '#fecaca',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                backdropFilter: 'blur(10px)'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#e2e8f0',
                  marginBottom: '0.75rem'
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '1.25rem',
                    height: '1.25rem',
                    color: '#94a3b8',
                    transition: 'color 0.3s ease'
                  }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '3rem',
                      paddingRight: '1rem',
                      paddingTop: '1rem',
                      paddingBottom: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.75rem',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                    placeholder="Enter your email"
                    disabled={loading}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      e.target.previousElementSibling.style.color = '#60a5fa';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.boxShadow = 'none';
                      e.target.previousElementSibling.style.color = '#94a3b8';
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#e2e8f0',
                  marginBottom: '0.75rem'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '1.25rem',
                    height: '1.25rem',
                    color: '#94a3b8',
                    transition: 'color 0.3s ease'
                  }} />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '3rem',
                      paddingRight: '1rem',
                      paddingTop: '1rem',
                      paddingBottom: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.75rem',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                    placeholder="Enter your password"
                    disabled={loading}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      e.target.previousElementSibling.style.color = '#60a5fa';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.boxShadow = 'none';
                      e.target.previousElementSibling.style.color = '#94a3b8';
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #6366f1)',
                  color: 'white',
                  padding: '1rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'scale(1.02)';
                    e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                    e.target.style.background = 'linear-gradient(45deg, #2563eb, #7c3aed, #4f46e5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
                    e.target.style.background = 'linear-gradient(45deg, #3b82f6, #8b5cf6, #6366f1)';
                  }
                }}
              >
                {loading ? (
                  <div style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <>
                    {isRegistering ? <UserPlus style={{ width: '1.5rem', height: '1.5rem' }} /> : <LogIn style={{ width: '1.5rem', height: '1.5rem' }} />}
                    <span>{isRegistering ? 'Create Account' : 'Sign In'}</span>
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                disabled={loading}
                style={{
                  color: '#cbd5e1',
                  fontWeight: '500',
                  fontSize: '1.125rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'white';
                  e.target.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#cbd5e1';
                  e.target.style.textDecoration = 'none';
                }}
              >
                {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#94a3b8', fontSize: '0.875rem' }}>
          <p>© 2024 MindCare. Your mental wellness matters.</p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
