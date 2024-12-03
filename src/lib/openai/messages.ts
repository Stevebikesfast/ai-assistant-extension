import { Message } from '../types/messages'
import { supabase } from '../supabase/client'
import { initOpenAI } from './config'

export const sendMessage = async (
  conversation_id: string,
  content: string,
  assistant_id: string
) => {
  const openai = await initOpenAI()

  // Store user message
  const { data: userMessage } = await supabase
    .from('messages')
    .insert({
      conversation_id,
      role: 'user', 
      content
    })
    .select()
    .single()

  // Use assistant
  const thread = await openai.beta.threads.create({
    messages: [{ role: 'user', content }]
  })

  const run = await openai.beta.threads.runs.create(
    thread.id,
    { assistant_id }
  )

  // Get and store response
  const response = await openai.beta.threads.messages.list(thread.id)
  const assistantMessage = response.data[0]

  return { userMessage, assistantMessage }
}
