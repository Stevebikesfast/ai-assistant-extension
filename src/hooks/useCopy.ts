import { useState } from 'react'
import toast from 'react-hot-toast'

export function useCopy() {
  const [copying, setCopying] = useState(false)

  const copyToClipboard = async (text: string) => {
    if (copying) return

    try {
      setCopying(true)
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    } finally {
      setCopying(false)
    }
  }

  return {
    copying,
    copyToClipboard
  }
}
