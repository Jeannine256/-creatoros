import { createClient } from '@/lib/supabase/server'
import { CalendarView } from './calendar-view'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: items }, { data: deals }] = await Promise.all([
    supabase.from('content_items').select('*, deals(title, sponsors(name))').eq('user_id', user!.id).order('publish_date', { ascending: true }),
    supabase.from('deals').select('id, title, deliverable_due_at, status').eq('user_id', user!.id).neq('status', 'cancelled').not('deliverable_due_at', 'is', null),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Content Calendar</h1>
        <p className="text-zinc-400">Plan your content around brand deals and deliverable deadlines.</p>
      </div>
      <CalendarView initialItems={items ?? []} deals={deals ?? []} />
    </div>
  )
}
