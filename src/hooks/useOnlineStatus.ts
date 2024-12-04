import { useState, useEffect, useCallback } from 'react'

interface ConnectionStatus {
  isOnline: boolean
  type?: 'wifi' | 'cellular' | 'unknown'
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
  lastChecked?: Date
}

interface NetworkConnection {
  type: ConnectionStatus['type']
  effectiveType: ConnectionStatus['effectiveType']
}

class ConnectionError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message)
    this.name = 'ConnectionError'
  }
}

export function useOnlineStatus() {
  const [status, setStatus] = useState<ConnectionStatus>(() => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    type: 'unknown',
    lastChecked: new Date()
  }))

  const checkConnection = useCallback(async () => {
    try {
      // Try to connect to background page
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        const port = chrome.runtime.connect()
        port.disconnect()
      }

      // Try to fetch a tiny resource to verify connection
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      try {
        await fetch('https://www.google.com/favicon.ico', {
          mode: 'no-cors',
          signal: controller.signal
        })
        clearTimeout(timeoutId)
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new ConnectionError('Connection check timed out', 'TIMEOUT')
          }
          throw new ConnectionError(error.message, 'FETCH_ERROR')
        }
        throw new ConnectionError('Unknown error occurred', 'UNKNOWN')
      }

      // Get connection info if available
      let type: ConnectionStatus['type'] = 'unknown'
      let effectiveType: ConnectionStatus['effectiveType']

      if ('connection' in navigator && navigator.connection) {
        const conn = navigator.connection as unknown as NetworkConnection
        type = conn.type
        effectiveType = conn.effectiveType
      }

      setStatus({
        isOnline: true,
        type,
        effectiveType,
        lastChecked: new Date()
      })

      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Connection check failed'
      console.error('Connection check failed:', message)
      
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        lastChecked: new Date()
      }))
      return false
    }
  }, [])

  useEffect(() => {
    const handleOnline = () => {
      checkConnection()
    }

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        lastChecked: new Date()
      }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check connection periodically when online
    let intervalId: NodeJS.Timeout
    if (status.isOnline) {
      intervalId = setInterval(checkConnection, 30000) // Check every 30 seconds
    }

    // Initial check
    checkConnection()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (intervalId) clearInterval(intervalId)
    }
  }, [checkConnection, status.isOnline])

  const retry = useCallback(async () => {
    return checkConnection()
  }, [checkConnection])

  return {
    ...status,
    retry
  }
}
