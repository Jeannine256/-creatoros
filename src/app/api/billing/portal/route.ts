import { createClient } from '@/lib/supabase/server'

export async function GET() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return new Response('Billing not configured', { status: 503 })
  }

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).single()

  if (!profile?.stripe_customer_id) {
    return Response.redirect(process.env.NEXT_PUBLIC_APP_URL + '/settings')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  })

  return Response.redirect(session.url)
}
