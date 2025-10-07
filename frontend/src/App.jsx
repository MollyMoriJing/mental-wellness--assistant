import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Brain, TrendingUp, User, Home, Calendar, Send, Smile, Meh, Frown, LogOut, Edit2, Trash2, Check, X, Users, MessageSquare, Heart, ThumbsUp, Plus, Clock, Star, ArrowRight } from 'lucide-react'
import Login from './pages/LoginPage'
import api from './api'
import { io } from 'socket.io-client'
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

// Import CSS files
import './styles/base.css'
import './styles/dashboard.css'
import './styles/assistant.css'
import './styles/mood.css'
import './styles/community.css'
import './styles/coaching.css'
import './styles/resources.css'
import './styles/coaching-session.css'

// Import components
import CoachingSessionPopup from './components/CoachingSessionPopup'
import Tooltip from './components/Tooltip'

function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'))
  const [activeTab, setActiveTab] = useState('dashboard')
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', content: 'Hello! I\'m your mental wellness assistant. How are you feeling today?', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ])
  const [chatSessions, setChatSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [recentSessions, setRecentSessions] = useState([])
  
  // Load chat sessions from database
  const fetchChatSessions = async () => {
    try {
      const res = await api.get('/chat/sessions')
      setChatSessions(res.data)
    } catch (error) {
      console.error('Error fetching chat sessions:', error)
    }
  }
  
  const fetchRecentSessions = async () => {
    try {
      const res = await api.get('/chat/recent')
      setRecentSessions(res.data)
    } catch (error) {
      console.error('Error fetching recent sessions:', error)
    }
  }
  
  // Load chat sessions on auth
  useEffect(() => {
    if (authed) {
      fetchChatSessions()
      fetchRecentSessions()
    }
  }, [authed])
  const [inputMessage, setInputMessage] = useState('')
  const [moods, setMoods] = useState([])
  const [timeRange, setTimeRange] = useState('7d') // 7d | 1y | all
  const [selectedMood, setSelectedMood] = useState('')
  const [moodNote, setMoodNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingMood, setEditingMood] = useState(null)
  const [editMoodLevel, setEditMoodLevel] = useState('')
  const [editMoodNote, setEditMoodNote] = useState('')
  
  // Community state
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general', is_anonymous: false })
  const [selectedPost, setSelectedPost] = useState(null)
  const [replyToId, setReplyToId] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [categoryFilter, setCategoryFilter] = useState('all')
  
  // Coaching state
  const [coaches, setCoaches] = useState([])
  const [coachingSessions, setCoachingSessions] = useState([])
  const [newSession, setNewSession] = useState({ coach_id: '', title: '', description: '', scheduled_at: '' })
  const [selectedSession, setSelectedSession] = useState(null)
  const [coachingMessage, setCoachingMessage] = useState('')
  const [editingSessionId, setEditingSessionId] = useState(null)
  const [editSessionData, setEditSessionData] = useState({ title: '', description: '', scheduled_at: '' })
  const [presence, setPresence] = useState('offline')
  const [typing, setTyping] = useState(false)
  const [rtMessages, setRtMessages] = useState([])
  const socketRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Coaching session popup state
  const [coachingSessionPopup, setCoachingSessionPopup] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  const leaveSessionRoute = () => {
    if (selectedSession && socketRef.current) {
      socketRef.current.emit('leave_coaching_session', { session_id: selectedSession.id })
    }
    setSelectedSession(null)
    setRtMessages([])
    if (window.location.hash.startsWith('#/session/')) window.location.hash = ''
  }

  const onTabChange = (tab) => {
    leaveSessionRoute()
    setActiveTab(tab)
    setMobileMenuOpen(false)
  }

  const handleLogin = () => {
    console.log('handleLogin called')
    setAuthed(true)
    fetchMoods()
    fetchCurrentUser()
  }

  const fetchCurrentUser = async () => {
    try {
      console.log('Fetching current user...')
      const res = await api.get('/user/profile')
      console.log('Current user fetched:', res.data)
      setCurrentUser(res.data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const openCoachingSession = (session) => {
    console.log('Opening coaching session:', session)
    console.log('Current user:', currentUser)
    setCoachingSessionPopup(session)
  }

  const closeCoachingSession = () => {
    setCoachingSessionPopup(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setAuthed(false)
    setMoods([])
    setMessages([{ id: 1, type: 'bot', content: 'Hello! I\'m your mental wellness assistant. How are you feeling today?', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setChatSessions([])
    setCurrentSessionId(null)
    setSelectedSessionId(null)
  }

  const createNewSession = async () => {
    try {
      const res = await api.post('/chat/sessions', { title: 'New Conversation' })
      const newSession = res.data
      setCurrentSessionId(newSession.id)
      setMessages([{ id: 1, type: 'bot', content: 'Hello! I\'m your mental wellness assistant. How are you feeling today?', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
      setSelectedSessionId(null)
      fetchChatSessions()
    } catch (error) {
      console.error('Error creating new session:', error)
    }
  }

  const selectSession = async (sessionId) => {
    try {
      const res = await api.get(`/chat/sessions/${sessionId}`)
      const session = res.data
      setCurrentSessionId(sessionId)
      setSelectedSessionId(sessionId)
      
      // Convert database messages to frontend format
      const formattedMessages = session.messages.map(msg => ({
        id: msg.id,
        type: msg.message_type,
        content: msg.content,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }))
      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error loading session:', error)
    }
  }

  const updateSessionTitle = async (sessionId, newTitle) => {
    try {
      await api.put(`/chat/sessions/${sessionId}`, { title: newTitle })
      fetchChatSessions()
    } catch (error) {
      console.error('Error updating session title:', error)
    }
  }

  const deleteChatSession = async (sessionId) => {
    try {
      await api.delete(`/chat/sessions/${sessionId}`)
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null)
        setCurrentSessionId(null)
        setMessages([{ id: 1, type: 'bot', content: 'Hello! I\'m your mental wellness assistant. How are you feeling today?', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
      }
      fetchChatSessions()
      fetchRecentSessions()
    } catch (error) {
      console.error('Error deleting chat session:', error)
    }
  }

  const fetchMoods = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setMoods([])
      return
    }

    api.get('/user/moods')
      .then(res => setMoods(res.data))
      .catch(err => {
        console.error('Failed to fetch moods:', err)
        setMoods([])
      })
  }

  useEffect(() => {
    if (authed) {
      fetchMoods()
      fetchPosts()
      fetchCoaches()
      fetchCoachingSessions()
      const token = localStorage.getItem('token')
      const socket = io('http://localhost:5001', {
        transports: ['websocket'],
        auth: { token }
      })
      socketRef.current = socket
      socket.on('connected', () => setPresence('online'))
      socket.on('disconnect', () => setPresence('offline'))
      socket.on('user_joined_session', (d) => {
        if (selectedSession && d?.session_id === selectedSession.id) setPresence('online')
      })
      socket.on('user_left_session', (d) => {
        if (selectedSession && d?.session_id === selectedSession.id) setPresence('away')
      })
      // Server broadcasts 'user_typing' with {is_typing}
      socket.on('user_typing', (d) => {
        if (selectedSession && d?.session_id === selectedSession.id) setTyping(!!d.is_typing)
      })
      // Server broadcasts 'coaching_message'
      socket.on('coaching_message', (m) => {
        if (selectedSession && m?.session_id === selectedSession.id) {
          setRtMessages((prev) => [...prev, m])
        }
      })
      return () => {
        socket.off()
        socket.disconnect()
        socketRef.current = null
      }
    }
  }, [authed])

  // Refetch posts when sorting or category changes
  useEffect(() => {
    if (authed) {
      fetchPosts()
    }
  }, [sortBy, categoryFilter])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return
    
    const userMessage = inputMessage
    setInputMessage('')
    setLoading(true)
    
    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    setMessages(prev => [...prev, newMessage])
    
    try {
      const res = await api.post('/chat', { message: userMessage })
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: res.data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botResponse])
      
      // Refresh sessions to get updated data
      fetchChatSessions()
      fetchRecentSessions()
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = "I'm sorry, I'm having trouble connecting right now. Please try again later."
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: errorMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botResponse])
    } finally {
      setLoading(false)
    }
  }

  // Build mood trend data
  const moodValue = (level) => ({ excellent: 5, good: 4, okay: 3, poor: 2, terrible: 1 }[level] || 3)
  const now = Date.now()
  const cutoff = timeRange === '7d' ? now - 7*24*60*60*1000 : timeRange === '1y' ? now - 365*24*60*60*1000 : 0
  const filteredMoods = moods.filter(m => new Date(m.timestamp).getTime() >= cutoff)

  const trendData = filteredMoods.slice().reverse().map(m => ({
    day: new Date(m.timestamp).toLocaleDateString(),
    score: moodValue(m.level)
  }))
  const distribution = ['excellent','good','okay','poor','terrible'].map(lvl => ({
    name: lvl,
    value: filteredMoods.filter(m => m.level === lvl).length
  }))
  const COLORS = ['#34d399','#60a5fa','#fbbf24','#fb923c','#f87171']

  // Simple weekly summary text
  const weeklySummary = (() => {
    const spanText = timeRange === '7d' ? 'this week' : timeRange === '1y' ? 'this year' : 'overall'
    const recent = filteredMoods
    if (recent.length === 0) return 'No mood logs this week. Try adding a quick check-in.'
    const avg = recent.reduce((a,b)=>a+moodValue(b.level),0)/recent.length
    const top = distribution.sort((a,b)=>b.value-a.value)[0]?.name || 'okay'
    const suggestion = top === 'terrible' || top === 'poor' ? 'Consider a short daily routine: 5‑minute breathing + 10‑minute walk.' : 'Keep the momentum with brief check-ins and one small goal.'
    return `You logged ${recent.length} moods ${spanText}. Average mood score ${(avg).toFixed(1)}. Most frequent: ${top}. ${suggestion}`
  })()

  const preview = (text, n = 120) => {
    if (!text) return ''
    return text.length > n ? text.slice(0, n).trim() + '…' : text
  }

  const logMood = async () => {
    if (!selectedMood) return
    
    try {
      await api.post('/user/moods', { level: selectedMood, note: moodNote.trim() || null })
      setSelectedMood('')
      setMoodNote('')
      fetchMoods()
    } catch (error) {
      console.error('Error logging mood:', error)
    }
  }

  const deleteMood = async (moodId) => {
    try {
      await api.delete(`/user/moods/${moodId}`)
      fetchMoods()
    } catch (error) {
      console.error('Error deleting mood:', error)
    }
  }

  const startEditMood = (mood) => {
    setEditingMood(mood.id)
    setEditMoodLevel(mood.level)
    setEditMoodNote(mood.note || '')
  }

  const cancelEditMood = () => {
    setEditingMood(null)
    setEditMoodLevel('')
    setEditMoodNote('')
  }

  const saveEditMood = async () => {
    if (!editMoodLevel) return
    
    try {
      await api.put(`/user/moods/${editingMood}`, { 
        level: editMoodLevel, 
        note: editMoodNote.trim() || null 
      })
      setEditingMood(null)
      setEditMoodLevel('')
      setEditMoodNote('')
      fetchMoods()
    } catch (error) {
      console.error('Error updating mood:', error)
    }
  }

  // Community functions
  const fetchPosts = async () => {
    try {
      const res = await api.get(`/community/posts?sort=${sortBy}&category=${categoryFilter}`)
      setPosts(res.data.posts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const createPost = async () => {
    if (!newPost.title || !newPost.content) return
    
    try {
      await api.post('/community/posts', newPost)
      setNewPost({ title: '', content: '', category: 'general', is_anonymous: false })
      fetchPosts()
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const likePost = async (postId) => {
    try {
      await api.post(`/community/posts/${postId}/like`)
      fetchPosts()
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const addComment = async (postId) => {
    if (!newComment.trim()) return
    try {
      const payload = { content: newComment }
      if (replyToId) payload.parent_id = replyToId
      await api.post(`/community/posts/${postId}/comments`, payload)
      setNewComment('')
      setReplyToId(null)
      fetchPostDetails(postId)
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const fetchPostDetails = async (postId) => {
    try {
      const res = await api.get(`/community/posts/${postId}`)
      setSelectedPost(res.data)
    } catch (error) {
      console.error('Error fetching post details:', error)
    }
  }

  // Coaching functions
  const fetchCoaches = async () => {
    try {
      const res = await api.get('/coaching/coaches')
      setCoaches(res.data)
    } catch (error) {
      console.error('Error fetching coaches:', error)
    }
  }

  const fetchCoachingSessions = async () => {
    try {
      const res = await api.get('/coaching/sessions')
      setCoachingSessions(res.data)
    } catch (error) {
      console.error('Error fetching coaching sessions:', error)
    }
  }

  const createCoachingSession = async () => {
    if (!newSession.coach_id || !newSession.title) return
    
    try {
      await api.post('/coaching/sessions', newSession)
      setNewSession({ coach_id: '', title: '', description: '', scheduled_at: '' })
      fetchCoachingSessions()
    } catch (error) {
      console.error('Error creating coaching session:', error)
    }
  }

  const startEditSession = (session) => {
    setEditingSessionId(session.id)
    setEditSessionData({
      title: session.title || '',
      description: session.description || '',
      scheduled_at: session.scheduled_at ? session.scheduled_at.slice(0,16) : ''
    })
  }

  const saveEditSession = async (sessionId) => {
    try {
      await api.put(`/coaching/sessions/${sessionId}`, {
        title: editSessionData.title,
        notes: editSessionData.description,
        scheduled_at: editSessionData.scheduled_at || undefined
      })
      setEditingSessionId(null)
      fetchCoachingSessions()
    } catch (error) {
      console.error('Error updating session:', error)
    }
  }

  const cancelSession = async (sessionId) => {
    try {
      await api.put(`/coaching/sessions/${sessionId}`, { status: 'cancelled' })
      fetchCoachingSessions()
    } catch (error) {
      console.error('Error cancelling session:', error)
    }
  }

  const deleteSession = async (sessionId) => {
    try {
      await api.delete(`/coaching/sessions/${sessionId}`)
      if (selectedSession?.id === sessionId) setSelectedSession(null)
      fetchCoachingSessions()
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  const sendCoachingMessage = async () => {
    if (!coachingMessage.trim() || !selectedSession) return
    
    try {
      await api.post(`/coaching/sessions/${selectedSession.id}/messages`, { 
        content: coachingMessage 
      })
      if (socketRef.current) {
        socketRef.current.emit('send_coaching_message', { session_id: selectedSession.id, content: coachingMessage })
      }
      setCoachingMessage('')
      fetchCoachingSessionDetails(selectedSession.id)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleCoachingInputChange = (e) => {
    const value = e.target.value
    setCoachingMessage(value)
    if (!selectedSession || !socketRef.current) return
    // emit typing start and debounce stop
    socketRef.current.emit('typing_start', { session_id: selectedSession.id })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current && socketRef.current.emit('typing_stop', { session_id: selectedSession.id })
    }, 800)
  }

  const fetchCoachingSessionDetails = async (sessionId) => {
    try {
      const res = await api.get(`/coaching/sessions/${sessionId}`)
      setSelectedSession(res.data)
      setRtMessages([])
      if (socketRef.current) {
        socketRef.current.emit('join_coaching_session', { session_id: sessionId })
      }
    } catch (error) {
      console.error('Error fetching session details:', error)
    }
  }

  // Lightweight hash routing for dedicated session page: #/session/:id
  useEffect(() => {
    const handleHash = () => {
      const m = window.location.hash.match(/^#\/session\/(\d+)$/)
      if (m) {
        const sid = parseInt(m[1], 10)
        if (!Number.isNaN(sid)) fetchCoachingSessionDetails(sid)
      } else {
        // leaving session page
        if (selectedSession && socketRef.current) {
          socketRef.current.emit('leave_coaching_session', { session_id: selectedSession.id })
        }
        setSelectedSession(null)
        setRtMessages([])
      }
    }
    window.addEventListener('hashchange', handleHash)
    handleHash()
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const getMoodColor = (mood) => {
    switch(mood) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'okay': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-orange-600 bg-orange-100'
      case 'terrible': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getMoodScore = (mood) => {
    switch(mood) {
      case 'excellent': return 9
      case 'good': return 7
      case 'okay': return 5
      case 'poor': return 3
      case 'terrible': return 1
      default: return 5
    }
  }

  const getMoodIcon = (mood) => {
    switch(mood) {
      case 'excellent': return <Smile className="w-5 h-5" />
      case 'good': return <Smile className="w-5 h-5" />
      case 'okay': return <Meh className="w-5 h-5" />
      case 'poor': return <Frown className="w-5 h-5" />
      case 'terrible': return <Frown className="w-5 h-5" />
      default: return <Meh className="w-5 h-5" />
    }
  }

  if (!authed) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app-layout">
      {/* Top Navigation Bar */}
      <header className="app-header">
        <div className="header-content">
          {/* Left: Mobile Menu + App Title */}
          <div className="header-left">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="app-logo">
              <Brain className="w-5 h-5" />
            </div>
            <div className="app-title">
              <h1>MindCare</h1>
              <p>Wellness Assistant</p>
            </div>
          </div>

          {/* Center: Current Section Title */}
          <div className="header-center">
            <h2 className="section-title">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'chat' && 'AI Assistant'}
              {activeTab === 'mood' && 'Mood Tracker'}
              {activeTab === 'community' && 'Community Forum'}
              {activeTab === 'coaching' && 'Coaching & Mentoring'}
              {activeTab === 'resources' && 'Wellness Resources'}
            </h2>
          </div>

          {/* Right: User Actions */}
          <div className="header-right">
            <div className="user-status">
              <div className="status-indicator"></div>
              <span>Online</span>
            </div>
            <Tooltip content={currentUser?.display_name || currentUser?.email || 'User'}>
              <div className="user-avatar">
                <User className="w-4 h-4" />
              </div>
            </Tooltip>
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              <LogOut className="w-4 h-4" />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="app-main">
        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div 
            className="mobile-overlay"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-content">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="sidebar-close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <nav className="sidebar-nav">
              <button
                onClick={() => onTabChange('dashboard')}
                className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                <Home className="nav-icon" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => onTabChange('chat')}
                className={`nav-button ${activeTab === 'chat' ? 'active' : ''}`}
              >
                <MessageCircle className="nav-icon" />
                <span>AI Assistant</span>
              </button>
              <button
                onClick={() => onTabChange('mood')}
                className={`nav-button ${activeTab === 'mood' ? 'active' : ''}`}
              >
                <TrendingUp className="nav-icon" />
                <span>Mood Tracker</span>
              </button>
              <button
                onClick={() => onTabChange('community')}
                className={`nav-button ${activeTab === 'community' ? 'active' : ''}`}
              >
                <Users className="nav-icon" />
                <span>Community</span>
              </button>
              <button
                onClick={() => onTabChange('coaching')}
                className={`nav-button ${activeTab === 'coaching' ? 'active' : ''}`}
              >
                <MessageSquare className="nav-icon" />
                <span>Coaching</span>
              </button>
              <button
                onClick={() => onTabChange('resources')}
                className={`nav-button ${activeTab === 'resources' ? 'active' : ''}`}
              >
                <Calendar className="nav-icon" />
                <span>Resources</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="dashboard">
              <div className="dashboard-header">
                <h1 className="dashboard-title">Dashboard</h1>
                <p className="dashboard-subtitle">Your mental wellness overview</p>
                <div className="filter-dropdown">
                  <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                    <option value="7d">Last 7 days</option>
                    <option value="1y">Last year</option>
                    <option value="all">All time</option>
                  </select>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card-header">
                    <div>
                      <p className="stat-card-title">Current Mood</p>
                      <p className="stat-card-value">
                        {moods.length > 0 ? moods[0].level : 'Good'}
                      </p>
                      <p className="stat-card-description">How you're feeling today</p>
                    </div>
                    <div className="stat-card-icon mood">
                      {moods.length > 0 ? getMoodIcon(moods[0].level) : <Smile className="w-8 h-8" />}
                    </div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-card-header">
                    <div>
                      <p className="stat-card-title">Mood Entries</p>
                      <p className="stat-card-value">{moods.length}</p>
                      <p className="stat-card-description">Total logs recorded</p>
                    </div>
                    <div className="stat-card-icon entries">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-card-header">
                    <div>
                      <p className="stat-card-title">AI Conversations</p>
                      <p className="stat-card-value">{messages.filter(m => m.type === 'user').length}</p>
                      <p className="stat-card-description">Chat sessions with AI</p>
                    </div>
                    <div className="stat-card-icon chat">
                      <MessageCircle className="w-8 h-8" />
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <div>
                      <p className="stat-card-title">Coaching Sessions</p>
                      <p className="stat-card-value">{coachingSessions.filter(s => s.status === 'completed').length}</p>
                      <p className="stat-card-description">Completed sessions</p>
                    </div>
                    <div className="stat-card-icon coaching">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="charts-grid">
                <div className="chart-card">
                  <h3 className="chart-title">Mood Trend</h3>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <XAxis dataKey="day" hide/>
                        <YAxis domain={[1,5]} ticks={[1,2,3,4,5]} />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="score" stroke="#fb7185" strokeWidth={3} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="chart-card">
                  <h3 className="chart-title">Mood Distribution</h3>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={distribution} dataKey="value" nameKey="name" outerRadius={80} label>
                          {distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Wellness Summary */}
              <div className="weekly-summary-card">
                <h3 className="weekly-summary-title">Wellness Summary</h3>
                <p className="weekly-summary-content">{weeklySummary}</p>
              </div>

              {/* Recent Activity & AI Conversations */}
              <div className="dashboard-bottom-grid">
                <div className="recent-activity">
                  <div className="recent-activity-header">
                    <h3 className="recent-activity-title">Recent Mood Entries</h3>
                    <div className="recent-activity-icon">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="activity-list">
                    {moods.slice(0, 5).map((mood, index) => (
                      <div key={index} className="activity-item">
                        <div className={`activity-icon ${mood.level}`}>
                          {getMoodIcon(mood.level, 'w-6 h-6')}
                        </div>
                        <div className="activity-content">
                          <span className={`activity-mood ${mood.level}`}>
                            {mood.level}
                          </span>
                          <p className="activity-note">{mood.note || 'No note'}</p>
                          <p className="activity-time">
                            {new Date(mood.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {moods.length === 0 && (
                      <div className="empty-state">
                        <div className="empty-state-icon">
                          <TrendingUp className="w-10 h-10" />
                        </div>
                        <h4 className="empty-state-title">No mood entries yet</h4>
                        <p className="empty-state-description">Start tracking your mood to see your wellness journey!</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="diary-preview-card">
                  <h3 className="diary-preview-title">Recent AI Conversations</h3>
                  <div className="diary-list">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="diary-item session-item" onClick={() => { setActiveTab('chat'); selectSession(session.id); }}>
                        <div className="session-item-header">
                          <span className="session-item-title">{session.title}</span>
                          <span className="session-item-date">{new Date(session.date).toLocaleDateString()}</span>
                        </div>
                        <p className="session-item-preview">{session.last_message_preview}</p>
                        <div className="session-item-meta">
                          <span className="session-item-count">{session.message_count} messages</span>
                          <span className="session-item-time">{new Date(session.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))}
                    {recentSessions.length === 0 && (
                      <p className="empty-diary">No conversations yet. Start chatting with your AI Assistant!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat */}
          {activeTab === 'chat' && (
            <div className="assistant">
              <div className="chat-layout">
                {/* Session History Sidebar */}
                <div className="chat-sidebar">
                  <div className="chat-sidebar-header">
                    <h3 className="chat-sidebar-title">Conversations</h3>
                    <button 
                      onClick={createNewSession}
                      className="new-session-button"
                      title="Start new conversation"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="chat-sessions-list">
                    {chatSessions.map((dateGroup) => (
                      <div key={dateGroup.date} className="date-group">
                        <div className="date-header">
                          {new Date(dateGroup.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                        {dateGroup.sessions.map((session) => (
                          <div 
                            key={session.id} 
                            className={`chat-session-item ${selectedSessionId === session.id ? 'active' : ''}`}
                          >
                            <div className="session-content" onClick={() => selectSession(session.id)}>
                              <div className="session-title">{session.title}</div>
                              <div className="session-meta">
                                <span className="session-message-count">{session.message_count} messages</span>
                                <span className="session-time">
                                  {new Date(session.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                            <button 
                              className="delete-session-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Are you sure you want to delete this conversation?')) {
                                  deleteChatSession(session.id)
                                }
                              }}
                              title="Delete conversation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                    {chatSessions.length === 0 && (
                      <div className="empty-sessions">
                        <MessageCircle className="w-8 h-8" />
                        <p>No conversations yet</p>
                        <p>Start a new chat to begin!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="chat-main">
                  <div className="chat-header">
                    <h3 className="chat-title">AI Assistant</h3>
                    <p className="chat-subtitle">Your mental wellness companion</p>
                  </div>
                  <div className="chat-messages">
                    {messages.map((message) => (
                      <div key={message.id} className={`message ${message.type === 'user' ? 'user' : 'assistant'}`}>
                        <div className="message-bubble">
                          <p className="message-content">{message.content}</p>
                          <p className="message-timestamp">
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="chat-input-container">
                    <div className="chat-input-form">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="chat-input"
                        disabled={loading}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={loading || !inputMessage.trim()}
                        className="send-button"
                      >
                        <Send className="send-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mood Tracker */}
          {activeTab === 'mood' && (
            <div className="mood-tracker">
              <div className="mood-header">
                <h2 className="mood-title">Mood Tracker</h2>
                <p className="mood-subtitle">Track your emotional well-being and reflect on your daily experiences</p>
              </div>
              
              <div className="mood-form-card">
                <h3 className="mood-form-title">Log Your Mood</h3>
                <form className="mood-form">
                  <div className="mood-input-group">
                    <label className="mood-label">How are you feeling?</label>
                    <div className="mood-level-selector">
                      {['excellent', 'good', 'okay', 'poor', 'terrible'].map((mood) => (
                        <button
                          key={mood}
                          type="button"
                          onClick={() => setSelectedMood(mood)}
                          className={`mood-level-button ${selectedMood === mood ? 'selected' : ''}`}
                        >
                          <div className="mood-level-content">
                            {getMoodIcon(mood)}
                            <span className="capitalize">{mood}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mood-input-group">
                    <label className="mood-label">Add a note (optional)</label>
                    <textarea
                      value={moodNote}
                      onChange={(e) => setMoodNote(e.target.value)}
                      placeholder="What's on your mind? Share your thoughts..."
                      className="mood-textarea"
                      rows="4"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={logMood}
                    disabled={!selectedMood}
                    className="mood-submit-button"
                  >
                    {selectedMood ? `Log ${selectedMood} mood` : 'Select a mood first'}
                  </button>
                </form>
              </div>

              <div className="mood-history-card">
                <h3 className="mood-history-title">Mood History</h3>
                <div className="mood-list">
                  {moods.map((mood, index) => (
                    <div key={index} className="mood-item">
                      {editingMood === mood.id ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-gray-800">Edit Mood Entry</h4>
                            <div className="flex space-x-2">
                              <button
                                onClick={saveEditMood}
                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEditMood}
                                className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {['excellent', 'good', 'okay', 'poor', 'terrible'].map((moodLevel) => (
                              <button
                                key={moodLevel}
                                onClick={() => setEditMoodLevel(moodLevel)}
                                className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 font-medium ${
                                  editMoodLevel === moodLevel 
                                    ? 'border-amber-500 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' 
                                    : 'border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-gray-700'
                                }`}
                              >
                                {moodLevel}
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={editMoodNote}
                            onChange={(e) => setEditMoodNote(e.target.value)}
                            placeholder="Update your note..."
                            className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white/80"
                            rows="3"
                          />
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getMoodColor(mood.level).split(' ')[1]} shadow-lg`}>
                              {getMoodIcon(mood.level)}
                            </div>
                            <div>
                              <span className={`px-4 py-2 rounded-full text-sm font-bold ${getMoodColor(mood.level)}`}>
                                {mood.level}
                              </span>
                              <p className="text-gray-700 mt-2 font-medium">{mood.note || 'No note'}</p>
                              <p className="text-sm text-amber-600 font-medium mt-1">
                                {new Date(mood.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-amber-200">
                              <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{getMoodScore(mood.level)}/10</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEditMood(mood)}
                                className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteMood(mood.id)}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {moods.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-br from-amber-200 to-orange-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <TrendingUp className="w-12 h-12 text-amber-600" />
                      </div>
                      <p className="text-amber-600 font-bold text-xl mb-2">No mood entries yet</p>
                      <p className="text-gray-500 text-lg">Start tracking your mood to see your wellness journey!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

              {/* Community */}
              {activeTab === 'community' && (
                <div className="community">
                  <div className="community-header">
                    <h2 className="community-title">Community Forum</h2>
                    <p className="community-subtitle">Share your experiences and connect with others on their wellness journey</p>
                  </div>

                  {/* Create Post */}
                  <div className="create-post">
                    <h3 className="create-post-title">Share Your Experience</h3>
                    <form className="post-form" onSubmit={(e) => { e.preventDefault(); createPost(); }}>
                      <div className="form-group">
                        <label className="form-label">Post Title</label>
                        <input
                          type="text"
                          placeholder="Post title..."
                          value={newPost.title}
                          onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                          className="form-input"
                          required
                        />
                        <label className="form-label">Share your thoughts</label>
                        <textarea
                          placeholder="Share your thoughts, experiences, or ask for advice..."
                          value={newPost.content}
                          onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                          className="form-textarea"
                          rows="4"
                          required
                        />
                        <div className="form-actions">
                          <select
                            value={newPost.category}
                            onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                            className="form-input"
                          >
                            <option value="general">General</option>
                            <option value="support">Support</option>
                            <option value="success">Success Story</option>
                            <option value="question">Question</option>
                          </select>
                          <label className="post-form-checkbox">
                            <input
                              type="checkbox"
                              checked={newPost.is_anonymous}
                              onChange={(e) => setNewPost({...newPost, is_anonymous: e.target.checked})}
                            />
                            <span className="post-form-checkbox-label">Post anonymously</span>
                          </label>
                          <button
                            type="submit"
                            className="post-submit-button"
                          >
                            <Plus className="w-4 h-4 inline mr-2" />
                            Share Post
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Sorting and Filter Controls */}
                  <div className="community-filters">
                    <div className="filters-header">
                      <h3 className="filters-title">Community Posts</h3>
                      <div className="filters-controls">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="filter-select"
                        >
                          <option value="latest">Latest</option>
                          <option value="most_liked">Most Liked</option>
                          <option value="most_commented">Most Commented</option>
                        </select>
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="filter-select"
                        >
                          <option value="all">All Categories</option>
                          <option value="general">General</option>
                          <option value="support">Support</option>
                          <option value="success">Success Stories</option>
                          <option value="question">Questions</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Posts List */}
                  <div className="posts-grid">
                    {posts.map((post) => (
                      <div key={post.id} className="post-card">
                        <div className="post-header">
                          <div className="post-author">
                            <div className="post-meta">
                              <h4 className="post-title">{post.title}</h4>
                              <p className="post-content">{post.content}</p>
                              <div className="post-stats">
                                <span className={`post-category post-category-${post.category}`}>
                                  {post.category}
                                </span>
                                <Tooltip content={post.author?.display_name || 'Anonymous'}>
                                  <span className="post-author-name">{post.author?.display_name || 'Anonymous'}</span>
                                </Tooltip>
                                <span className="post-date">{new Date(post.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="post-footer">
                          <div className="post-actions">
                            <button
                              onClick={() => likePost(post.id)}
                              className="post-action-button post-action-like"
                            >
                              <Heart className="post-action-icon" />
                              <span>{post.likes_count}</span>
                            </button>
                            <button
                              onClick={() => fetchPostDetails(post.id)}
                              className="post-action-button post-action-comment"
                            >
                              <MessageSquare className="post-action-icon" />
                              <span>{post.comments_count}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Post Details Modal for comments */}
                  {selectedPost && (
                    <div className="modal-overlay" onClick={() => { setSelectedPost(null); setReplyToId(null); }}>
                      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                          <h4 className="modal-title">{selectedPost.title}</h4>
                          <button className="modal-close" onClick={() => { setSelectedPost(null); setReplyToId(null); }}>×</button>
                        </div>
                        <div className="p-4 space-y-4">
                          <p className="text-gray-700">{selectedPost.content}</p>
                          <div className="text-sm text-gray-500 flex gap-4">
                            <span>{selectedPost.author?.display_name || 'Anonymous'}</span>
                            <span>{new Date(selectedPost.created_at).toLocaleString()}</span>
                            <span className={`post-category post-category-${selectedPost.category}`}>{selectedPost.category}</span>
                          </div>

                          <hr className="my-2" />
                          <h5 className="font-semibold">Comments</h5>

                          <div className="space-y-3">
                            {selectedPost.comments?.length === 0 && (
                              <p className="text-gray-500">No comments yet. Be the first to reply.</p>
                            )}

                            {selectedPost.comments?.map((c) => (
                              <div key={c.id} className="border border-gray-100 rounded-xl p-3">
                                <div className="text-sm text-gray-600 mb-1">
                                  <Tooltip content={c.author?.display_name || 'User'}>
                                    <span className="font-medium mr-2">{c.author?.display_name || 'User'}</span>
                                  </Tooltip>
                                  <span>{new Date(c.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-gray-800">{c.content}</p>
                                <div className="mt-2">
                                  <button className="text-sm text-blue-600 hover:underline" onClick={() => setReplyToId(c.id)}>Reply</button>
                                </div>
                                {c.replies && c.replies.length > 0 && (
                                  <div className="mt-3 space-y-2 pl-4 border-l border-gray-200">
                                    {c.replies.map((r) => (
                                      <div key={r.id} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                                        <div className="text-sm text-gray-600 mb-1">
                                          <Tooltip content={r.author?.display_name || 'User'}>
                                            <span className="font-medium mr-2">{r.author?.display_name || 'User'}</span>
                                          </Tooltip>
                                          <span>{new Date(r.created_at).toLocaleString()}</span>
                                        </div>
                                        <p className="text-gray-800">{r.content}</p>
                                        <div className="mt-2">
                                          <button className="text-sm text-blue-600 hover:underline" onClick={() => setReplyToId(c.id)}>Reply</button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="mt-4">
                            <div className="form-group">
                              <label className="form-label">{replyToId ? 'Reply to comment' : 'Add a comment'}</label>
                              <textarea
                                className="form-textarea"
                                rows="3"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={replyToId ? 'Write your reply…' : 'Write a comment…'}
                              />
                              <div className="form-actions">
                                {replyToId && (
                                  <button className="cancel-button" type="button" onClick={() => setReplyToId(null)}>Cancel reply</button>
                                )}
                                <button className="submit-button" type="button" onClick={() => addComment(selectedPost.id)}>Post</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Coaching */}
              {activeTab === 'coaching' && (
                <div className="coaching">
                  <div className="coaching-header">
                    <h1 className="coaching-title">Coaching & Mentoring</h1>
                    <p className="coaching-subtitle">Connect with professional mental health coaches</p>
                  </div>

                  {/* Available Coaches */}
                  <div className="coaches-section">
                    <h3 className="coaches-title">Available Coaches</h3>
                    <div className="coaches-grid">
                      {coaches.map((coach) => (
                        <div key={coach.id} className="coach-card">
                          <div className="coach-header">
                            <Tooltip content={coach.display_name}>
                              <div className="coach-avatar">
                                {coach.display_name.charAt(0)}
                              </div>
                            </Tooltip>
                            <div className="coach-info">
                              <Tooltip content={coach.display_name}>
                                <h4 className="coach-name">{coach.display_name}</h4>
                              </Tooltip>
                              <span className="coach-badge">Verified Coach</span>
                            </div>
                          </div>
                          <p className="coach-bio">{coach.bio || 'Professional mental health coach'}</p>
                          <button
                            onClick={() => setNewSession({...newSession, coach_id: coach.id})}
                            className="coach-request-button"
                          >
                            Request Session
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Request Coaching Session */}
                  {newSession.coach_id && (
                    <div className="request-session">
                      <h3 className="request-session-title">Request Coaching Session</h3>
                      <form className="session-form" onSubmit={(e) => { e.preventDefault(); createCoachingSession(); }}>
                        <div className="session-form-group">
                          <label className="session-form-label">Session Title</label>
                          <input
                            type="text"
                            placeholder="What would you like to work on?"
                            value={newSession.title}
                            onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                            className="session-form-input"
                            required
                          />
                        </div>
                        
                        <div className="session-form-group">
                          <label className="session-form-label">Description</label>
                          <textarea
                            placeholder="Tell us more about what you'd like to focus on in this session..."
                            value={newSession.description}
                            onChange={(e) => setNewSession({...newSession, description: e.target.value})}
                            className="session-form-textarea"
                            rows={4}
                            required
                          />
                        </div>
                        
                        <div className="session-form-group">
                          <label className="session-form-label">Preferred Date & Time</label>
                          <input
                            type="datetime-local"
                            value={newSession.scheduled_at}
                            onChange={(e) => setNewSession({...newSession, scheduled_at: e.target.value})}
                            className="session-form-input"
                            required
                          />
                        </div>
                        
                        <div className="session-form-actions">
                          <button
                            type="button"
                            onClick={() => setNewSession({...newSession, coach_id: null})}
                            className="btn btn-secondary"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="session-submit-button"
                          >
                            Request Session
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* My Coaching Sessions */}
                  <div className="sessions-section">
                    <h3 className="sessions-title">My Coaching Sessions</h3>
                    <div className="sessions-list">
                      {coachingSessions.map((session) => (
                        <div key={session.id} className="session-card">
                          <div className="session-header">
                            <h4 className="session-title">{session.title}</h4>
                            <span className={`session-status ${session.status}`}>
                              {session.status}
                            </span>
                          </div>
                          {editingSessionId === session.id ? (
                            <div className="session-form" style={{marginTop:'0.5rem'}}>
                              <div className="session-form-group">
                                <label className="session-form-label">Title</label>
                                <input className="session-form-input" value={editSessionData.title} onChange={(e)=>setEditSessionData({...editSessionData,title:e.target.value})} />
                              </div>
                              <div className="session-form-group">
                                <label className="session-form-label">Description</label>
                                <textarea className="session-form-textarea" rows={3} value={editSessionData.description} onChange={(e)=>setEditSessionData({...editSessionData,description:e.target.value})} />
                              </div>
                              <div className="session-form-group">
                                <label className="session-form-label">Scheduled At</label>
                                <input type="datetime-local" className="session-form-input" value={editSessionData.scheduled_at} onChange={(e)=>setEditSessionData({...editSessionData,scheduled_at:e.target.value})} />
                              </div>
                              <div className="session-form-actions">
                                <button className="btn btn-secondary" type="button" onClick={()=>setEditingSessionId(null)}>Cancel</button>
                                <button className="session-submit-button" type="button" onClick={()=>saveEditSession(session.id)}>Save</button>
                              </div>
                            </div>
                          ) : (
                            <p className="session-description">{session.description}</p>
                          )}
                          <div className="session-meta">
                            <div className="session-participants">
                              <User className="w-4 h-4" />
                              <Tooltip content={session.coach.display_name}>
                                <span>Coach: {session.coach.display_name}</span>
                              </Tooltip>
                            </div>
                            <div className="session-schedule">
                              <Clock className="w-4 h-4" />
                              <span>{session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : 'TBD'}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => openCoachingSession(session)}
                            className="session-view-button"
                          >
                            Open Session {presence === 'online' && '(Online)'} {typing && '· typing…'}
                          </button>
                          <div className="flex gap-2 mt-2">
                            {editingSessionId !== session.id && (
                              <button className="btn btn-secondary" type="button" onClick={()=>startEditSession(session)}>Edit</button>
                            )}
                            <button className="btn btn-secondary" type="button" onClick={()=>cancelSession(session.id)}>Cancel Session</button>
                            <button className="btn btn-secondary" type="button" onClick={()=>deleteSession(session.id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                      {coachingSessions.length === 0 && (
                        <div className="empty-sessions">
                          <div className="empty-sessions-icon">
                            <MessageSquare className="w-10 h-10" />
                          </div>
                          <h4 className="empty-sessions-title">No coaching sessions yet</h4>
                          <p className="empty-sessions-description">Request a session with one of our coaches to get started!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedSession && (
                    <div className="session-modal">
                      <div className="session-modal-content">
                        <div className="session-header">
                          <h4 className="session-title">{selectedSession.title}</h4>
                          <span className={`session-status ${presence}`}>{presence === 'online' ? 'Online' : presence === 'away' ? 'Away' : 'Offline'}</span>
                        </div>
                        <p className="session-description">{selectedSession.description}</p>
                        <div className="chat-messages" style={{maxHeight:'40vh', overflowY:'auto', marginTop:'1rem'}}>
                          {(selectedSession.messages || []).map((m) => (
                            <div key={`m-${m.id}`} className={`message ${m.sender === 'coach' ? 'assistant' : 'user'}`}>
                              <div className="message-bubble">
                                <p className="message-content">{m.content}</p>
                                <p className="message-timestamp">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                          ))}
                          {rtMessages.map((m, idx) => (
                            <div key={`rt-${idx}`} className={`message ${m.sender_is_coach ? 'assistant' : 'user'}`}>
                              <div className="message-bubble">
                                <p className="message-content">{m.content}</p>
                                <p className="message-timestamp">just now</p>
                              </div>
                            </div>
                          ))}
                          {typing && (
                            <div className="message assistant">
                              <div className="message-bubble"><p className="message-content">Typing…</p></div>
                            </div>
                          )}
                        </div>
                        <div className="chat-input-container">
                          <div className="chat-input-form">
                            <input
                              type="text"
                              value={coachingMessage}
                              onChange={handleCoachingInputChange}
                              onKeyPress={(e) => e.key === 'Enter' && sendCoachingMessage()}
                              placeholder="Type a message to your coach..."
                              className="chat-input"
                            />
                            <button onClick={sendCoachingMessage} className="send-button">
                              <Send className="send-icon" />
                            </button>
                            <button onClick={() => setSelectedSession(null)} className="btn btn-secondary" style={{marginLeft:'0.5rem'}}>Close</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Resources */}
              {activeTab === 'resources' && (
                <div className="resources">
                  <div className="resources-header">
                    <h2 className="resources-title">Wellness Resources</h2>
                    <p className="resources-subtitle">Tools and exercises to support your mental well-being journey</p>
                  </div>
                  
                  <div className="resources-grid">
                    <div className="resource-card">
                      <div className="resource-icon">
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="resource-title">Breathing Exercises</h3>
                      <p className="resource-description">Guided breathing techniques to help reduce stress and anxiety.</p>
                      <button className="resource-link">
                        <span>Start Exercise</span>
                        <ArrowRight className="resource-link-icon" />
                      </button>
                    </div>
                    
                    <div className="resource-card">
                      <div className="resource-icon">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="resource-title">Mindfulness Meditation</h3>
                      <p className="resource-description">5-minute guided meditation sessions for daily practice.</p>
                      <button className="resource-link">
                        <span>Start Meditation</span>
                        <ArrowRight className="resource-link-icon" />
                      </button>
                    </div>
                    
                    <div className="resource-card">
                      <div className="resource-icon">
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="resource-title">Gratitude Journal</h3>
                      <p className="resource-description">Daily prompts to help you focus on positive aspects of life.</p>
                      <button className="resource-link">
                        <span>Open Journal</span>
                        <ArrowRight className="resource-link-icon" />
                      </button>
                    </div>
                    
                    <div className="resource-card">
                      <div className="resource-icon">
                        <MessageCircle className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="resource-title">Sleep Stories</h3>
                      <p className="resource-description">Calming stories to help you relax and prepare for sleep.</p>
                      <button className="resource-link">
                        <span>Listen Now</span>
                        <ArrowRight className="resource-link-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
        </div>
      </div>

      {/* Coaching Session Popup */}
      <CoachingSessionPopup 
        isOpen={!!coachingSessionPopup} 
        onClose={closeCoachingSession} 
        session={coachingSessionPopup}
        currentUser={currentUser}
      />
    </div>
  )
}

export default App
