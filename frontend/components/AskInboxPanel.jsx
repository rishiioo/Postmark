import { useState } from 'react'
import { Sparkles, Send, X } from 'lucide-react'

export function AskInboxPanel({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I'm your AI assistant. Ask me anything about your inbox, like 'What urgent emails did Acme Corp send today?'",
    },
  ])

  if (!isOpen) return null

  const handleSend = (e) => {
    e.preventDefault()
    if (!query.trim()) return

    const newMessages = [...messages, { sender: 'user', text: query }]
    setMessages(newMessages)
    setQuery('')

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Here is what I found regarding "${newMessages[newMessages.length - 1].text}": You have 1 unread message from Sarah Jenkins at Acme Corp concerning the Q3 Contract Renewal.`,
        },
      ])
    }, 600)
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-card border-l shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-base">Ask Inbox</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-muted-foreground hover:bg-secondary"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            <div
              className={`p-3 rounded-lg text-sm ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about your emails..."
          className="flex-1 px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
