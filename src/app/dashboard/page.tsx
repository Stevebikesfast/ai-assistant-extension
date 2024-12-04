'use client'
import { useState, useEffect } from 'react'
import { useAsyncAction } from '../../hooks/useAsyncAction'
import { supabase } from '../../lib/supabase/config'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import AssistantCard from '../../components/AssistantCard'
import TaskList from '../../components/TaskList'
import ChatWindow from '../../components/ChatWindow'
import type { Assistant } from '../../lib/types'

export default function Dashboard() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const { 
    status, 
    error, 
    data: assistant, 
    execute: fetchAssistant 
  } = useAsyncAction<Assistant>()

  useEffect(() => {
    fetchAssistant(async () => {
      const { data, error } = await supabase
        .from('assistants')
        .select('*')
        .eq('id', 'asst_ZfHROr8g5jAEZA3HgtpBd4VT')
        .single()

      if (error) throw error
      return data
    })
  }, [fetchAssistant])

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage 
          message={error || 'Failed to load assistant'} 
          retry={() => fetchAssistant(async () => {
            const { data, error } = await supabase
              .from('assistants')
              .select('*')
              .eq('id', 'asst_ZfHROr8g5jAEZA3HgtpBd4VT')
              .single()

            if (error) throw error
            return data
          })}
        />
      </div>
    )
  }

  if (!assistant) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No assistant found
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assistant and Tasks */}
        <div className="lg:col-span-1 space-y-6">
          <AssistantCard assistant={assistant} />
          <div className="bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold p-4 border-b">Tasks</h2>
            <TaskList 
              assistantId={assistant.id} 
              onSelectTask={handleTaskSelect} 
            />
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow min-h-[600px] flex flex-col">
          <h2 className="text-xl font-semibold p-4 border-b">
            {selectedTaskId ? 'Chat' : 'Select a Task'}
          </h2>
          <div className="flex-1">
            <ChatWindow conversationId={selectedTaskId} />
          </div>
        </div>
      </div>
    </div>
  )
}
