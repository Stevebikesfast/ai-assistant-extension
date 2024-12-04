import { useState, useEffect, useCallback } from 'react'
import { messageQueue, QueuedMessage, MessageStatus } from '@/lib/queue/messageQueue'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

interface UseMessageQueueOptions {
  onStatusChange?: (messageId: string, status: MessageStatus) => void
  onError?: (messageId: string, error: string) => void
}

export function useMessageQueue(options: UseMessageQueueOptions = {}) {
  const [queue, setQueue] = useState<QueuedMessage[]>([])
  const [processing, setProcessing] = useState(false)
  const { isOnline } = useOnlineStatus()

  // Load and sync queue
  useEffect(() => {
    let mounted = true

    const syncQueue = async () => {
      try {
        const currentQueue = await messageQueue.getQueue()
        if (mounted) {
          setQueue(currentQueue)
          setProcessing(currentQueue.some(msg => msg.status === 'sending'))
        }
      } catch (error) {
        console.error('Failed to sync queue:', error)
      }
    }

    syncQueue()

    // Listen for queue updates from background script
    const handleMessage = (message: any) => {
      if (!message || typeof message !== 'object') return

      switch (message.type) {
        case 'MESSAGE_SENT':
          options.onStatusChange?.(message.payload.id, 'sent')
          syncQueue()
          break

        case 'MESSAGE_FAILED':
          options.onError?.(message.payload.id, message.payload.error)
          syncQueue()
          break

        case 'MESSAGE_RETRY':
          options.onStatusChange?.(message.payload.id, 'pending')
          syncQueue()
          break

        case 'QUEUE_UPDATED':
          syncQueue()
          break
      }
    }

    if (chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(handleMessage)
    }

    return () => {
      mounted = false
      if (chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(handleMessage)
      }
    }
  }, [options])

  const addToQueue = useCallback(async (
    content: string,
    conversationId: string,
    assistantId?: string
  ) => {
    try {
      const message = await messageQueue.addMessage({
        id: crypto.randomUUID(),
        content,
        conversationId,
        assistantId
      })
      setQueue(prev => [...prev, message])
      return message
    } catch (error) {
      console.error('Failed to add message to queue:', error)
      throw error
    }
  }, [])

  const removeFromQueue = useCallback(async (id: string) => {
    try {
      await messageQueue.removeMessage(id)
      setQueue(prev => prev.filter(msg => msg.id !== id))
    } catch (error) {
      console.error('Failed to remove message from queue:', error)
      throw error
    }
  }, [])

  const retryMessage = useCallback(async (id: string) => {
    try {
      await messageQueue.retryMessage(id)
      setQueue(prev => prev.map(msg => 
        msg.id === id ? {
          ...msg,
          retryCount: 0,
          status: 'pending',
          error: undefined,
          lockUntil: undefined
        } : msg
      ))
    } catch (error) {
      console.error('Failed to retry message:', error)
      throw error
    }
  }, [])

  const clearQueue = useCallback(async () => {
    try {
      await messageQueue.clearQueue()
      setQueue([])
    } catch (error) {
      console.error('Failed to clear queue:', error)
      throw error
    }
  }, [])

  return {
    queue,
    processing,
    isOnline,
    addToQueue,
    removeFromQueue,
    retryMessage,
    clearQueue,
    pendingCount: queue.filter(msg => msg.status === 'pending').length,
    failedCount: queue.filter(msg => msg.status === 'failed').length
  }
}

export type { QueuedMessage, MessageStatus }
