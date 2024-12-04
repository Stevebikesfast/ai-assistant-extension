import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/config'

type SubscriptionStatus = 'loading' | 'free' | 'pro'

export function useSubscriptionStatus(userId?: string): { 
  status: SubscriptionStatus
  error: string | null
  isLoading: boolean
} {
  const [status, setStatus] = useState<SubscriptionStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setStatus('free')
      return
    }

    const checkStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', userId)
          .single()
        
        if (error) throw error
        
        setStatus(data?.subscription_status === 'active' ? 'pro' : 'free')
        setError(null)
      } catch (err) {
        console.error('Error checking subscription status:', err)
        setStatus('free')
        setError('Failed to check subscription status')
      }
    }

    checkStatus()

    // Subscribe to profile changes
    const channel = supabase
      .channel(`profile:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      }, () => {
        checkStatus()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [userId])

  return {
    status,
    error,
    isLoading: status === 'loading'
  }
}
