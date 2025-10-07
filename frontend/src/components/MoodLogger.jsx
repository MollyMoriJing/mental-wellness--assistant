import React, { useState } from 'react'
import api from '../api'

export default function MoodLogger({ onMoodLogged }) {
  const [mood, setMood] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const moodOptions = [
    { value: 'excellent', label: '😊 Excellent' },
    { value: 'good', label: '😌 Good' },
    { value: 'okay', label: '😐 Okay' },
    { value: 'poor', label: '😔 Poor' },
    { value: 'terrible', label: '😢 Terrible' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!mood) return

    setLoading(true)
    setMessage('')
    
    try {
      await api.post('/user/moods', { level: mood, note: note.trim() || null })
      setMessage('Mood logged successfully!')
      setMood('')
      setNote('')
      if (onMoodLogged) onMoodLogged()
    } catch (error) {
      setMessage('Error logging mood. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">How are you feeling?</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Mood Level</label>
          <div className="space-y-2">
            {moodOptions.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="mood"
                  value={option.value}
                  checked={mood === option.value}
                  onChange={(e) => setMood(e.target.value)}
                  className="mr-2"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-2 border rounded"
            rows="3"
          />
        </div>

        <button
          type="submit"
          disabled={!mood || loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Logging...' : 'Log Mood'}
        </button>

        {message && (
          <p className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
