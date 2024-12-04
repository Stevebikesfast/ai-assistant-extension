import type { Assistant } from '@/lib/types'

interface ChromeStorage {
  activeConversation: string
  selectedAssistant: Assistant | null
}

type StorageKey = keyof ChromeStorage

export async function getStorageValue<K extends StorageKey>(
  key: K
): Promise<ChromeStorage[K] | null> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get([key])
      return result[key] || null
    }
    // Fallback for non-extension environment
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch (error) {
    console.error(`Error getting storage value for ${key}:`, error)
    return null
  }
}

export async function setStorageValue<K extends StorageKey>(
  key: K,
  value: ChromeStorage[K] | null
): Promise<void> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ [key]: value })
    } else {
      // Fallback for non-extension environment
      if (value === null) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify(value))
      }
    }
  } catch (error) {
    console.error(`Error setting storage value for ${key}:`, error)
  }
}

export async function removeStorageValue(key: StorageKey): Promise<void> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.remove(key)
    } else {
      localStorage.removeItem(key)
    }
  } catch (error) {
    console.error(`Error removing storage value for ${key}:`, error)
  }
}

// Type guard to check if we're in a Chrome extension context
export function isChromeExtension(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.runtime?.id
}
