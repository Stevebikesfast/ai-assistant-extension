export type MessageStatus = 'pending' | 'sending' | 'failed' | 'sent'

export interface QueuedMessage {
  id: string
  content: string
  timestamp: number
  retryCount: number
  conversationId: string
  assistantId?: string
  status: MessageStatus
  error?: string
  lockUntil?: number
}

class MessageQueue {
  private static instance: MessageQueue
  private processingLock: boolean = false
  private messageTimeouts: Map<string, NodeJS.Timeout> = new Map()

  private constructor() {}

  public static getInstance(): MessageQueue {
    if (!MessageQueue.instance) {
      MessageQueue.instance = new MessageQueue()
    }
    return MessageQueue.instance
  }

  private async acquireLock(): Promise<boolean> {
    if (this.processingLock) return false
    this.processingLock = true
    return true
  }

  private releaseLock(): void {
    this.processingLock = false
  }

  public async getQueue(): Promise<QueuedMessage[]> {
    try {
      const { messageQueue } = await chrome.storage.local.get('messageQueue')
      return messageQueue || []
    } catch (error) {
      console.error('Failed to load message queue:', error)
      return []
    }
  }

  private async saveQueue(queue: QueuedMessage[]): Promise<void> {
    try {
      await chrome.storage.local.set({ messageQueue: queue })
    } catch (error) {
      console.error('Failed to save message queue:', error)
    }
  }

  public async addMessage(message: Omit<QueuedMessage, 'retryCount' | 'timestamp' | 'status'>): Promise<QueuedMessage> {
    const queue = await this.getQueue()
    const newMessage: QueuedMessage = {
      ...message,
      retryCount: 0,
      timestamp: Date.now(),
      status: 'pending'
    }
    await this.saveQueue([...queue, newMessage])
    this.tryProcessQueue()
    return newMessage
  }

  public async removeMessage(id: string): Promise<void> {
    const queue = await this.getQueue()
    const newQueue = queue.filter(msg => msg.id !== id)
    await this.saveQueue(newQueue)
    
    // Clear any existing timeout
    const timeout = this.messageTimeouts.get(id)
    if (timeout) {
      clearTimeout(timeout)
      this.messageTimeouts.delete(id)
    }
  }

  public async updateMessage(id: string, updates: Partial<QueuedMessage>): Promise<void> {
    const queue = await this.getQueue()
    const newQueue = queue.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    )
    await this.saveQueue(newQueue)
  }

  public async retryMessage(id: string): Promise<void> {
    const queue = await this.getQueue()
    const newQueue = queue.map(msg => 
      msg.id === id ? {
        ...msg,
        retryCount: 0,
        status: 'pending' as MessageStatus,
        error: undefined,
        lockUntil: undefined
      } : msg
    )
    await this.saveQueue(newQueue)
    this.tryProcessQueue()
  }

  private calculateBackoffDelay(retryCount: number): number {
    const baseDelay = 1000 // 1 second
    const maxDelay = 60000 // 1 minute
    const delay = baseDelay * Math.pow(2, retryCount)
    return Math.min(delay, maxDelay)
  }

  private async tryProcessQueue(): Promise<void> {
    if (!await this.acquireLock()) return

    try {
      const queue = await this.getQueue()
      const now = Date.now()

      // Find the first unlocked message
      const messageToProcess = queue.find(msg => 
        msg.status === 'pending' && (!msg.lockUntil || msg.lockUntil < now)
      )

      if (!messageToProcess) {
        return
      }

      // Lock the message
      await this.updateMessage(messageToProcess.id, {
        status: 'sending',
        lockUntil: now + 30000 // 30 second lock
      })

      try {
        // Attempt to send
        await chrome.runtime.sendMessage({
          type: 'SEND_MESSAGE',
          payload: messageToProcess
        })

        // Success - remove from queue
        await this.removeMessage(messageToProcess.id)
      } catch (error) {
        const retryCount = messageToProcess.retryCount + 1
        const delay = this.calculateBackoffDelay(retryCount)

        // Update message with retry info
        await this.updateMessage(messageToProcess.id, {
          retryCount,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Failed to send message',
          lockUntil: now + delay
        })

        // Schedule retry
        const timeoutId = setTimeout(() => {
          this.messageTimeouts.delete(messageToProcess.id)
          this.tryProcessQueue()
        }, delay)
        
        this.messageTimeouts.set(messageToProcess.id, timeoutId)
      }
    } finally {
      this.releaseLock()
      
      // Check if there are more messages to process
      const remainingQueue = await this.getQueue()
      if (remainingQueue.length > 0) {
        this.tryProcessQueue()
      }
    }
  }

  public async clearQueue(): Promise<void> {
    // Clear all timeouts
    Array.from(this.messageTimeouts.values()).forEach(clearTimeout)
    this.messageTimeouts.clear()

    // Clear the queue
    await this.saveQueue([])
  }
}

export const messageQueue = MessageQueue.getInstance()
