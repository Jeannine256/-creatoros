'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Profile } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Check } from 'lucide-react'

export function SettingsForm({ profile }: { profile: Profile | null }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    youtube_handle: profile?.youtube_handle ?? '',
    instagram_handle: profile?.instagram_handle ?? '',
    tiktok_handle: profile?.tiktok_handle ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function set(key: string, val: string) { setForm(p => ({ ...p, [key]: val })) }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update(form).eq('id', profile!.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const planColors: Record<string, string> = {
    starter: 'muted', pro: 'default', agency: 'success',
  }

  const trialEnd = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const daysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86400000)) : 0

  return (
    <div className="space-y-6">
      {/* Plan info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant={(planColors[profile?.plan ?? 'starter'] ?? 'muted') as any} className="capitalize text-sm px-3 py-1">
              {profile?.plan ?? 'starter'} plan
            </Badge>
            {profile?.subscription_status === 'trialing' && daysLeft > 0 && (
              <span className="text-sm text-zinc-400">{daysLeft} days left in trial</span>
            )}
          </div>
          <p className="text-sm text-zinc-500">
            {profile?.plan === 'starter' && 'Upgrade to Pro for unlimited deals, AI features, and more.'}
            {profile?.plan === 'pro' && 'You have full access to all Pro features.'}
            {profile?.plan === 'agency' && 'You have full access to all Agency features.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => window.open('/api/billing/portal', '_blank')}>
            Manage billing
          </Button>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Creator Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Full name</label>
            <Input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Email</label>
            <Input value={profile?.email ?? ''} disabled className="opacity-60" />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium text-zinc-400">Platform handles</p>
            <div className="flex items-center gap-2">
              <span className="w-24 text-xs text-zinc-500">▶ YouTube</span>
              <Input value={form.youtube_handle} onChange={e => set('youtube_handle', e.target.value)} placeholder="@yourchannel" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-xs text-zinc-500">📸 Instagram</span>
              <Input value={form.instagram_handle} onChange={e => set('instagram_handle', e.target.value)} placeholder="@yourhandle" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-xs text-zinc-500">🎵 TikTok</span>
              <Input value={form.tiktok_handle} onChange={e => set('tiktok_handle', e.target.value)} placeholder="@yourhandle" />
            </div>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saved ? <><Check className="h-4 w-4" /> Saved</> : saving ? 'Saving…' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
