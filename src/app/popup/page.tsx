'use client'
import { useEffect, useState } from 'react'
import { getStorageValue, setStorageValue } from '@/lib/chrome/storage'
import AssistantsGrid from '@/components/AssistantsGrid'
import ExtensionChatWindow from '@/components/ExtensionChatWindow'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'
import type { Assistant } from '@/lib/types'

export default function PopupPage() {
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeState = async () => {
      try {
        // Get the active conversation and assistant from storage
        const [conversationId, assistantData] = await Promise.all([
          getStorageValue('activeConversation'),
          getStorageValue('selectedAssistant')
        ])

        if (assistantData) {
          setSelectedAssistant(assistantData)
        }
        setActiveConversation(conversationId)
      } catch (err) {
        console.error('Failed to initialize state:', err)
        setError('Failed to load previous session')
      } finally {
        setLoading(false)
      }
    }

    initializeState()
  }, [])

  const handleAssistantSelect = async (assistant: Assistant) => {
    try {
      setSelectedAssistant(assistant)
      await setStorageValue('selectedAssistant', assistant)
      
      // Create a new conversation if needed
      if (!activeConversation) {
        const newConversationId = 'temp_conversation_id'
        setActiveConversation(newConversationId)
        await setStorageValue('activeConversation', newConversationId)
      }
    } catch (err) {
      console.error('Failed to select assistant:', err)
      setError('Failed to start conversation')
    }
  }

  const handleBack = async () => {
    setSelectedAssistant(null)
    setActiveConversation(null)
    await Promise.all([
      setStorageValue('selectedAssistant', null),
      setStorageValue('activeConversation', null)
    ])
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <ErrorMessage message={error} />
      </div>
    )
  }

  if (selectedAssistant && activeConversation) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-2 border-b flex items-center">
          <button
            onClick={handleBack}
            className="p-1 text-gray-500 hover:text-gray-700"
            aria-label="Back to assistants"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="ml-2 font-medium">{selectedAssistant.name}</h2>
        </div>
        <div className="flex-1">
          <ExtensionChatWindow
            conversationId={activeConversation}
            assistantId={selectedAssistant.id}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <AssistantsGrid onSelectAssistant={handleAssistantSelect} />
    </div>
  )
}
