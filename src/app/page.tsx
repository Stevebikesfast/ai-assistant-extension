'use client'
import { useState } from 'react'
import PageTransition from '@/components/PageTransition'
import AssistantsGrid from '@/components/AssistantsGrid'
import TaskGrid from '@/components/TaskGrid'
import TaskWorkspace from '@/components/TaskWorkspace'
import type { Assistant, Task } from '@/lib/types'

export default function Home() {
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const getCurrentView = () => {
    if (selectedTask && selectedAssistant) return 'workspace'
    if (selectedAssistant) return 'tasks'
    return 'assistants'
  }

  return (
    <PageTransition id={getCurrentView()}>
      {selectedTask && selectedAssistant ? (
        <TaskWorkspace
          task={selectedTask}
          assistantId={selectedAssistant.id}
          onBack={() => setSelectedTask(null)}
        />
      ) : selectedAssistant ? (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <button 
              onClick={() => setSelectedAssistant(null)}
              className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2"
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
              <span>Back to Assistants</span>
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <TaskGrid
              assistantId={selectedAssistant.id}
              onSelectTask={setSelectedTask}
            />
          </div>
        </div>
      ) : (
        <AssistantsGrid onSelectAssistant={setSelectedAssistant} />
      )}
    </PageTransition>
  )
}
