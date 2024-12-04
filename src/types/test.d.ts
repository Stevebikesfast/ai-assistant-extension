import '@testing-library/jest-dom'
import { jest } from '@jest/globals'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveClass(className: string): R
      toHaveStyle(style: Record<string, any>): R
      toBeVisible(): R
      toBeDisabled(): R
      toHaveTextContent(text: string | RegExp): R
      toHaveValue(value: string | number | string[]): R
    }
  }

  // Extend Window
  interface Window {
    chrome: typeof chrome
  }

  // Extend Chrome namespace
  namespace chrome {
    interface MockFunctions {
      addListener: jest.Mock
      removeListener: jest.Mock
      hasListener: jest.Mock
    }

    interface Runtime {
      id: string
      getManifest: jest.Mock
      connect: jest.Mock
      sendMessage: jest.Mock
      onMessage: MockFunctions
      onConnect: MockFunctions
    }

    interface StorageArea {
      get: jest.Mock
      set: jest.Mock
      remove: jest.Mock
      clear: jest.Mock
    }

    interface Storage {
      local: StorageArea
      sync: StorageArea
    }
  }

  const chrome: {
    runtime: chrome.Runtime
    storage: chrome.Storage
  }
}

// Extend Jest Expect
declare module 'expect' {
  interface AsymmetricMatchers {
    toBeInTheDocument(): void
    toHaveAttribute(attr: string, value?: string): void
    toHaveClass(className: string): void
    toHaveStyle(style: Record<string, any>): void
    toBeVisible(): void
    toBeDisabled(): void
    toHaveTextContent(text: string | RegExp): void
    toHaveValue(value: string | number | string[]): void
  }
  interface Matchers<R> {
    toBeInTheDocument(): R
    toHaveAttribute(attr: string, value?: string): R
    toHaveClass(className: string): R
    toHaveStyle(style: Record<string, any>): R
    toBeVisible(): R
    toBeDisabled(): R
    toHaveTextContent(text: string | RegExp): R
    toHaveValue(value: string | number | string[]): R
  }
}

// Extend Testing Library
declare module '@testing-library/react' {
  export interface RenderResult {
    asFragment: () => DocumentFragment
  }
}
