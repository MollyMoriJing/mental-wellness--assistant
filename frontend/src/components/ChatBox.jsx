import { useState } from 'react'
import api from '../../api'
import Navbar from './Navbar'

export default function ChatBox() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")

  const send = async () => {
    if (!input.trim()) return
    const res = await api.post('/chat', { message: input })
    setMessages([...messages, { user: input, bot: res.data.response }])
    setInput("")
  }

  return (
    <div>
      <Navbar />
      <div className="p-4 max-w-xl mx-auto">
      <div className="space-y-2">
        {messages.map((m, i) => (
          <div key={i} className="bg-gray-100 p-2 rounded">
            <p><strong>You:</strong> {m.user}</p>
            <p><strong>Assistant:</strong> {m.bot}</p>
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="How are you feeling today?"
        />
        <button
          onClick={send}
          className="ml-2 px-4 py-1 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </div>
      </div>
    </div>
  )
}