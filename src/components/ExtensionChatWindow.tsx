'use client'
import { useState, useRef, useEffect } from 'react'
import { useConversation } from '@/hooks/useConversation'
import { AsyncActionError } from '@/hooks/useAsyncAction'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import CopyButton from './CopyButton'
import type { Message } from '@/lib/types'

interface ExtensionChatWindowProps {
  conversationId: string | null
  assistantId?: string
}

export default function ExtensionChatWindow({ 
  conversationId,
  assistantId 
}: ExtensionChatWindowProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const {
    conversation,
    status,
    error,
    sendMessage,
    isSending,
    sendError
  } = useConversation(conversationId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return

    try {
      const message = input.trim()
      setInput('')
      await sendMessage(message, assistantId)
    } catch (error) {
      console.error('Send message error:', 
        error instanceof AsyncActionError 
          ? `${error.message} (${error.code})` 
          : error
      )
    }
  }

  if (status === 'loading') {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <ErrorMessage message={error || 'Failed to load conversation'} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {conversation?.messages.map((message: Message) => (
          <div key={message.id} className="group relative">
            <div 
              className={`p-2 rounded-lg text-sm ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white ml-auto' 
                  : 'bg-gray-100'
              }`}
            >
              {message.content}
            </div>
            {message.role === 'assistant' && (
              <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton text={message.content} />
              </div>
            )}
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-2">
              <LoadingSpinner />
            </div>
          </div>
        )}
        {sendError && (
          <div className="flex justify-center">
            <ErrorMessage 
              message="Failed to send message" 
              retry={() => sendMessage(input, assistantId)}
            />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <div className="flex items-center space-x-1">
                <LoadingSpinner />
                <span>...</span>
              </div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
