import { useEffect } from 'react'
import { useAsyncAction, AsyncActionError } from './useAsyncAction'
import { supabase } from '../lib/supabase/config'
import type { Conversation, Message } from '../lib/types'

export function useConversation(conversationId: string | null) {
  const {
    status,
    error,
    data: conversation,
    execute: fetchConversation,
    reset
  } = useAsyncAction<Conversation>()

  const {
    status: sendStatus,
    error: sendError,
    execute: executeMessage
  } = useAsyncAction<Message>()

  useEffect(() => {
    if (conversationId) {
      fetchConversation(async () => {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            messages:messages(*)
          `)
          .eq('id', conversationId)
          .single()

        if (error) {
          throw new AsyncActionError(
            'Failed to fetch conversation',
            'FETCH_ERROR',
            error
          )
        }

        if (!data) {
          throw new AsyncActionError(
            'Conversation not found',
            'NOT_FOUND'
          )
        }

        return data
      })
    } else {
      reset()
    }
  }, [conversationId, fetchConversation, reset])

  const sendMessage = async (content: string, assistantId?: string) => {
    if (!conversationId) {
      throw new AsyncActionError(
        'No conversation selected',
        'INVALID_STATE'
      )
    }

    const message = await executeMessage(async () => {
      // First, insert the user's message
      const { data: userMessage, error: userError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content,
          role: 'user',
          assistant_id: assistantId
        })
        .select()
        .single()

      if (userError) {
        throw new AsyncActionError(
          'Failed to save message',
          'DB_ERROR',
          userError
        )
      }

      // Then get assistant's response
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: content,
          assistant_id: assistantId
        })
      })

      if (!response.ok) {
        throw new AsyncActionError(
          'Failed to get assistant response',
          'API_ERROR',
          { status: response.status }
        )
      }

      // Refresh the conversation to get the new messages
      await fetchConversation(async () => {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            messages:messages(*)
          `)
          .eq('id', conversationId)
          .single()

        if (error) {
          throw new AsyncActionError(
            'Failed to refresh conversation',
            'FETCH_ERROR',
            error
          )
        }

        if (!data) {
          throw new AsyncActionError(
            'Conversation not found after update',
            'NOT_FOUND'
          )
        }

        return data
      })

      return userMessage
    })

    return message
  }

  return {
    conversation,
    status,
    error,
    sendMessage,
    sendStatus,
    sendError,
    isLoading: status === 'loading',
    isSending: sendStatus === 'loading'
  }
}
