'use client'

import { useState } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, DEAL_STATUSES, PLATFORMS } from '@/lib/utils'
import type { Deal, Sponsor } from '@/lib/types'
import { DealModal } from './deal-modal'
import { AIDrawer } from './ai-drawer'

interface Props {
  initialDeals: Deal[]
  sponsors: Pick<Sponsor, 'id' | 'name'>[]
}

const VISIBLE_STATUSES = DEAL_STATUSES.filter(s => s.value !== 'cancelled')

export function DealBoard({ initialDeals, sponsors }: Props) {
  const [deals, setDeals] = useState(initialDeals)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  function openNew() { setEditingDeal(null); setModalOpen(true) }
  function openEdit(deal: Deal) { setEditingDeal(deal); setModalOpen(true) }
  function openAI(deal: Deal) { setSelectedDeal(deal); setAiOpen(true) }

  function handleSaved(deal: Deal) {
    setDeals(prev => {
      const idx = prev.findIndex(d => d.id === deal.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = deal; return next }
      return [deal, ...prev]
    })
  }

  function handleDeleted(id: string) {
    setDeals(prev => prev.filter(d => d.id !== id))
  }

  const totalValue = deals.filter(d => d.status !== 'cancelled').reduce((s, d) => s + (d.value ?? 0), 0)

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          {deals.filter(d => d.status !== 'cancelled').length} active deals ·{' '}
          <span className="text-zinc-100 font-medium">{formatCurrency(totalValue)}</span> pipeline
        </p>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> New deal
        </Button>
      </div>

      {/* Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {VISIBLE_STATUSES.map(status => {
          const col = deals.filter(d => d.status === status.value)
          const colValue = col.reduce((s, d) => s + (d.value ?? 0), 0)
          return (
            <div key={status.value} className="min-w-[240px] flex-shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${status.color}`} />
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{status.label}</span>
                  <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-500">{col.length}</span>
                </div>
                {colValue > 0 && <span className="text-xs text-zinc-500">{formatCurrency(colValue)}</span>}
              </div>

              <div className="space-y-2">
                {col.map(deal => (
                  <DealCard key={deal.id} deal={deal} onEdit={openEdit} onAI={openAI} />
                ))}
                {col.length === 0 && (
                  <div className="rounded-lg border border-dashed border-zinc-800 py-6 text-center text-xs text-zinc-600">
                    No deals
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <DealModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        deal={editingDeal}
        sponsors={sponsors}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
      <AIDrawer
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        deal={selectedDeal}
      />
    </>
  )
}

function DealCard({ deal, onEdit, onAI }: { deal: Deal; onEdit: (d: Deal) => void; onAI: (d: Deal) => void }) {
  const platform = PLATFORMS.find(p => p.value === deal.platform)
  const isOverdue = deal.deliverable_due_at && new Date(deal.deliverable_due_at) < new Date() && deal.status !== 'paid'

  return (
    <div
      className="group cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900 p-3 transition-colors hover:border-zinc-700"
      onClick={() => onEdit(deal)}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-tight text-zinc-100">{deal.title}</p>
        <button
          onClick={e => { e.stopPropagation(); onAI(deal) }}
          className="shrink-0 rounded p-0.5 text-zinc-600 opacity-0 transition-opacity hover:text-violet-400 group-hover:opacity-100"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </button>
      </div>

      {(deal.sponsors as any)?.name && (
        <p className="mb-2 text-xs text-zinc-500">{(deal.sponsors as any).name}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {platform && <span className="text-xs">{platform.icon}</span>}
          {deal.value && <span className="text-xs font-medium text-zinc-300">{formatCurrency(deal.value, deal.currency)}</span>}
        </div>
        {deal.deliverable_due_at && (
          <Badge variant={isOverdue ? 'danger' : 'muted'} className="text-xs">
            {formatDate(deal.deliverable_due_at)}
          </Badge>
        )}
      </div>
    </div>
  )
}
