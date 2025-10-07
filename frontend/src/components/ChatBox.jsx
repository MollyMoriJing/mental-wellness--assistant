import { useState } from 'react'
import api from '../api'
import Navbar from './Navbar'

export default function ChatBox() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim() || loading) return
    
    const userMessage = input
    setInput("")
    setLoading(true)
    
    // Add user message immediately
    setMessages(prev => [...prev, { 
      id: Date.now(), 
      type: 'user', 
      content: userMessage, 
      timestamp: new Date() 
    }])
    
    try {
      const res = await api.post('/chat', { message: userMessage })
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'assistant', 
        content: res.data.response, 
        timestamp: new Date() 
      }])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = "I'm sorry, I'm having trouble connecting right now. Please try again later or contact support if the issue persists."
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'assistant', 
        content: errorMessage, 
        timestamp: new Date() 
      }])
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <div className="assistant">
      <Navbar />
      <div className="chat-container">
        <div className="chat-header">
          <h1 className="chat-title">Mental Wellness Assistant</h1>
          <p className="chat-subtitle">I'm here to support your mental health journey</p>
        </div>
        
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <div className="welcome-icon">💬</div>
              <h2 className="welcome-title">Welcome to your Mental Wellness Assistant</h2>
              <p className="welcome-description">
                Share how you're feeling today, and I'll provide personalized support and guidance.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-bubble">
                  <div className="message-content">{message.content}</div>
                  <div className="message-timestamp">{formatTime(message.timestamp)}</div>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="message assistant">
              <div className="typing-indicator">
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <span>Assistant is typing...</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="chat-input-container">
          <form className="chat-input-form" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <textarea
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How are you feeling today? Share your thoughts..."
              rows="1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="send-button"
            >
              <svg className="send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}