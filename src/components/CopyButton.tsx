'use client'
import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
      aria-label={copied ? 'Copied!' : 'Copy message'}
    >
      {copied ? (
        <span className="text-green-500">Copied!</span>
      ) : (
        <span>Copy</span>
      )}
    </button>
  )
}
