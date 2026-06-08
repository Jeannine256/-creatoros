'use client'

import { useState } from 'react'
import { Plus, TrendingUp, Users, Eye, Heart, Calculator } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, PLATFORMS } from '@/lib/utils'
import type { MetricsSnapshot, Deal } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface Props {
  snapshots: MetricsSnapshot[]
  deals: Deal[]
  userId: string
}

export function AnalyticsDashboard({ snapshots: initial, deals, userId }: Props) {
  const [snapshots, setSnapshots] = useState(initial)
  const [addingPlatform, setAddingPlatform] = useState(false)
  const [form, setForm] = useState({ platform: 'youtube', followers: '', avg_views: '', avg_likes: '', avg_comments: '' })
  const [saving, setSaving] = useState(false)

  // Rate card calculator state
  const [rateCalc, setRateCalc] = useState({ followers: '', avg_views: '', engagement_rate: '', platform: 'youtube' })

  const latest = snapshots.reduce((acc, s) => {
    if (!acc[s.platform] || s.snapshot_date > acc[s.platform].snapshot_date) acc[s.platform] = s
    return acc
  }, {} as Record<string, MetricsSnapshot>)

  async function saveSnapshot() {
    setSaving(true)
    const supabase = createClient()
    const followers = parseInt(form.followers) || 0
    const avg_views = parseInt(form.avg_views) || 0
    const avg_likes = parseInt(form.avg_likes) || 0
    const avg_comments = parseInt(form.avg_comments) || 0
    const engagement_rate = followers > 0 ? (avg_likes + avg_comments) / followers : 0

    const { data } = await supabase.from('metrics_snapshots').insert({
      user_id: userId, platform: form.platform, followers, avg_views, avg_likes, avg_comments, engagement_rate,
    }).select().single()

    if (data) setSnapshots(prev => [data, ...prev])
    setSaving(false)
    setAddingPlatform(false)
    setForm({ platform: 'youtube', followers: '', avg_views: '', avg_likes: '', avg_comments: '' })
  }

  // Rate card calculation
  function calculateRates() {
    const followers = parseInt(rateCalc.followers) || 0
    const views = parseInt(rateCalc.avg_views) || 0
    const er = parseFloat(rateCalc.engagement_rate) || 0
    const cpm = rateCalc.platform === 'youtube' ? 25 : rateCalc.platform === 'instagram' ? 15 : 10
    const dedicatedMultiplier = rateCalc.platform === 'youtube' ? 2.5 : 1.8
    const base = (views / 1000) * cpm
    return {
      story: Math.round(base * 0.4),
      integration: Math.round(base),
      dedicated: Math.round(base * dedicatedMultiplier),
      bundle: Math.round(base * dedicatedMultiplier * 1.4),
    }
  }

  const rates = calculateRates()
  const hasRateInput = rateCalc.avg_views && parseInt(rateCalc.avg_views) > 0

  // Revenue tracking
  const paidDeals = deals.filter(d => d.status === 'paid')
  const totalEarned = paidDeals.reduce((s, d) => s + (d.value ?? 0), 0)
  const currentYear = new Date().getFullYear()
  const yearDeals = paidDeals.filter(d => d.paid_at && new Date(d.paid_at).getFullYear() === currentYear)
  const yearEarned = yearDeals.reduce((s, d) => s + (d.value ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Revenue overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Earned</p>
            <p className="mt-1 text-3xl font-bold text-zinc-100">{formatCurrency(totalEarned)}</p>
            <p className="mt-1 text-xs text-zinc-500">{paidDeals.length} paid deals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">This Year</p>
            <p className="mt-1 text-3xl font-bold text-zinc-100">{formatCurrency(yearEarned)}</p>
            <p className="mt-1 text-xs text-zinc-500">{yearDeals.length} deals in {currentYear}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">Avg Deal Size</p>
            <p className="mt-1 text-3xl font-bold text-zinc-100">
              {formatCurrency(paidDeals.length > 0 ? totalEarned / paidDeals.length : 0)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">per sponsorship</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Platform Metrics</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setAddingPlatform(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Update metrics
          </Button>
        </CardHeader>
        <CardContent>
          {addingPlatform && (
            <div className="mb-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Platform</label>
                  <select value={form.platform} onChange={e => setForm(p => ({...p, platform: e.target.value}))} className="flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500">
                    {PLATFORMS.slice(0, 5).map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Followers/Subscribers</label>
                  <Input value={form.followers} onChange={e => setForm(p => ({...p, followers: e.target.value}))} placeholder="250000" type="number" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Avg Views</label>
                  <Input value={form.avg_views} onChange={e => setForm(p => ({...p, avg_views: e.target.value}))} placeholder="50000" type="number" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Avg Likes</label>
                  <Input value={form.avg_likes} onChange={e => setForm(p => ({...p, avg_likes: e.target.value}))} placeholder="2000" type="number" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Avg Comments</label>
                  <Input value={form.avg_comments} onChange={e => setForm(p => ({...p, avg_comments: e.target.value}))} placeholder="150" type="number" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={saveSnapshot} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                <Button size="sm" variant="outline" onClick={() => setAddingPlatform(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {Object.keys(latest).length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.values(latest).map(s => {
                const platform = PLATFORMS.find(p => p.value === s.platform)
                const er = s.engagement_rate ? (s.engagement_rate * 100).toFixed(2) : null
                return (
                  <div key={s.id} className="rounded-lg bg-zinc-800/50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-lg">{platform?.icon}</span>
                      <span className="font-medium text-zinc-100">{platform?.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><p className="text-xs text-zinc-500">Followers</p><p className="font-medium text-zinc-100">{s.followers?.toLocaleString()}</p></div>
                      <div><p className="text-xs text-zinc-500">Avg Views</p><p className="font-medium text-zinc-100">{s.avg_views?.toLocaleString()}</p></div>
                      <div><p className="text-xs text-zinc-500">Avg Likes</p><p className="font-medium text-zinc-100">{s.avg_likes?.toLocaleString()}</p></div>
                      <div><p className="text-xs text-zinc-500">Engagement</p><p className={`font-medium ${er && parseFloat(er) > 3 ? 'text-green-400' : 'text-zinc-100'}`}>{er ? `${er}%` : '—'}</p></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Add your platform metrics to unlock the rate card calculator and track growth over time.</p>
          )}
        </CardContent>
      </Card>

      {/* Rate card calculator */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-violet-400" />
            <CardTitle className="text-base">Rate Card Calculator</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Platform</label>
              <select value={rateCalc.platform} onChange={e => setRateCalc(p => ({...p, platform: e.target.value}))} className="flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500">
                {PLATFORMS.slice(0, 5).map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Avg Views / Reach</label>
              <Input value={rateCalc.avg_views} onChange={e => setRateCalc(p => ({...p, avg_views: e.target.value}))} placeholder="50000" type="number" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Followers</label>
              <Input value={rateCalc.followers} onChange={e => setRateCalc(p => ({...p, followers: e.target.value}))} placeholder="250000" type="number" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Engagement Rate %</label>
              <Input value={rateCalc.engagement_rate} onChange={e => setRateCalc(p => ({...p, engagement_rate: e.target.value}))} placeholder="3.5" type="number" step="0.1" />
            </div>
          </div>

          {hasRateInput && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Story / Short', value: rates.story, desc: '15–30s mention' },
                { label: 'Integration', value: rates.integration, desc: '60–90s mid-roll' },
                { label: 'Dedicated', value: rates.dedicated, desc: 'Full sponsored video' },
                { label: 'Bundle', value: rates.bundle, desc: 'Dedicated + reposts' },
              ].map(({ label, value, desc }) => (
                <div key={label} className="rounded-lg border border-violet-800/50 bg-violet-950/20 p-3">
                  <p className="text-xs font-medium text-violet-300">{label}</p>
                  <p className="text-xl font-bold text-zinc-100">{formatCurrency(value)}</p>
                  <p className="text-xs text-zinc-500">{desc}</p>
                </div>
              ))}
            </div>
          )}
          {!hasRateInput && (
            <p className="text-sm text-zinc-500">Enter your average views to calculate recommended sponsorship rates based on industry CPM benchmarks.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
