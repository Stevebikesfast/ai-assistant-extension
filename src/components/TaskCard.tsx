'use client'
import { motion } from 'framer-motion'
import type { Task } from '@/lib/types'

interface TaskCardProps {
  task: Task
  onClick: () => void
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="w-full p-4 border rounded-lg text-left hover:shadow-lg transition-shadow bg-white group"
    >
      <div className="flex items-center gap-2 mb-2">
        <motion.div 
          className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${task.status === 'completed' 
              ? 'bg-green-100 text-green-600' 
              : 'bg-blue-100 text-blue-600'
            }
            group-hover:bg-opacity-75 transition-colors
          `}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          {task.status === 'completed' ? (
            <motion.svg 
              className="w-4 h-4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          ) : (
            <span>📋</span>
          )}
        </motion.div>
        <div>
          <motion.h4 
            className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors"
            layout
          >
            {task.title}
          </motion.h4>
          <motion.span 
            className="text-xs text-gray-500"
            layout
          >
            {new Date(task.created_at).toLocaleDateString()}
          </motion.span>
        </div>
      </div>
      <motion.p 
        className="text-sm text-gray-600 line-clamp-2"
        layout
      >
        {task.description}
      </motion.p>
      <motion.div 
        className="mt-2"
        layout
      >
        <span className={`
          inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
          ${task.status === 'completed' 
            ? 'bg-green-100 text-green-800' 
            : task.status === 'in_progress'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }
          transition-colors
        `}>
          {task.status.replace('_', ' ')}
        </span>
      </motion.div>
    </motion.button>
  )
}
