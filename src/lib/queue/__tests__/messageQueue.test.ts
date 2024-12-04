import { messageQueue } from '../messageQueue'
import { setupChromeMock, clearMocks, createTestMessage, waitForPromises } from '@/test/utils'

describe('MessageQueue', () => {
  const { storage, runtime } = setupChromeMock()

  beforeEach(() => {
    clearMocks()
    storage.local.get.mockResolvedValue({ messageQueue: [] })
    storage.local.set.mockResolvedValue(undefined)
  })

  it('should add message to queue', async () => {
    const message = {
      id: 'test-id',
      content: 'test message',
      conversationId: 'test-conversation'
    }

    const queuedMessage = await messageQueue.addMessage(message)

    expect(queuedMessage).toEqual({
      ...message,
      retryCount: 0,
      timestamp: expect.any(Number),
      status: 'pending'
    })

    expect(storage.local.set).toHaveBeenCalledWith({
      messageQueue: [queuedMessage]
    })
  })

  it('should remove message from queue', async () => {
    const existingMessage = createTestMessage()

    storage.local.get.mockResolvedValueOnce({
      messageQueue: [existingMessage]
    })

    await messageQueue.removeMessage('test-id')

    expect(storage.local.set).toHaveBeenCalledWith({
      messageQueue: []
    })
  })

  it('should retry failed message', async () => {
    const failedMessage = createTestMessage({
      retryCount: 2,
      status: 'failed',
      error: 'Network error'
    })

    storage.local.get.mockResolvedValueOnce({
      messageQueue: [failedMessage]
    })

    await messageQueue.retryMessage('test-id')

    expect(storage.local.set).toHaveBeenCalledWith({
      messageQueue: [{
        ...failedMessage,
        retryCount: 0,
        status: 'pending',
        error: undefined,
        lockUntil: undefined
      }]
    })
  })

  it('should handle queue processing with backoff', async () => {
    jest.useFakeTimers()

    const message = createTestMessage()

    storage.local.get
      .mockResolvedValueOnce({ messageQueue: [message] }) // Initial get
      .mockResolvedValueOnce({ messageQueue: [message] }) // Before send
      .mockResolvedValueOnce({ messageQueue: [] }) // After success

    // Mock successful send
    runtime.sendMessage.mockResolvedValueOnce({ success: true })

    await messageQueue['tryProcessQueue']()
    
    expect(storage.local.set).toHaveBeenCalledWith({
      messageQueue: expect.arrayContaining([
        expect.objectContaining({
          id: 'test-id',
          status: 'sending'
        })
      ])
    })

    // Fast-forward timers
    jest.runAllTimers()

    expect(storage.local.set).toHaveBeenCalledWith({
      messageQueue: []
    })

    jest.useRealTimers()
  })

  it('should handle network errors with retry', async () => {
    const message = createTestMessage()

    storage.local.get
      .mockResolvedValueOnce({ messageQueue: [message] })
      .mockResolvedValueOnce({ messageQueue: [message] })

    // Mock failed send
    const error = new Error('Network error')
    runtime.sendMessage.mockRejectedValueOnce(error)

    await messageQueue['tryProcessQueue']()

    expect(storage.local.set).toHaveBeenCalledWith({
      messageQueue: expect.arrayContaining([
        expect.objectContaining({
          id: 'test-id',
          status: 'failed',
          retryCount: 1,
          error: 'Network error'
        })
      ])
    })
  })

  it('should respect max retries', async () => {
    const message = createTestMessage({
      retryCount: 3, // Max retries
      status: 'failed'
    })

    storage.local.get.mockResolvedValue({ messageQueue: [message] })

    await messageQueue['tryProcessQueue']()

    expect(storage.local.set).toHaveBeenCalledWith({
      messageQueue: []
    })

    expect(runtime.sendMessage).toHaveBeenCalledWith({
      type: 'MESSAGE_FAILED',
      payload: {
        id: 'test-id',
        error: 'Max retries exceeded'
      }
    })
  })

  it('should handle concurrent processing', async () => {
    const message1 = createTestMessage({ id: 'msg1' })
    const message2 = createTestMessage({ id: 'msg2' })

    storage.local.get.mockResolvedValue({ 
      messageQueue: [message1, message2] 
    })

    // Start two concurrent processing attempts
    const process1 = messageQueue['tryProcessQueue']()
    const process2 = messageQueue['tryProcessQueue']()

    await Promise.all([process1, process2])

    // Should only process one message at a time
    expect(runtime.sendMessage).toHaveBeenCalledTimes(1)
  })

  it('should clear queue and timeouts', async () => {
    const message = createTestMessage()
    storage.local.get.mockResolvedValue({ messageQueue: [message] })

    await messageQueue.clearQueue()

    expect(storage.local.set).toHaveBeenCalledWith({
      messageQueue: []
    })
  })
})
