import { NextResponse } from 'next/server'
import { stripe } from '../../../../lib/stripe/config'
import { supabase } from '../../../../lib/supabase/config'
import type { Stripe } from 'stripe'

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Session ID is required' 
        },
        { status: 400 }
      )
    }

    // Retrieve and verify the session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment not completed',
          status: session.payment_status
        },
        { status: 400 }
      )
    }

    // Get customer details
    const customerId = session.customer as string
    const customer = await stripe.customers.retrieve(customerId)

    // Check if customer is deleted
    if (customer.deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Customer not found or deleted'
        },
        { status: 400 }
      )
    }

    // Get subscription details if available
    let subscription = null
    if (session.subscription) {
      subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    }

    // Return success with detailed information
    return NextResponse.json({
      success: true,
      data: {
        session: {
          id: session.id,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          currency: session.currency
        },
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name
        },
        subscription: subscription ? {
          id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end
        } : null
      }
    })
  } catch (error) {
    console.error('Error verifying session:', error)
    
    // Handle Stripe errors specifically
    if (error instanceof stripe.errors.StripeError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          type: error.type
        },
        { status: 400 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}
