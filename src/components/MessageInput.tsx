'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTypingStatus } from '@/hooks/useTypingStatus'
import { useAutoResizeTextArea } from '@/hooks/useScrollToBottom'

interface MessageInputProps {
  onSend: (text: string) => void
  onTyping: () => void
  disabled?: boolean
  placeholder?: string
}

export default function MessageInput({ 
  onSend,
  onTyping,
  disabled = false,
  placeholder = 'Type a message...'
}: MessageInputProps) {
  const [input, setInput] = useState('')
  const { handleTyping } = useTypingStatus()
  const textareaRef = useAutoResizeTextArea()

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    handleTyping()
    onTyping()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || disabled) return

    onSend(input.trim())
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="w-full resize-none p-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {input && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute right-3 bottom-3 text-xs text-gray-400"
        >
          typing...
        </motion.div>
      )}
      <motion.button
        type="submit"
        disabled={disabled || !input.trim()}
        className="absolute right-2 top-2 p-2 text-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </motion.button>
    </form>
  )
}

export function MessageStatus({ 
  status 
}: { 
  status: { sent: boolean; delivered: boolean; read: boolean; error?: string } 
}) {
  if (status.error) {
    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-red-500 text-xs"
      >
        Error: {status.error}
      </motion.span>
    )
  }

  return (
    <motion.div 
      className="flex items-center gap-0.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {status.read ? (
        <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
          />
        </svg>
      ) : status.delivered ? (
        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
          />
        </svg>
      ) : status.sent ? (
        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
          />
        </svg>
      ) : null}
    </motion.div>
  )
}
