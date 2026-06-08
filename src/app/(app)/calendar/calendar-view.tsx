'use client'

import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PLATFORMS } from '@/lib/utils'
import type { ContentItem, Deal } from '@/lib/types'
import { ContentModal } from './content-modal'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'

interface Props {
  initialItems: ContentItem[]
  deals: Pick<Deal, 'id' | 'title' | 'deliverable_due_at' | 'status'>[]
}

const STATUS_COLORS: Record<string, string> = {
  idea: 'bg-zinc-700', scripting: 'bg-blue-700', filming: 'bg-purple-700',
  editing: 'bg-orange-700', scheduled: 'bg-yellow-700', published: 'bg-green-700',
}

export function CalendarView({ initialItems, deals }: Props) {
  const [items, setItems] = useState(initialItems)
  const [month, setMonth] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const startDow = startOfMonth(month).getDay()

  function openNew(date?: Date) {
    setEditingItem(null)
    setSelectedDate(date ?? null)
    setModalOpen(true)
  }

  function handleSaved(item: ContentItem) {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === item.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = item; return next }
      return [...prev, item]
    })
  }

  function handleDeleted(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMonth(m => subMonths(m, 1))} className="rounded-lg border border-zinc-700 p-1.5 text-zinc-400 hover:bg-zinc-800">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-semibold text-zinc-100 w-36 text-center">{format(month, 'MMMM yyyy')}</h2>
          <button onClick={() => setMonth(m => addMonths(m, 1))} className="rounded-lg border border-zinc-700 p-1.5 text-zinc-400 hover:bg-zinc-800">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <Button onClick={() => openNew()} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add content
        </Button>
      </div>

      {/* Upcoming sponsor deadlines banner */}
      {deals.filter(d => {
        if (!d.deliverable_due_at) return false
        const due = new Date(d.deliverable_due_at)
        return isSameMonth(due, month)
      }).length > 0 && (
        <div className="rounded-lg border border-orange-800/50 bg-orange-950/30 px-4 py-2.5 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
          <div className="text-sm text-orange-200">
            <span className="font-medium">Sponsor deadlines this month: </span>
            {deals.filter(d => d.deliverable_due_at && isSameMonth(new Date(d.deliverable_due_at), month))
              .map(d => `${d.title} (${format(new Date(d.deliverable_due_at!), 'MMM d')})`).join(' · ')}
          </div>
        </div>
      )}

      {/* Calendar grid */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-zinc-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-2.5 text-center text-xs font-medium text-zinc-500">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: startDow }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-zinc-800/50 p-1.5 bg-zinc-950/30" />
          ))}
          {days.map(day => {
            const dayItems = items.filter(item => item.publish_date && isSameDay(new Date(item.publish_date), day))
            const dayDeadlines = deals.filter(d => d.deliverable_due_at && isSameDay(new Date(d.deliverable_due_at), day))
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={day.toISOString()}
                className="min-h-[100px] border-b border-r border-zinc-800/50 p-1.5 cursor-pointer hover:bg-zinc-800/30 transition-colors"
                onClick={() => openNew(day)}
              >
                <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${isToday ? 'bg-violet-600 text-white' : 'text-zinc-400'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayDeadlines.map(d => (
                    <div key={d.id} className="truncate rounded bg-orange-900/60 px-1 py-0.5 text-xs text-orange-200">
                      ⚡ {d.title}
                    </div>
                  ))}
                  {dayItems.map(item => {
                    const platform = PLATFORMS.find(p => p.value === item.platform)
                    return (
                      <div
                        key={item.id}
                        onClick={e => { e.stopPropagation(); setEditingItem(item); setModalOpen(true) }}
                        className={`truncate rounded px-1 py-0.5 text-xs text-white cursor-pointer ${STATUS_COLORS[item.status] ?? 'bg-zinc-700'}`}
                      >
                        {platform?.icon} {item.title}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-sm ${color}`} />
            <span className="text-xs capitalize text-zinc-500">{status}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm bg-orange-900/60" />
          <span className="text-xs text-zinc-500">Sponsor deadline</span>
        </div>
      </div>

      <ContentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={editingItem}
        deals={deals}
        defaultDate={selectedDate}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </>
  )
}
