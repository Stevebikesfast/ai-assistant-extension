'use client'
import { useState, useEffect } from 'react'
import { useConversation } from '@/hooks/useConversation'
import { useScrollToBottom } from '@/hooks/useScrollToBottom'
import { useAutoResizeTextArea } from '@/hooks/useScrollToBottom'
import { AsyncActionError } from '@/hooks/useAsyncAction'
import { Conversation } from './Message'
import { ThinkingAnimation } from './LoadingAnimation'
import ErrorMessage from './ErrorMessage'

interface ChatWindowProps {
  conversationId: string | null
  assistantId?: string
  onBeforeSend?: () => boolean | Promise<boolean>
  userName?: string
}

export default function ChatWindow({ 
  conversationId,
  assistantId,
  onBeforeSend,
  userName = 'You'
}: ChatWindowProps) {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const {
    conversation,
    status,
    error,
    sendMessage,
    isSending,
    sendError
  } = useConversation(conversationId)

  const messagesEndRef = useScrollToBottom(conversation?.messages)
  const textareaRef = useAutoResizeTextArea()

  // Debounced typing indicator
  useEffect(() => {
    if (!input.trim()) {
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    const timer = setTimeout(() => {
      setIsTyping(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return

    try {
      if (onBeforeSend) {
        const canSend = await onBeforeSend()
        if (!canSend) return
      }

      const message = input.trim()
      setInput('')
      setIsTyping(false)
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
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
      <div className="h-full flex items-center justify-center p-4">
        <ThinkingAnimation />
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

  if (!conversationId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select a task to start a conversation
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {conversation?.messages && (
          <Conversation 
            messages={conversation.messages}
            isLoading={isSending}
            userTyping={isTyping ? { name: userName } : null}
          />
        )}
        
        {sendError && (
          <div className="flex justify-center mt-4">
            <ErrorMessage 
              message="Failed to send message" 
              retry={() => sendMessage(input, assistantId)}
            />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-4">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 p-2 border rounded-lg resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <div className="flex items-center space-x-2">
                <span>Sending</span>
                <ThinkingAnimation />
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
