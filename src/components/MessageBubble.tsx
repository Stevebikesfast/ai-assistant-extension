'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Message } from '@/lib/types'
import CopyButton from './CopyButton'

interface MessageBubbleProps {
  message: Message
  isLatest?: boolean
}

export default function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className="group relative max-w-[80%]">
        <motion.div
          layout
          className={`
            p-3 rounded-lg
            ${isUser 
              ? 'bg-blue-500 text-white ml-auto' 
              : 'bg-gray-100 text-gray-900'
            }
          `}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={message.content}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {message.content}
            </motion.div>
          </AnimatePresence>

          {isLatest && !isUser && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              className="absolute bottom-0 left-0 h-[2px] bg-blue-500 opacity-50"
              layoutId="typing-indicator"
            />
          )}
        </motion.div>

        {!isUser && (
          <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity -mr-10">
            <CopyButton text={message.content} />
          </div>
        )}

        <motion.div
          className="absolute bottom-0 right-0 transform translate-y-full mt-1 text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {new Date(message.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </motion.div>
      </div>
    </motion.div>
  )
}

export function MessageGroup({ messages }: { messages: Message[] }) {
  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLatest={index === messages.length - 1}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
