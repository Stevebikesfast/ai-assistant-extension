'use client'
import { useEffect } from 'react'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { supabase } from '../lib/supabase/config'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import TaskCard from './TaskCard'
import type { Task } from '../lib/types'

interface TaskListProps {
  assistantId: string
  onSelectTask: (taskId: string) => void
}

export default function TaskList({ assistantId, onSelectTask }: TaskListProps) {
  const { 
    status, 
    error, 
    data: tasks, 
    execute,
    reset 
  } = useAsyncAction<Task[]>()

  useEffect(() => {
    if (assistantId) {
      execute(async () => {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('assistant_id', assistantId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data
      })
    } else {
      reset()
    }
  }, [assistantId, execute, reset])

  if (status === 'loading') {
    return (
      <div className="flex justify-center p-4">
        <LoadingSpinner />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="p-4">
        <ErrorMessage 
          message={error || 'Failed to load tasks'} 
          retry={() => execute(async () => {
            const { data, error } = await supabase
              .from('tasks')
              .select('*')
              .eq('assistant_id', assistantId)
              .order('created_at', { ascending: false })

            if (error) throw error
            return data
          })}
        />
      </div>
    )
  }

  if (!tasks?.length) {
    return (
      <div className="text-center p-4 text-gray-500">
        No tasks found for this assistant
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {tasks.map(task => (
        <TaskCard 
          key={task.id}
          task={task}
          onSelect={() => onSelectTask(task.id)}
        />
      ))}
    </div>
  )
}
