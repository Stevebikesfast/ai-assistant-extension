import { renderHook, act } from '@testing-library/react'
import { useOnlineStatus } from '../useOnlineStatus'
import { 
  setupChromeMock, 
  clearMocks, 
  mockFetch,
  mockFetchImplementations 
} from '@/test/utils'

describe('useOnlineStatus', () => {
  const { runtime } = setupChromeMock()

  beforeEach(() => {
    clearMocks()
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true
    })
    // Reset connection info
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: {
        type: 'wifi',
        effectiveType: '4g'
      }
    })
  })

  it('should initialize with navigator.onLine status', () => {
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current.isOnline).toBe(true)
  })

  it('should update status when going offline', () => {
    const { result } = renderHook(() => useOnlineStatus())

    act(() => {
      // Simulate offline event
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current.isOnline).toBe(false)
  })

  it('should update status when going online', () => {
    const { result } = renderHook(() => useOnlineStatus())

    // Start offline
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current.isOnline).toBe(false)

    // Go online
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(result.current.isOnline).toBe(true)
  })

  it('should check connection with fetch', async () => {
    mockFetchImplementations.success()

    const { result } = renderHook(() => useOnlineStatus())

    await act(async () => {
      await result.current.retry()
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.google.com/favicon.ico',
      expect.objectContaining({
        mode: 'no-cors'
      })
    )
    expect(result.current.isOnline).toBe(true)
  })

  it('should handle fetch failure', async () => {
    mockFetchImplementations.error('Network error')

    const { result } = renderHook(() => useOnlineStatus())

    await act(async () => {
      await result.current.retry()
    })

    expect(result.current.isOnline).toBe(false)
  })

  it('should handle fetch timeout', async () => {
    jest.useFakeTimers()

    mockFetchImplementations.timeout(10000) // Longer than timeout

    const { result } = renderHook(() => useOnlineStatus())

    const retryPromise = result.current.retry()
    
    // Fast-forward past the timeout
    act(() => {
      jest.advanceTimersByTime(6000)
    })

    await act(async () => {
      await retryPromise
    })

    expect(result.current.isOnline).toBe(false)

    jest.useRealTimers()
  })

  it('should check chrome runtime connection', async () => {
    mockFetchImplementations.success()

    const { result } = renderHook(() => useOnlineStatus())

    await act(async () => {
      await result.current.retry()
    })

    expect(runtime.connect).toHaveBeenCalled()
  })

  it('should handle chrome runtime errors', async () => {
    // Mock runtime.connect error
    runtime.connect.mockImplementationOnce(() => {
      throw new Error('Extension disconnected')
    })

    const { result } = renderHook(() => useOnlineStatus())

    await act(async () => {
      await result.current.retry()
    })

    expect(result.current.isOnline).toBe(false)
  })

  it('should detect connection type changes', () => {
    const { result } = renderHook(() => useOnlineStatus())

    act(() => {
      // Simulate connection type change
      Object.defineProperty(navigator, 'connection', {
        configurable: true,
        value: {
          type: 'cellular',
          effectiveType: '3g'
        }
      })
      // Trigger connection change event
      window.dispatchEvent(new Event('online'))
    })

    expect(result.current.type).toBe('cellular')
    expect(result.current.effectiveType).toBe('3g')
  })

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() => useOnlineStatus())
    
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
    
    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
  })

  it('should handle server errors gracefully', async () => {
    mockFetchImplementations.serverError()

    const { result } = renderHook(() => useOnlineStatus())

    await act(async () => {
      await result.current.retry()
    })

    expect(result.current.isOnline).toBe(false)
  })

  it('should handle 404 responses', async () => {
    mockFetchImplementations.notFound()

    const { result } = renderHook(() => useOnlineStatus())

    await act(async () => {
      await result.current.retry()
    })

    // Even with 404, we know the network is reachable
    expect(result.current.isOnline).toBe(true)
  })
})
