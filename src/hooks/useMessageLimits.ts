import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase/config'
import { 
  FREE_MESSAGE_LIMIT, 
  FREE_CONVERSATIONS_LIMIT,
  type UsageLimits 
} from '../lib/types/limits'

export function useMessageLimits(userId: string): UsageLimits {
  const [counts, setCounts] = useState({
    messages: 0,
    conversations: 0,
    loading: true
  })

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Get conversations first
        const { data: conversations, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', userId)

        if (convError) throw convError

        const conversationIds = conversations.map(c => c.id)

        // Get message count for user's conversations
        const { count: messageCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', conversationIds)

        setCounts({
          messages: messageCount || 0,
          conversations: conversations.length,
          loading: false
        })
      } catch (error) {
        console.error('Error fetching usage counts:', error)
        setCounts(prev => ({ ...prev, loading: false }))
      }
    }

    if (userId) {
      fetchCounts()

      // Subscribe to message changes in user's conversations
      const messageChannel = supabase
        .channel('messages-count')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages'
        }, () => {
          fetchCounts()
        })
        .subscribe()

      // Subscribe to conversation changes
      const conversationChannel = supabase
        .channel('conversations-count')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${userId}`
        }, () => {
          fetchCounts()
        })
        .subscribe()

      return () => {
        messageChannel.unsubscribe()
        conversationChannel.unsubscribe()
      }
    }
  }, [userId])

  return {
    ...counts,
    hasReachedMessageLimit: counts.messages >= FREE_MESSAGE_LIMIT,
    hasReachedConversationLimit: counts.conversations >= FREE_CONVERSATIONS_LIMIT,
    remainingMessages: Math.max(0, FREE_MESSAGE_LIMIT - counts.messages),
    remainingConversations: Math.max(0, FREE_CONVERSATIONS_LIMIT - counts.conversations)
  }
}
