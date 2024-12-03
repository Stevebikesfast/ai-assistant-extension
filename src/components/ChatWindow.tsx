import { useState } from 'react'
import { Message } from '../lib/types/messages'

export default function ChatWindow({
  conversation_id,
  messages,
  onSendMessage
}: {
  conversation_id: string
  messages: Message[]
  onSendMessage: (content: string) => void
}) {
  const [input, setInput] = useState('')

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(message => (
          <div key={message.id}>
            {message.content}
          </div>
        ))}
      </div>
      <div className="border-t p-4">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              onSendMessage(input)
              setInput('')
            }
          }}
          className="w-full p-2 border rounded"
          placeholder="Type a message..."
        />
      </div>
    </div>
  )
}
