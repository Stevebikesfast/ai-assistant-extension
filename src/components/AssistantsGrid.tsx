'use client'
import { useEffect } from 'react'
import { useAsyncAction } from '@/hooks/useAsyncAction'
import { supabase } from '@/lib/supabase/config'
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus'
import { motion } from 'framer-motion'
import { FadeInStagger, fadeInVariants } from './FadeIn'
import AssistantCard from './AssistantCard'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import type { Assistant } from '@/lib/types'

interface AssistantsGridProps {
  onSelectAssistant?: (assistant: Assistant) => void
}

export default function AssistantsGrid({ onSelectAssistant }: AssistantsGridProps) {
  const { status, error, data: assistants, execute } = useAsyncAction<Assistant[]>()
  const { status: subscriptionStatus } = useSubscriptionStatus()

  const fetchAssistants = async () => {
    const { data, error } = await supabase
      .from('assistants')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) throw error
    return data || []
  }

  useEffect(() => {
    execute(fetchAssistants)
  }, [execute])

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
          message={error || 'Failed to load assistants'} 
          retry={() => execute(fetchAssistants)}
        />
      </div>
    )
  }

  if (!assistants?.length) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        No assistants available
      </div>
    )
  }

  const isPro = subscriptionStatus === 'pro'

  return (
    <FadeInStagger className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
      {assistants.map((assistant) => (
        <motion.div
          key={assistant.id}
          variants={fadeInVariants}
          layout
          onClick={() => {
            if (!assistant.free && !isPro) return
            onSelectAssistant?.(assistant)
          }}
          className={`cursor-pointer ${(!assistant.free && !isPro) ? 'cursor-not-allowed' : ''}`}
        >
          <AssistantCard 
            assistant={assistant}
            locked={!assistant.free && !isPro}
          />
        </motion.div>
      ))}
    </FadeInStagger>
  )
}
