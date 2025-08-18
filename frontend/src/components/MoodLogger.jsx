import { useState } from 'react'
import api from '../../api'

export default function MoodLogger({ onLogged }) {
  const [level, setLevel] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!level.trim()) return
    setSaving(true)
    try {
      await api.post('/user/moods', { level, note })
      setLevel('')
      setNote('')
      onLogged && onLogged()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Log Mood</h3>
      <div className="flex space-x-2 mb-2">
        <input value={level} onChange={e => setLevel(e.target.value)} placeholder="Mood level (e.g., Happy, Stressed)" />
        <button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
      <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add an optional note" />
    </div>
  )
}
