import { useEffect, useState } from 'react'
import { User } from '../lib/types'

interface AuthState {
  user: User | null
  loading: boolean
  error: Error | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Here you would typically:
        // 1. Check for an existing session
        // 2. Validate the session with your backend
        // 3. Fetch the user data
        
        // For now, we'll simulate getting the user from localStorage
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setAuthState({
            user: JSON.parse(storedUser),
            loading: false,
            error: null
          })
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        setAuthState({
          user: null,
          loading: false,
          error: error as Error
        })
      }
    }

    checkAuth()
  }, [])

  const signIn = async (credentials: { email: string; password: string }) => {
    try {
      // Here you would typically:
      // 1. Send credentials to your backend
      // 2. Receive and store the session token
      // 3. Fetch the user data
      
      // For demo purposes, we'll just store a mock user
      const mockUser = {
        id: 'user_123',
        email: credentials.email,
        name: 'Demo User'
      }
      
      localStorage.setItem('user', JSON.stringify(mockUser))
      setAuthState({
        user: mockUser,
        loading: false,
        error: null
      })
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error as Error
      }))
    }
  }

  const signOut = async () => {
    try {
      // Here you would typically:
      // 1. Clear the session with your backend
      // 2. Clear local storage/cookies
      
      localStorage.removeItem('user')
      setAuthState({
        user: null,
        loading: false,
        error: null
      })
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error as Error
      }))
    }
  }

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signOut
  }
}
