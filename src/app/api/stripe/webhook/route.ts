import { supabase } from '../../../../lib/supabase/client'
import { stripe } from '../../../../lib/stripe/config'

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')
  const body = await req.text()

  const event = stripe.webhooks.constructEvent(
    body,
    sig!,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    await supabase
      .from('profiles')
      .update({ subscription_status: 'paid' })
      .eq('id', session.metadata.user_id)
  }

  return Response.json({ received: true })
}
