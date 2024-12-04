interface Window {
  chrome: typeof chrome
}

declare namespace chrome {
  export namespace storage {
    export interface StorageArea {
      get(keys?: string | string[] | object | null): Promise<{ [key: string]: any }>
      set(items: object): Promise<void>
      remove(keys: string | string[]): Promise<void>
      clear(): Promise<void>
    }

    export const local: StorageArea
    export const sync: StorageArea
  }

  export namespace runtime {
    export const id: string
    export function getManifest(): chrome.runtime.Manifest
    export function connect(extensionId?: string, connectInfo?: { name?: string }): Port
    export function sendMessage<T = any>(
      message: any,
      options?: { includeTlsChannelId?: boolean }
    ): Promise<T>
    export function sendMessage<T = any>(
      extensionId: string,
      message: any,
      options?: { includeTlsChannelId?: boolean }
    ): Promise<T>

    export const onConnect: {
      addListener(callback: (port: Port) => void): void
      removeListener(callback: (port: Port) => void): void
      hasListener(callback: (port: Port) => void): boolean
    }

    export const onMessage: {
      addListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => void | boolean
      ): void
      removeListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => void | boolean
      ): void
      hasListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => void | boolean
      ): boolean
    }
  }

  export interface MessageSender {
    tab?: chrome.tabs.Tab
    frameId?: number
    id?: string
    url?: string
    tlsChannelId?: string
  }

  export interface Port {
    name: string
    disconnect(): void
    postMessage(message: any): void
    onDisconnect: {
      addListener(callback: (port: Port) => void): void
      removeListener(callback: (port: Port) => void): void
      hasListener(callback: (port: Port) => void): boolean
    }
    onMessage: {
      addListener(callback: (message: any, port: Port) => void): void
      removeListener(callback: (message: any, port: Port) => void): void
      hasListener(callback: (message: any, port: Port) => void): boolean
    }
    sender?: MessageSender
  }

  export interface Manifest {
    name: string
    version: string
    manifest_version: number
    description: string
    permissions: string[]
    action: {
      default_popup: string
      default_title?: string
    }
    icons?: {
      [key: string]: string
    }
    background?: {
      service_worker: string
      type?: 'module'
    }
    host_permissions?: string[]
    web_accessible_resources?: Array<{
      resources: string[]
      matches: string[]
    }>
  }

  export namespace tabs {
    export interface Tab {
      id?: number
      index: number
      windowId: number
      highlighted: boolean
      active: boolean
      pinned: boolean
      url?: string
      title?: string
      favIconUrl?: string
      status?: string
      incognito: boolean
      width?: number
      height?: number
      sessionId?: string
    }
  }
}

declare const chrome: {
  storage: chrome.storage
  runtime: chrome.runtime
  tabs: chrome.tabs
}
