'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Assistant, Task } from '../lib/types'
import AssistantCard from '../components/AssistantCard'
import TaskCard from '../components/TaskCard'
import ChatWindow from '../components/ChatWindow'

export default function Home() {
  const [assistant, setAssistant] = useState<Assistant>()
  const [tasks, setTasks] = useState<Task[]>([])

  return (
    <main className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Add components */}
      </div>
    </main>
  )
}
