import { supabase } from '../supabase/client'

export const createConversation = async (
  user_id: string,
  assistant_id: string,
  task_id: string
) => {
  const { data } = await supabase
    .from('conversations')
    .insert({ user_id, assistant_id, task_id })
    .select()
    .single()
  
  return data
}

export const getConversationMessages = async (conversation_id: string) => {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversation_id)
    .order('created_at')
  
  return data
}
