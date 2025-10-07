import { useEffect, useState } from 'react'
import api from '../api'
import Navbar from '../components/Navbar'
import MoodLogger from '../components/MoodLogger'

export default function Dashboard() {
  const [moods, setMoods] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMoods = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setMoods([])
      setLoading(false)
      return
    }

    setLoading(true)
    api.get('/user/moods')
      .then(res => setMoods(res.data))
      .catch(err => {
        console.error('Failed to fetch moods:', err)
        setMoods([])
        // If it's a 401/422 error, redirect to login
        if (err.response?.status === 401 || err.response?.status === 422) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // Only fetch moods if we have a token
    const token = localStorage.getItem('token')
    if (token) {
      fetchMoods()
    } else {
      setLoading(false)
    }
  }, [])

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood Logger */}
          <div>
            <MoodLogger onMoodLogged={fetchMoods} />
          </div>
          
          {/* Mood History */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Mood History</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading ? (
                <p className="text-gray-500">Loading moods...</p>
              ) : moods.length === 0 ? (
                <p className="text-gray-500">No mood entries yet.</p>
              ) : (
                moods.map((mood, idx) => (
                  <div key={idx} className="p-3 border rounded bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium capitalize">{mood.level}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(mood.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {mood.note && (
                      <p className="text-sm text-gray-600">{mood.note}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
