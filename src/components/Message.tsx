'use client'
import { motion, AnimatePresence } from 'framer-motion'
import TypingIndicator, { UserTypingIndicator } from './TypingIndicator'
import { MessageStatus } from './MessageInput'
import CopyButton from './CopyButton'
import type { Message as MessageType } from '@/lib/types'

interface MessageProps {
  message: MessageType
  isLatest: boolean
  status?: {
    sent: boolean
    delivered: boolean
    read: boolean
    error?: string
  }
}

export default function Message({ message, isLatest, status }: MessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`group relative mb-4 ${
        isUser ? 'ml-12' : 'mr-12'
      }`}
    >
      <div className={`
        p-4 rounded-lg relative
        ${isUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100'
        }
      `}>
        <AnimatePresence>
          {isLatest && !isUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-12 left-0"
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {message.content}
        </motion.div>

        {!isUser && (
          <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity -mr-10">
            <CopyButton text={message.content} />
          </div>
        )}

        <div className="absolute bottom-0 right-0 transform translate-y-full mt-1 flex items-center gap-1">
          <motion.div
            className="text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {new Date(message.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </motion.div>
          {isUser && status && (
            <MessageStatus status={status} />
          )}
        </div>
      </div>
    </motion.div>
  )
}

interface ConversationProps {
  messages: MessageType[]
  isLoading?: boolean
  userTyping?: { name: string } | null
  messageStatuses?: Record<string, {
    sent: boolean
    delivered: boolean
    read: boolean
    error?: string
  }>
}

export function Conversation({ 
  messages, 
  isLoading = false,
  userTyping = null,
  messageStatuses = {}
}: ConversationProps) {
  return (
    <div className="flex flex-col space-y-4">
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            isLatest={isLoading && index === messages.length - 1}
            status={messageStatuses[message.id]}
          />
        ))}
        {userTyping && (
          <motion.div
            key="user-typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ml-4"
          >
            <UserTypingIndicator name={userTyping.name} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
