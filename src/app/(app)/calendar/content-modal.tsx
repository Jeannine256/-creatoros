'use client'

import { useState, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PLATFORMS } from '@/lib/utils'
import type { ContentItem, Deal } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface Props {
  open: boolean
  onClose: () => void
  item: ContentItem | null
  deals: Pick<Deal, 'id' | 'title'>[]
  defaultDate: Date | null
  onSaved: (item: ContentItem) => void
  onDeleted: (id: string) => void
}

const STATUSES = ['idea', 'scripting', 'filming', 'editing', 'scheduled', 'published']

const empty = { title: '', platform: '', content_type: '', status: 'idea', publish_date: '', deal_id: '', notes: '' }

export function ContentModal({ open, onClose, item, deals, defaultDate, onSaved, onDeleted }: Props) {
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title, platform: item.platform ?? '', content_type: item.content_type ?? '',
        status: item.status, publish_date: item.publish_date ?? '', deal_id: item.deal_id ?? '', notes: item.notes ?? '',
      })
    } else {
      setForm({ ...empty, publish_date: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : '' })
    }
  }, [item, open, defaultDate])

  if (!open) return null

  function set(key: string, val: string) { setForm(prev => ({ ...prev, [key]: val })) }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      user_id: user!.id, title: form.title, platform: form.platform || null,
      content_type: form.content_type || null, status: form.status,
      publish_date: form.publish_date || null, deal_id: form.deal_id || null, notes: form.notes || null,
    }
    if (item) {
      const { data } = await supabase.from('content_items').update(payload).eq('id', item.id).select('*, deals(title, sponsors(name))').single()
      if (data) onSaved(data as ContentItem)
    } else {
      const { data } = await supabase.from('content_items').insert(payload).select('*, deals(title, sponsors(name))').single()
      if (data) onSaved(data as ContentItem)
    }
    setSaving(false)
    onClose()
  }

  async function remove() {
    if (!item) return
    const supabase = createClient()
    await supabase.from('content_items').delete().eq('id', item.id)
    onDeleted(item.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">{item ? 'Edit content' : 'Add content'}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Title *</label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. NordVPN integration video" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Platform</label>
              <select value={form.platform} onChange={e => set('platform', e.target.value)} className="flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="">Select</option>
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.icon} {p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500">
                {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Publish date</label>
              <Input type="date" value={form.publish_date} onChange={e => set('publish_date', e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Linked deal</label>
              <select value={form.deal_id} onChange={e => set('deal_id', e.target.value)} className="flex h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="">None</option>
                {deals.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Notes</label>
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Ideas, script notes, assets needed…" rows={2} />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          {item ? (
            <Button variant="destructive" size="sm" onClick={remove}><Trash2 className="h-3.5 w-3.5" /></Button>
          ) : <div />}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving || !form.title}>
              {saving ? 'Saving…' : item ? 'Save' : 'Add'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
