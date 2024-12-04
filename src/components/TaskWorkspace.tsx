'use client'
import { useState } from 'react'
import { Task } from '@/lib/types'
import PageTransition from './PageTransition'
import ChatWindow from './ChatWindow'

interface TaskWorkspaceProps {
  task: Task
  assistantId: string
  onBack: () => void
}

export default function TaskWorkspace({
  task,
  assistantId,
  onBack
}: TaskWorkspaceProps) {
  const [conversationId] = useState(() => crypto.randomUUID())

  return (
    <PageTransition id="task-workspace">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 transition-colors"
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
            <span className="sr-only">Back</span>
          </button>
          <div>
            <h2 className="font-bold text-gray-900">{task.title}</h2>
            <p className="text-sm text-gray-600 line-clamp-1">{task.description}</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow
            conversationId={conversationId}
            assistantId={assistantId}
          />
        </div>
      </div>
    </PageTransition>
  )
}
