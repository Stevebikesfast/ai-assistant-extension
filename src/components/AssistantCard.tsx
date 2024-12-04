'use client'
import { motion } from 'framer-motion'
import UpgradeButton from './UpgradeButton'
import type { Assistant } from '@/lib/types'

interface AssistantCardProps {
  assistant: Assistant
  locked?: boolean
}

export default function AssistantCard({ 
  assistant,
  locked = false
}: AssistantCardProps) {
  return (
    <motion.div
      whileHover={{ scale: locked ? 1 : 1.02 }}
      whileTap={{ scale: locked ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`
        relative p-4 border rounded-lg bg-white
        ${locked ? 'opacity-75' : 'hover:shadow-lg'}
        transition-shadow duration-200
      `}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {assistant.avatar_url ? (
            <motion.img 
              src={assistant.avatar_url} 
              alt={assistant.name}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          ) : (
            <span className="text-xl font-semibold text-gray-500">
              {assistant.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{assistant.name}</h3>
          <p className="text-sm text-gray-600">AI Assistant</p>
        </div>
      </div>
      
      <p className="text-sm text-gray-700 line-clamp-2">{assistant.description}</p>

      {assistant.capabilities && assistant.capabilities.length > 0 && (
        <motion.div 
          className="mt-3 flex flex-wrap gap-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {assistant.capabilities.slice(0, 2).map((capability, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {capability}
            </span>
          ))}
          {assistant.capabilities.length > 2 && (
            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded-full">
              +{assistant.capabilities.length - 2}
            </span>
          )}
        </motion.div>
      )}

      {locked && (
        <motion.div 
          className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-center p-4">
            <motion.div 
              className="mb-2 text-2xl"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 10, 0]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              🔒
            </motion.div>
            <p className="text-sm text-gray-600 mb-3">
              Upgrade to unlock this assistant
            </p>
            <UpgradeButton />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
