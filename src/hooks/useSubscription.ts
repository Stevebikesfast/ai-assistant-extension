import { supabase } from '../lib/supabase/client'

export const useSubscription = () => {
  const checkSubscription = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', userId)
      .single()
    
    return data?.subscription_status === 'paid'
  }

  return { checkSubscription }
}
