'use client'
import { useEffect } from 'react'
import { useAsyncAction } from '@/hooks/useAsyncAction'
import { supabase } from '@/lib/supabase/config'
import { motion } from 'framer-motion'
import { FadeInStagger, fadeInVariants } from './FadeIn'
import TaskCard from './TaskCard'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import type { Task } from '@/lib/types'

interface TaskGridProps {
  assistantId: string
  onSelectTask: (task: Task) => void
}

export default function TaskGrid({ assistantId, onSelectTask }: TaskGridProps) {
  const { status, error, data: tasks, execute } = useAsyncAction<Task[]>()

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assistant_id', assistantId)
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  useEffect(() => {
    execute(fetchTasks)
  }, [assistantId, execute])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="p-8">
        <ErrorMessage 
          message={error || 'Failed to load tasks'} 
          retry={() => execute(fetchTasks)}
        />
      </div>
    )
  }

  if (!tasks?.length) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        No tasks available for this assistant
      </div>
    )
  }

  return (
    <FadeInStagger className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <motion.div
          key={task.id}
          variants={fadeInVariants}
          layout
        >
          <TaskCard
            task={task}
            onClick={() => onSelectTask(task)}
          />
        </motion.div>
      ))}
    </FadeInStagger>
  )
}
