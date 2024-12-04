'use client'
import { motion } from 'framer-motion'

export function LoadingDots() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((dot) => (
        <motion.div
          key={dot}
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: dot * 0.2
          }}
        />
      ))}
    </div>
  )
}

export function LoadingPulse() {
  return (
    <motion.div
      className="w-full h-full bg-gray-200 rounded-lg"
      animate={{
        opacity: [0.3, 0.6, 0.3]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

export function ThinkingAnimation() {
  return (
    <div className="flex items-center gap-2 text-gray-500 p-3 bg-gray-50 rounded-lg">
      <span className="text-sm">Assistant is thinking</span>
      <LoadingDots />
    </div>
  )
}

export function MessageSkeleton() {
  return (
    <div className="space-y-3">
      <motion.div 
        className="w-2/3 h-6 bg-gray-200 rounded"
        animate={{
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="w-1/2 h-6 bg-gray-200 rounded"
        animate={{
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2
        }}
      />
    </div>
  )
}
