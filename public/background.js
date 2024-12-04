// Message queue management
const MAX_RETRIES = 3
const BASE_RETRY_DELAY = 1000
const BACKOFF_FACTOR = 2
const LOCK_TIMEOUT = 30000 // 30 seconds

let messageQueue = []
let isProcessing = false
let retryTimeouts = new Map()

// Error reporting
const errorQueue = []
const MAX_ERROR_QUEUE_SIZE = 100

async function reportError(error) {
  try {
    errorQueue.unshift({
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    })

    // Keep error queue size in check
    if (errorQueue.length > MAX_ERROR_QUEUE_SIZE) {
      errorQueue.pop()
    }

    // Save errors to storage
    await chrome.storage.local.set({ errorQueue })
  } catch (e) {
    console.error('Failed to save error:', e)
  }
}

async function loadQueue() {
  try {
    const { messageQueue: stored } = await chrome.storage.local.get('messageQueue')
    if (stored) {
      messageQueue = stored.map(msg => ({
        ...msg,
        status: msg.status === 'sending' ? 'pending' : msg.status // Reset hanging messages
      }))
      await saveQueue()
    }
  } catch (error) {
    console.error('Failed to load message queue:', error)
    await reportError(error)
  }
}

async function saveQueue() {
  try {
    await chrome.storage.local.set({ messageQueue })
    // Notify any open popups
    chrome.runtime.sendMessage({
      type: 'QUEUE_UPDATED',
      payload: { queue: messageQueue }
    }).catch(() => {}) // Ignore errors if no listeners
  } catch (error) {
    console.error('Failed to save message queue:', error)
    await reportError(error)
  }
}

function calculateBackoffDelay(retryCount) {
  return Math.min(
    BASE_RETRY_DELAY * Math.pow(BACKOFF_FACTOR, retryCount),
    60000 // Max 1 minute delay
  )
}

async function sendMessage(message) {
  const response = await fetch('https://api.example.com/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

async function processQueue() {
  if (isProcessing || messageQueue.length === 0) return
  isProcessing = true

  try {
    const now = Date.now()
    const messageToProcess = messageQueue.find(msg => 
      msg.status === 'pending' && (!msg.lockUntil || msg.lockUntil < now)
    )

    if (!messageToProcess) {
      return
    }

    // Clear any existing retry timeout
    if (retryTimeouts.has(messageToProcess.id)) {
      clearTimeout(retryTimeouts.get(messageToProcess.id))
      retryTimeouts.delete(messageToProcess.id)
    }

    // Lock and update status
    messageToProcess.status = 'sending'
    messageToProcess.lockUntil = now + LOCK_TIMEOUT
    await saveQueue()

    try {
      await sendMessage(messageToProcess)

      // Success - remove from queue
      messageQueue = messageQueue.filter(msg => msg.id !== messageToProcess.id)
      await saveQueue()

      // Notify success
      chrome.runtime.sendMessage({
        type: 'MESSAGE_SENT',
        payload: { id: messageToProcess.id }
      }).catch(() => {})

    } catch (error) {
      console.error('Failed to send message:', error)
      await reportError(error)

      const retryCount = (messageToProcess.retryCount || 0) + 1
      
      if (retryCount >= MAX_RETRIES) {
        // Max retries reached - mark as failed
        messageToProcess.status = 'failed'
        messageToProcess.error = error.message
        messageToProcess.lockUntil = undefined
        await saveQueue()

        chrome.runtime.sendMessage({
          type: 'MESSAGE_FAILED',
          payload: { 
            id: messageToProcess.id,
            error: error.message
          }
        }).catch(() => {})
      } else {
        // Schedule retry
        const delay = calculateBackoffDelay(retryCount)
        messageToProcess.retryCount = retryCount
        messageToProcess.status = 'pending'
        messageToProcess.lockUntil = now + delay
        await saveQueue()

        const timeoutId = setTimeout(() => {
          retryTimeouts.delete(messageToProcess.id)
          processQueue()
        }, delay)
        
        retryTimeouts.set(messageToProcess.id, timeoutId)

        chrome.runtime.sendMessage({
          type: 'MESSAGE_RETRY',
          payload: { 
            id: messageToProcess.id,
            retryCount,
            nextRetry: now + delay
          }
        }).catch(() => {})
      }
    }
  } catch (error) {
    console.error('Queue processing error:', error)
    await reportError(error)
  } finally {
    isProcessing = false
    // Process next message if available
    if (messageQueue.length > 0) {
      processQueue()
    }
  }
}

// Initialize
loadQueue().then(() => {
  if (messageQueue.length > 0) {
    processQueue()
  }
})

// Message handlers
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {
        case 'SEND_MESSAGE':
          messageQueue.push({
            ...message.payload,
            retryCount: 0,
            timestamp: Date.now(),
            status: 'pending'
          })
          await saveQueue()
          processQueue()
          sendResponse({ success: true })
          break

        case 'GET_QUEUE':
          sendResponse({ queue: messageQueue })
          break

        case 'RETRY_MESSAGE':
          const messageToRetry = messageQueue.find(m => m.id === message.payload.id)
          if (messageToRetry) {
            messageToRetry.retryCount = 0
            messageToRetry.status = 'pending'
            messageToRetry.error = undefined
            messageToRetry.lockUntil = undefined
            await saveQueue()
            processQueue()
            sendResponse({ success: true })
          } else {
            sendResponse({ success: false, error: 'Message not found' })
          }
          break

        case 'CLEAR_QUEUE':
          // Clear all retry timeouts
          Array.from(retryTimeouts.values()).forEach(clearTimeout)
          retryTimeouts.clear()
          messageQueue = []
          await saveQueue()
          sendResponse({ success: true })
          break

        case 'REPORT_ERROR':
          await reportError(message.payload.error)
          sendResponse({ success: true })
          break

        default:
          sendResponse({ error: 'Unknown message type' })
      }
    } catch (error) {
      console.error('Message handler error:', error)
      await reportError(error)
      sendResponse({ error: error.message })
    }
  })()
  return true // Keep channel open for async response
})

// Connection monitoring
let port = null

chrome.runtime.onConnect.addListener((p) => {
  port = p
  port.onDisconnect.addListener(() => {
    port = null
  })
})

// Network status monitoring
let isOnline = navigator.onLine

window.addEventListener('online', () => {
  isOnline = true
  if (messageQueue.length > 0) {
    processQueue()
  }
})

window.addEventListener('offline', () => {
  isOnline = false
})
