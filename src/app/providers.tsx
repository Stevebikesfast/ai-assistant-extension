'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase/client'

export function Providers({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    supabase.auth.onAuthStateChange(() => {
      setInitialized(true)
    })
  }, [])

  if (!initialized) return null

  return <>{children}</>
}
