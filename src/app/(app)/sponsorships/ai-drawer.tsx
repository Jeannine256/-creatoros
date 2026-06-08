'use client'

import { useState } from 'react'
import { X, Sparkles, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Deal } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  deal: Deal | null
}

type AIMode = 'outreach' | 'followup' | 'report' | 'brief_summary'

const MODES: { value: AIMode; label: string; desc: string }[] = [
  { value: 'outreach', label: 'Draft outreach email', desc: 'Cold email to pitch this sponsor' },
  { value: 'followup', label: 'Follow-up email', desc: 'Nudge after no reply' },
  { value: 'report', label: 'Deliverable report', desc: 'Post-campaign performance summary' },
  { value: 'brief_summary', label: 'Parse brief', desc: 'Extract key requirements from brief' },
]

export function AIDrawer({ open, onClose, deal }: Props) {
  const [mode, setMode] = useState<AIMode>('outreach')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!open || !deal) return null

  async function generate() {
    setLoading(true)
    setResult('')
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, deal }),
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) return
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setResult(prev => prev + decoder.decode(value))
      }
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div className="flex w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="font-semibold text-zinc-100">AI Assistant</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <p className="mb-1 text-xs font-medium text-zinc-400">Deal</p>
            <p className="text-sm font-medium text-zinc-100">{deal.title}</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-zinc-400">What do you need?</p>
            <div className="space-y-2">
              {MODES.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${mode === m.value ? 'border-violet-500 bg-violet-950/40' : 'border-zinc-800 hover:border-zinc-700'}`}
                >
                  <p className="text-sm font-medium text-zinc-100">{m.label}</p>
                  <p className="text-xs text-zinc-500">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={generate} disabled={loading} className="w-full gap-2">
            <Sparkles className="h-4 w-4" />
            {loading ? 'Generating…' : 'Generate'}
          </Button>

          {result && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
                <span className="text-xs text-zinc-500">Result</span>
                <button onClick={copy} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-100">
                  {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap p-3 text-sm text-zinc-300 font-sans leading-relaxed">{result}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
