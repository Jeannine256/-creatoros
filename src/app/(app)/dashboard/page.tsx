import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, DEAL_STATUSES } from '@/lib/utils'
import { TrendingUp, Handshake, DollarSign, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: deals }, { data: upcoming }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('deals').select('*, sponsors(name)').eq('user_id', user!.id).neq('status', 'cancelled'),
    supabase.from('deals').select('*, sponsors(name)').eq('user_id', user!.id)
      .not('deliverable_due_at', 'is', null)
      .gte('deliverable_due_at', new Date().toISOString())
      .order('deliverable_due_at', { ascending: true })
      .limit(5),
  ])

  const activeDeals = deals?.filter(d => !['paid', 'cancelled'].includes(d.status)) ?? []
  const totalPipeline = deals?.reduce((sum, d) => sum + (d.value ?? 0), 0) ?? 0
  const paidThisMonth = deals?.filter(d => {
    if (d.status !== 'paid' || !d.paid_at) return false
    const paid = new Date(d.paid_at)
    const now = new Date()
    return paid.getMonth() === now.getMonth() && paid.getFullYear() === now.getFullYear()
  }).reduce((sum, d) => sum + (d.value ?? 0), 0) ?? 0

  const statusMap = Object.fromEntries(DEAL_STATUSES.map(s => [s.value, s]))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          {profile?.full_name?.split(' ')[0] ?? 'Creator'} 👋
        </h1>
        <p className="text-zinc-400">Here&apos;s your creator business at a glance.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Active Deals</p>
                <p className="mt-1 text-3xl font-bold text-zinc-100">{activeDeals.length}</p>
              </div>
              <div className="rounded-lg bg-violet-600/20 p-2"><Handshake className="h-4 w-4 text-violet-400" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Pipeline Value</p>
                <p className="mt-1 text-3xl font-bold text-zinc-100">{formatCurrency(totalPipeline)}</p>
              </div>
              <div className="rounded-lg bg-blue-600/20 p-2"><TrendingUp className="h-4 w-4 text-blue-400" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Earned This Month</p>
                <p className="mt-1 text-3xl font-bold text-zinc-100">{formatCurrency(paidThisMonth)}</p>
              </div>
              <div className="rounded-lg bg-green-600/20 p-2"><DollarSign className="h-4 w-4 text-green-400" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Upcoming Deadlines</p>
                <p className="mt-1 text-3xl font-bold text-zinc-100">{upcoming?.length ?? 0}</p>
              </div>
              <div className="rounded-lg bg-orange-600/20 p-2"><Calendar className="h-4 w-4 text-orange-400" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming deadlines */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
            <Link href="/sponsorships" className="flex items-center gap-1 text-xs text-violet-400 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {upcoming && upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{deal.title}</p>
                      <p className="text-xs text-zinc-500">{(deal.sponsors as any)?.name ?? 'No sponsor'}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="warning" className="text-xs">{formatDate(deal.deliverable_due_at!)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No upcoming deadlines. Enjoy it while it lasts!</p>
            )}
          </CardContent>
        </Card>

        {/* Pipeline summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DEAL_STATUSES.filter(s => s.value !== 'cancelled').map(status => {
                const count = deals?.filter(d => d.status === status.value).length ?? 0
                const value = deals?.filter(d => d.status === status.value).reduce((s, d) => s + (d.value ?? 0), 0) ?? 0
                if (count === 0) return null
                return (
                  <div key={status.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${status.color}`} />
                      <span className="text-sm text-zinc-300">{status.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500">{count} deal{count !== 1 ? 's' : ''}</span>
                      <span className="text-sm font-medium text-zinc-100">{formatCurrency(value)}</span>
                    </div>
                  </div>
                )
              })}
              {(!deals || deals.length === 0) && (
                <p className="text-sm text-zinc-500">No deals yet. <Link href="/sponsorships" className="text-violet-400 hover:underline">Add your first deal →</Link></p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
