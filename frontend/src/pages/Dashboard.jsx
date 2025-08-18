import { useEffect, useState } from 'react'
import api from '../../api'
import Navbar from '../components/Navbar'
import MoodLogger from '../components/MoodLogger'

export default function Dashboard() {
  const [moods, setMoods] = useState([])

  useEffect(() => {
    api.get('/user/moods').then(res => setMoods(res.data)).catch(() => setMoods([]))
  }, [])

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Mood History</h2>
      <MoodLogger onLogged={() => {
        api.get('/user/moods').then(res => setMoods(res.data)).catch(() => {})
      }} />
      <div className="space-y-2">
        {moods.length === 0 ? (
          <p className="text-gray-500">No mood entries yet.</p>
        ) : (
          moods.map((mood, idx) => (
            <div key={idx} className="p-2 border rounded">
              <p><strong>Date:</strong> {new Date(mood.timestamp).toLocaleString()}</p>
              <p><strong>Mood:</strong> {mood.level}</p>
              <p><strong>Note:</strong> {mood.note}</p>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  )
}
