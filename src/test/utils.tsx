import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
global.fetch = mockFetch

// Mock chrome storage
export const mockChromeStorage = {
  local: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn()
  },
  sync: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn()
  }
}

// Mock chrome runtime
export const mockChromeRuntime = {
  id: 'test-extension-id',
  getManifest: jest.fn(() => ({ version: '1.0.0' })),
  connect: jest.fn(),
  sendMessage: jest.fn(),
  onMessage: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn()
  },
  onConnect: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    hasListener: jest.fn()
  }
}

// Setup chrome mock
export function setupChromeMock() {
  global.chrome = {
    storage: mockChromeStorage,
    runtime: mockChromeRuntime
  } as any

  return {
    storage: mockChromeStorage,
    runtime: mockChromeRuntime
  }
}

// Clear all mocks
export function clearMocks() {
  jest.clearAllMocks()
  mockChromeStorage.local.get.mockReset()
  mockChromeStorage.local.set.mockReset()
  mockChromeRuntime.sendMessage.mockReset()
  mockChromeRuntime.onMessage.addListener.mockReset()
  mockFetch.mockReset()
}

// Custom render with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <>{children}</>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock message queue
export const mockMessageQueue = {
  getQueue: jest.fn(),
  addMessage: jest.fn(),
  removeMessage: jest.fn(),
  retryMessage: jest.fn(),
  clearQueue: jest.fn()
}

// Create test message
export function createTestMessage(overrides = {}) {
  return {
    id: 'test-id',
    content: 'test message',
    conversationId: 'test-conversation',
    retryCount: 0,
    timestamp: Date.now(),
    status: 'pending',
    ...overrides
  }
}

// Wait for promises
export const waitForPromises = () => new Promise(resolve => setTimeout(resolve, 0))

// Create mock Response
function createMockResponse(status = 200, data = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

// Mock fetch implementations
export const mockFetchImplementations = {
  success: () => mockFetch.mockImplementationOnce(() => 
    Promise.resolve(createMockResponse(200))
  ),
  error: (message = 'Network error') => 
    mockFetch.mockRejectedValueOnce(new Error(message)),
  timeout: (delay = 10000) => mockFetch.mockImplementationOnce(() => 
    new Promise(resolve => 
      setTimeout(() => resolve(createMockResponse(200)), delay)
    )
  ),
  notFound: () => mockFetch.mockImplementationOnce(() => 
    Promise.resolve(createMockResponse(404, { error: 'Not found' }))
  ),
  serverError: () => mockFetch.mockImplementationOnce(() => 
    Promise.resolve(createMockResponse(500, { error: 'Server error' }))
  )
}

// Mock response helpers
export function mockResponse(status = 200, data = {}) {
  return Promise.resolve(createMockResponse(status, data))
}

export function mockErrorResponse(status = 500, message = 'Internal Server Error') {
  return Promise.reject(new Error(message))
}

export * from '@testing-library/react'
export { customRender as render, mockFetch }
export { userEvent }
