'use client'
import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase/config'
import { useAsyncAction } from '../../../hooks/useAsyncAction'
import LoadingSpinner from '../../../components/LoadingSpinner'
import ErrorMessage from '../../../components/ErrorMessage'

interface VerificationResult {
  success: boolean
  data?: {
    session: {
      id: string
      payment_status: string
      amount_total: number
      currency: string
    }
    customer: {
      id: string
      email: string
      name: string | null
    }
    subscription: {
      id: string
      status: string
      current_period_end: number
      cancel_at_period_end: boolean
    } | null
  }
}

export default function Success() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { execute, status, error, data } = useAsyncAction<VerificationResult>()

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      router.push('/dashboard')
      return
    }

    const verifySession = async () => {
      try {
        await execute(async () => {
          // Verify with Stripe
          const response = await fetch('/api/stripe/verify-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          })

          if (!response.ok) {
            throw new Error('Failed to verify payment')
          }

          const result = await response.json()

          if (!result.success) {
            throw new Error(result.error || 'Payment verification failed')
          }

          // Update user subscription status in Supabase
          const { error: dbError } = await supabase
            .from('user_subscriptions')
            .upsert({
              updated_at: new Date().toISOString(),
              status: 'active',
              stripe_session_id: sessionId
            })

          if (dbError) {
            throw new Error('Failed to update subscription status')
          }

          return result
        })

        // Redirect after successful verification
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } catch (error) {
        // Error is handled by useAsyncAction
        console.error('Verification error:', error)
      }
    }

    verifySession()
  }, [searchParams, router, execute])

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6 text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <LoadingSpinner />
            <p className="text-lg">Verifying your subscription...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Thank You!</h1>
            <p className="text-gray-600">Your subscription is now active.</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <ErrorMessage
            message={error || 'An unexpected error occurred'}
            retry={() => router.push('/dashboard')}
          />
        )}
      </div>
    </div>
  )
}
