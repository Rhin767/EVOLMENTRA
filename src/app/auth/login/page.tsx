'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1829] to-[#1a2640] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xl font-black">E</div>
            <span className="text-white text-2xl font-bold">EvolMentra</span>
          </div>
          <p className="text-white/40 text-sm">ABA Clinical Platform</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Sign in to your clinic</h1>
          <p className="text-sm text-gray-500 mb-6">HIPAA-secured</p>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@clinic.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">New clinic? <a href="/auth/signup" className="text-teal-500 font-semibold hover:underline">Set up your account</a></p>
          </div>
        </div>
        <p className="text-center text-white/25 text-xs mt-6">🔒 256-bit encrypted · HIPAA compliant</p>
      </div>
    </div>
  )
}
