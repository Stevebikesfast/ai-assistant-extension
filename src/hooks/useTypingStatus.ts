import { useState, useEffect, useCallback } from 'react'

export function useTypingStatus() {
  const [isTyping, setIsTyping] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>()

  const handleTyping = useCallback(() => {
    setIsTyping(true)
    if (timeoutId) clearTimeout(timeoutId)
    const newTimeoutId = setTimeout(() => setIsTyping(false), 1000)
    setTimeoutId(newTimeoutId)
  }, [timeoutId])

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [timeoutId])

  return { isTyping, handleTyping }
}

export interface MessageStatus {
  sent: boolean
  delivered: boolean
  read: boolean
  error?: string
  timestamp?: Date
}

export function useMessageStatus(messageId: string) {
  const [status, setStatus] = useState<MessageStatus>({
    sent: false,
    delivered: false,
    read: false
  })

  const updateStatus = useCallback((newStatus: Partial<MessageStatus>) => {
    setStatus(prev => ({
      ...prev,
      ...newStatus,
      timestamp: new Date()
    }))
  }, [])

  return {
    status,
    updateStatus,
    markAsSent: () => updateStatus({ sent: true }),
    markAsDelivered: () => updateStatus({ delivered: true }),
    markAsRead: () => updateStatus({ read: true }),
    markAsError: (error: string) => updateStatus({ error })
  }
}
