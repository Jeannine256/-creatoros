'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Create profile row using service role (bypasses RLS)
    await fetch('/api/auth/create-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name }),
    })

    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">Start your free trial</h1>
          <p className="mt-1 text-sm text-zinc-400">14 days free · No credit card required</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Full name</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="8+ characters" minLength={8} required />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create free account'}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-600">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
        <p className="mt-4 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="text-violet-400 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
