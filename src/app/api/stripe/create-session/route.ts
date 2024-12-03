import { supabase } from '../../../../lib/supabase/client'
import { stripe } from '../../../../lib/stripe/config'

export async function POST(req: Request) {
  const { user_id } = await req.json()
  
  const { data: user } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user_id)
    .single()
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: process.env.STRIPE_PRICE_ID,
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    customer_email: user?.email,
    metadata: { user_id }
  })

  return Response.json({ url: session.url })
}
