'use client'
import { motion } from 'framer-motion'

export default function TypingIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg max-w-[100px]"
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{
              y: ['0%', '-50%', '0%']
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: dot * 0.2
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export function UserTypingIndicator({ name }: { name: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-2 p-2 text-sm text-gray-500"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs">{name} is typing</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="w-1.5 h-1.5 bg-gray-400 rounded-full"
              animate={{
                y: ['0%', '-50%', '0%']
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: dot * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
