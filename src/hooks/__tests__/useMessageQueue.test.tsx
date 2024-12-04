import { renderHook, act } from '@testing-library/react'
import { useMessageQueue } from '../useMessageQueue'
import { messageQueue } from '@/lib/queue/messageQueue'
import { setupChromeMock, clearMocks, createTestMessage } from '@/test/utils'

// Mock messageQueue
jest.mock('@/lib/queue/messageQueue', () => ({
  messageQueue: {
    getQueue: jest.fn(),
    addMessage: jest.fn(),
    removeMessage: jest.fn(),
    retryMessage: jest.fn(),
    clearQueue: jest.fn()
  }
}))

describe('useMessageQueue', () => {
  const mockQueue = [createTestMessage()]

  beforeEach(() => {
    clearMocks()
    ;(messageQueue.getQueue as jest.Mock).mockResolvedValue(mockQueue)
  })

  it('should initialize with empty queue', async () => {
    const { result } = renderHook(() => useMessageQueue())

    // Initial state
    expect(result.current.queue).toEqual([])
    expect(result.current.processing).toBe(false)

    // Wait for queue to load
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.queue).toEqual(mockQueue)
  })

  it('should add message to queue', async () => {
    const newMessage = createTestMessage({
      id: '2',
      content: 'new message'
    })

    ;(messageQueue.addMessage as jest.Mock).mockResolvedValue(newMessage)

    const { result } = renderHook(() => useMessageQueue())

    await act(async () => {
      await result.current.addToQueue('new message', 'test-conversation')
    })

    expect(messageQueue.addMessage).toHaveBeenCalledWith({
      id: expect.any(String),
      content: 'new message',
      conversationId: 'test-conversation'
    })
  })

  it('should remove message from queue', async () => {
    const { result } = renderHook(() => useMessageQueue())

    await act(async () => {
      await result.current.removeFromQueue('1')
    })

    expect(messageQueue.removeMessage).toHaveBeenCalledWith('1')
  })

  it('should retry failed message', async () => {
    const { result } = renderHook(() => useMessageQueue())

    await act(async () => {
      await result.current.retryMessage('1')
    })

    expect(messageQueue.retryMessage).toHaveBeenCalledWith('1')
  })

  it('should clear queue', async () => {
    const { result } = renderHook(() => useMessageQueue())

    await act(async () => {
      await result.current.clearQueue()
    })

    expect(messageQueue.clearQueue).toHaveBeenCalled()
  })

  it('should handle queue status updates', async () => {
    const onStatusChange = jest.fn()
    const { result } = renderHook(() => useMessageQueue({ onStatusChange }))

    const { runtime } = setupChromeMock()

    // Simulate message status update
    await act(async () => {
      const messageHandler = runtime.onMessage.addListener.mock.calls[0][0]
      messageHandler({
        type: 'MESSAGE_SENT',
        payload: { id: '1' }
      })
    })

    expect(onStatusChange).toHaveBeenCalledWith('1', 'sent')
    expect(messageQueue.getQueue).toHaveBeenCalled()
  })

  it('should handle error notifications', async () => {
    const onError = jest.fn()
    const { result } = renderHook(() => useMessageQueue({ onError }))

    const { runtime } = setupChromeMock()

    // Simulate error notification
    await act(async () => {
      const messageHandler = runtime.onMessage.addListener.mock.calls[0][0]
      messageHandler({
        type: 'MESSAGE_FAILED',
        payload: { id: '1', error: 'Network error' }
      })
    })

    expect(onError).toHaveBeenCalledWith('1', 'Network error')
    expect(messageQueue.getQueue).toHaveBeenCalled()
  })

  it('should calculate pending and failed counts', async () => {
    const mockQueueWithStatus = [
      createTestMessage({ status: 'pending' }),
      createTestMessage({ id: '2', status: 'failed' }),
      createTestMessage({ id: '3', status: 'sent' })
    ]

    ;(messageQueue.getQueue as jest.Mock).mockResolvedValue(mockQueueWithStatus)

    const { result } = renderHook(() => useMessageQueue())

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.pendingCount).toBe(1)
    expect(result.current.failedCount).toBe(1)
  })
})
