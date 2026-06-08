'use client'

import { useState, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DEAL_STATUSES, PLATFORMS } from '@/lib/utils'
import type { Deal, Sponsor } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface Props {
  open: boolean
  onClose: () => void
  deal: Deal | null
  sponsors: Pick<Sponsor, 'id' | 'name'>[]
  onSaved: (deal: Deal) => void
  onDeleted: (id: string) => void
}

const empty = {
  title: '', sponsor_id: '', status: 'pitched', value: '', currency: 'CHF',
  platform: '', content_type: '', deliverable_due_at: '', payment_due_at: '', brief_text: '', notes: '',
}

export function DealModal({ open, onClose, deal, sponsors, onSaved, onDeleted }: Props) {
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (deal) {
      setForm({
        title: deal.title,
        sponsor_id: deal.sponsor_id ?? '',
        status: deal.status,
        value: deal.value?.toString() ?? '',
        currency: deal.currency,
        platform: deal.platform ?? '',
        content_type: deal.content_type ?? '',
        deliverable_due_at: deal.deliverable_due_at?.split('T')[0] ?? '',
        payment_due_at: deal.payment_due_at?.split('T')[0] ?? '',
        brief_text: deal.brief_text ?? '',
        notes: deal.notes ?? '',
      })
    } else {
      setForm(empty)
    }
  }, [deal, open])

  if (!open) return null

  function set(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      user_id: user!.id,
      title: form.title,
      sponsor_id: form.sponsor_id || null,
      status: form.status,
      value: form.value ? parseFloat(form.value) : null,
      currency: form.currency,
      platform: form.platform || null,
      content_type: form.content_type || null,
      deliverable_due_at: form.deliverable_due_at || null,
      payment_due_at: form.payment_due_at || null,
      brief_text: form.brief_text || null,
      notes: form.notes || null,
      ...(form.status === 'paid' && !deal?.paid_at ? { paid_at: new Date().toISOString() } : {}),
    }

    if (deal) {
      const { data, error } = await supabase.from('deals').update(payload).eq('id', deal.id).select('*, sponsors(name, contact_email)').single()
      if (!error && data) onSaved(data as Deal)
    } else {
      const { data, error } = await supabase.from('deals').insert(payload).select('*, sponsors(name, contact_email)').single()
      if (!error && data) onSaved(data as Deal)
    }
    setSaving(false)
    onClose()
  }

  async function remove() {
    if (!deal) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('deals').delete().eq('id', deal.id)
    onDeleted(deal.id)
    setDeleting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">{deal ? 'Edit deal' : 'New deal'}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Deal title *</label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. NordVPN YouTube integration" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Sponsor</label>
              <select
                value={form.sponsor_id}
                onChange={e => set('sponsor_id', e.target.value)}
                className="flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">No sponsor</option>
                {sponsors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {DEAL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Deal value</label>
              <Input type="number" value={form.value} onChange={e => set('value', e.target.value)} placeholder="5000" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Platform</label>
              <select
                value={form.platform}
                onChange={e => set('platform', e.target.value)}
                className="flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Select platform</option>
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.icon} {p.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Content type</label>
            <Input value={form.content_type} onChange={e => set('content_type', e.target.value)} placeholder="e.g. Dedicated video, 60s integration, Story set" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Deliverable due</label>
              <Input type="date" value={form.deliverable_due_at} onChange={e => set('deliverable_due_at', e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Payment due</label>
              <Input type="date" value={form.payment_due_at} onChange={e => set('payment_due_at', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Sponsor brief</label>
            <Textarea value={form.brief_text} onChange={e => set('brief_text', e.target.value)} placeholder="Paste the sponsor brief here — the AI will parse key requirements and deadlines." rows={4} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Notes</label>
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Internal notes, rate negotiations, contact info…" rows={2} />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          {deal ? (
            <Button variant="destructive" size="sm" onClick={remove} disabled={deleting}>
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          ) : <div />}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving || !form.title}>
              {saving ? 'Saving…' : deal ? 'Save changes' : 'Create deal'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
