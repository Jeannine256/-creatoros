import { createClient } from '@/lib/supabase/server'
import { DealBoard } from './deal-board'

export default async function SponsorshipsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: deals }, { data: sponsors }] = await Promise.all([
    supabase.from('deals').select('*, sponsors(name, contact_email)').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('sponsors').select('id, name').eq('user_id', user!.id).order('name'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Sponsorships</h1>
        <p className="text-zinc-400">Your full deal pipeline from pitch to payment.</p>
      </div>
      <DealBoard initialDeals={deals ?? []} sponsors={sponsors ?? []} />
    </div>
  )
}
