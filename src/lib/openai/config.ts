import OpenAI from 'openai'
import { supabase } from '../supabase/client'

const getOpenAIKey = async () => {
  const { data } = await supabase
    .from('api_keys')
    .select('key')
    .eq('key_type', 'openai')
    .single()
  return data?.key
}

export const initOpenAI = async () => {
  const apiKey = await getOpenAIKey()
  return new OpenAI({ apiKey })
}
