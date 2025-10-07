import { useState, useEffect, useRef } from 'react'
import { X, Send, MessageCircle, User, Clock, Wifi, WifiOff, Video, Phone } from 'lucide-react'
import { io } from 'socket.io-client'
import Tooltip from './Tooltip'

export default function CoachingSessionPopup({ isOpen, onClose, session, currentUser }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [coachOnline, setCoachOnline] = useState(false)
  const [clientOnline, setClientOnline] = useState(false)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch existing messages for the session
  const fetchSessionMessages = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5001/api/coaching/sessions/${session.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.messages) {
          setMessages(data.messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender,
            created_at: msg.created_at,
            timestamp: new Date(msg.created_at)
          })))
        }
      }
    } catch (error) {
      console.error('Error fetching session messages:', error)
    }
  }

  // Initialize socket connection when popup opens
  useEffect(() => {
    console.log('CoachingSessionPopup useEffect triggered:', { isOpen, session: !!session, currentUser: !!currentUser })
    if (isOpen && session && currentUser) {
      console.log('Initializing SocketIO connection...', { session, currentUser })
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found')
        return
      }

      console.log('Creating SocketIO connection with token:', token ? 'present' : 'missing')
      const socket = io('http://localhost:5001', {
        transports: ['websocket'],
        auth: { token }
      })
      console.log('SocketIO instance created:', socket)
      
      socketRef.current = socket

      // Connection events
      socket.on('connect', () => {
        console.log('✅ Connected to coaching session')
        setIsConnected(true)
        console.log('Joining coaching session:', session.id)
        socket.emit('join_coaching_session', { session_id: session.id })
      })

      socket.on('disconnect', () => {
        console.log('❌ Disconnected from coaching session')
        setIsConnected(false)
      })

      socket.on('connect_error', (error) => {
        console.error('❌ SocketIO connection error:', error)
        setIsConnected(false)
      })

      socket.on('connected', (data) => {
        console.log('✅ SocketIO connected:', data)
        // Request coach availability status
        if (session.coach?.id) {
          console.log('Requesting coach availability for:', session.coach.id)
          socket.emit('request_coach_availability', { coach_id: session.coach.id })
        }
        // Set current user as online
        if (currentUser.id === session.client?.id) {
          console.log('Setting client as online')
          setClientOnline(true)
        } else if (currentUser.id === session.coach?.id) {
          console.log('Setting coach as online')
          setCoachOnline(true)
        }
      })

      // Coaching session events
      socket.on('joined_session', (data) => {
        console.log('Joined coaching session:', data)
        // Fetch existing messages for this session
        fetchSessionMessages()
      })

      socket.on('user_joined_session', (data) => {
        console.log('User joined session:', data)
        if (data.user_id === session.coach?.id) {
          setCoachOnline(true)
        } else if (data.user_id === session.client?.id) {
          setClientOnline(true)
        }
      })

      socket.on('user_left_session', (data) => {
        console.log('User left session:', data)
        if (data.user_id === session.coach?.id) {
          setCoachOnline(false)
        } else if (data.user_id === session.client?.id) {
          setClientOnline(false)
        }
      })

      // Message events
      socket.on('coaching_message', (message) => {
        setMessages(prev => [...prev, {
          id: message.id,
          content: message.content,
          sender: message.sender,
          created_at: message.created_at,
          timestamp: new Date(message.created_at)
        }])
      })

      // Typing events
      socket.on('user_typing', (data) => {
        if (data.is_typing) {
          setTypingUsers(prev => [...prev.filter(u => u.user_id !== data.user_id), {
            user_id: data.user_id,
            display_name: data.display_name
          }])
        } else {
          setTypingUsers(prev => prev.filter(u => u.user_id !== data.user_id))
        }
      })

      // Coach availability response
      socket.on('coach_availability', (data) => {
        console.log('Coach availability:', data)
        if (data.coach_id === session.coach?.id) {
          setCoachOnline(data.is_online)
        }
      })

      // Error handling
      socket.on('error', (error) => {
        console.error('Socket error:', error)
      })

      return () => {
        socket.emit('leave_coaching_session', { session_id: session.id })
        socket.disconnect()
        socketRef.current = null
      }
    }
  }, [isOpen, session, currentUser])

  const sendMessage = () => {
    if (!inputMessage.trim() || !socketRef.current || !session) return

    const message = inputMessage.trim()
    setInputMessage('')
    
    // Stop typing indicator
    if (isTyping) {
      socketRef.current.emit('typing_stop', { session_id: session.id })
      setIsTyping(false)
    }

    socketRef.current.emit('send_coaching_message', { 
      session_id: session.id, 
      content: message 
    })
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputMessage(value)

    if (!socketRef.current || !session) return

    // Emit typing start and debounce stop
    if (!isTyping) {
      socketRef.current.emit('typing_start', { session_id: session.id })
      setIsTyping(true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('typing_stop', { session_id: session.id })
        setIsTyping(false)
      }
    }, 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const isCoach = currentUser?.id === session?.coach?.id
  const otherParticipant = isCoach ? session?.client : session?.coach
  
  console.log('Session data:', { 
    session, 
    currentUser, 
    isCoach, 
    otherParticipant,
    coachOnline,
    clientOnline,
    isConnected
  })

  if (!isOpen || !session) {
    console.log('CoachingSessionPopup not rendering:', { isOpen, session: !!session })
    return null
  }

  return (
    <div className="coaching-session-overlay">
      <div className="coaching-session-popup">
        {/* Header */}
        <div className="coaching-session-header">
          <div className="session-info">
            <div className="session-title">
              <MessageCircle className="w-5 h-5" />
              <span>{session.title}</span>
            </div>
            <div className="session-meta">
              <div className="participant-info">
                <User className="w-4 h-4" />
                <Tooltip content={otherParticipant?.display_name || 'Loading...'}>
                  <span>
                    {isCoach ? 'Client' : 'Coach'}: {otherParticipant?.display_name || 'Loading...'}
                  </span>
                </Tooltip>
                <div className={`status-indicator ${isCoach ? (clientOnline ? 'online' : 'offline') : (coachOnline ? 'online' : 'offline')}`}>
                  {isCoach ? (clientOnline ? 'Online' : 'Offline') : (coachOnline ? 'Online' : 'Offline')}
                </div>
              </div>
              <div className="connection-status">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
          <div className="session-actions">
            <button className="action-button" title="Video Call">
              <Video className="w-4 h-4" />
            </button>
            <button className="action-button" title="Voice Call">
              <Phone className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="close-button">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Session Details */}
        <div className="session-details">
          <div className="session-description">
            <p>{session.description || 'No description provided'}</p>
          </div>
          <div className="session-schedule">
            <Clock className="w-4 h-4" />
            <span>
              {session.scheduled_at 
                ? new Date(session.scheduled_at).toLocaleString()
                : 'No scheduled time'
              }
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="coaching-messages">
          {messages.length === 0 ? (
            <div className="coaching-welcome">
              <MessageCircle className="w-8 h-8 text-gray-400" />
              <h3>Welcome to your coaching session!</h3>
              <p>
                {isCoach 
                  ? `Start the conversation with ${otherParticipant?.display_name || 'your client'}.`
                  : `Your coach ${otherParticipant?.display_name || 'is ready'} to help you.`
                }
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`coaching-message ${message.sender.is_coach ? 'coach' : 'client'}`}>
                <div className="message-header">
                  <Tooltip content={message.sender.display_name}>
                    <span className="message-sender">
                      {message.sender.display_name}
                      {message.sender.is_coach && (
                        <span className="coach-badge">Coach</span>
                      )}
                    </span>
                  </Tooltip>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            ))
          )}
          
          {/* Typing indicators */}
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              <div className="typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
              <span>
                {typingUsers.map(u => u.display_name).join(', ')} 
                {typingUsers.length === 1 ? ' is' : ' are'} typing...
              </span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="coaching-input">
          <div className="input-container">
            <textarea
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${isCoach ? 'your client' : 'your coach'}...`}
              className="message-input"
              rows="1"
              disabled={!isConnected}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || !isConnected}
              className="send-button"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          {!isConnected && (
            <div className="connection-warning">
              <WifiOff className="w-4 h-4" />
              <span>Connecting to session...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
