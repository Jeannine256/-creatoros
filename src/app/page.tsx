import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, Handshake, Calendar, BarChart3, ArrowRight, Check } from 'lucide-react'

const features = [
  { icon: Handshake, title: 'Sponsorship Pipeline', desc: 'Track every deal from pitch to payment. Never lose a brand deal in your inbox again.' },
  { icon: Calendar, title: 'Content Calendar', desc: 'Plan content around your brand deals. See conflicts, deadlines, and deliverables at a glance.' },
  { icon: BarChart3, title: 'Analytics & Rate Cards', desc: 'Know your CPM, CPE, and engagement rate. Price your content what it\'s actually worth.' },
  { icon: Zap, title: 'AI-Powered', desc: 'Auto-draft outreach emails, parse sponsor briefs, and generate performance reports in seconds.' },
]

const plans = [
  {
    name: 'Starter', price: '49', desc: 'For solo creators just getting started with brand deals.',
    features: ['1 creator profile', '10 active deals', 'Content calendar', 'Basic analytics'],
    cta: 'Start free trial', highlighted: false,
  },
  {
    name: 'Pro', price: '149', desc: 'For full-time creators managing multiple partnerships.',
    features: ['3 creator profiles', 'Unlimited deals', 'AI outreach drafts', 'Brief parser', 'Sponsor reports', 'Rate card calculator'],
    cta: 'Start free trial', highlighted: true,
  },
  {
    name: 'Agency', price: '399', desc: 'For talent managers and MCNs handling creator rosters.',
    features: ['20 creator profiles', 'Everything in Pro', 'White-label reports', 'Priority support', 'API access'],
    cta: 'Contact sales', highlighted: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-zinc-100 text-lg">CreatorOS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
          <Link href="/signup"><Button size="sm">Start free trial</Button></Link>
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-8 pt-24 pb-20 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-800 bg-violet-950/50 px-3 py-1 text-xs text-violet-300">
          <Zap className="h-3 w-3" /> 14-day free trial · No credit card required
        </div>
        <h1 className="mb-6 text-5xl font-bold leading-tight text-zinc-100">
          The operating system<br />
          <span className="text-violet-400">for serious creators</span>
        </h1>
        <p className="mb-10 text-xl text-zinc-400 max-w-2xl mx-auto">
          Stop managing sponsorships in your inbox and content in spreadsheets.
          CreatorOS gives you a full command center for your creator business.
        </p>
        <Link href="/signup">
          <Button size="lg" className="gap-2">
            Get started free <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-8 pb-24">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/20">
                <Icon className="h-5 w-5 text-violet-400" />
              </div>
              <h3 className="mb-2 font-semibold text-zinc-100">{title}</h3>
              <p className="text-sm text-zinc-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-8 pb-32">
        <h2 className="mb-12 text-center text-3xl font-bold text-zinc-100">Simple, transparent pricing</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-xl border p-6 ${plan.highlighted ? 'border-violet-500 bg-violet-950/30' : 'border-zinc-800 bg-zinc-900'}`}>
              {plan.highlighted && (
                <div className="mb-3 inline-block rounded-full bg-violet-600 px-2 py-0.5 text-xs font-medium text-white">Most popular</div>
              )}
              <h3 className="text-lg font-bold text-zinc-100">{plan.name}</h3>
              <div className="my-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-zinc-100">CHF {plan.price}</span>
                <span className="text-sm text-zinc-500">/month</span>
              </div>
              <p className="mb-5 text-sm text-zinc-400">{plan.desc}</p>
              <ul className="mb-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button variant={plan.highlighted ? 'default' : 'outline'} className="w-full">{plan.cta}</Button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
