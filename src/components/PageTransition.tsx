'use client'
import { motion, AnimatePresence } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
  id: string
}

export default function PageTransition({
  children,
  id
}: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ 
          duration: 0.2,
          ease: [0.25, 0.1, 0.25, 1]
        }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
