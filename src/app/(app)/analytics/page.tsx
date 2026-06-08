import { createClient } from '@/lib/supabase/server'
import { AnalyticsDashboard } from './analytics-dashboard'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: snapshots }, { data: deals }] = await Promise.all([
    supabase.from('metrics_snapshots').select('*').eq('user_id', user!.id).order('snapshot_date', { ascending: false }),
    supabase.from('deals').select('*').eq('user_id', user!.id).neq('status', 'cancelled'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Analytics</h1>
        <p className="text-zinc-400">Your metrics, rate card calculator, and revenue tracking.</p>
      </div>
      <AnalyticsDashboard snapshots={snapshots ?? []} deals={deals ?? []} userId={user!.id} />
    </div>
  )
}
