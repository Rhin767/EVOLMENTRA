'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-navy-900 p-12 text-white" style={{background:'#0d1829'}}>
        <div>
          <div className="text-2xl font-bold mb-2" style={{fontFamily:'var(--font-sora)'}}>
            <span style={{color:'#00d4c8'}}>Evol</span>Mentra
          </div>
          <p className="text-sm text-gray-400">ABA Clinical Platform</p>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-6" style={{fontFamily:'var(--font-sora)'}}>
            The agentic AI<br/>operating system<br/>for <span style={{color:'#00d4c8'}}>autism care</span>.
          </h1>
          <div className="space-y-3">
            {['HIPAA-compliant infrastructure','NOVA AI clinical assistant','Real-time parent engagement','EVV + insurance billing'].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{background:'#00d4c8', color:'#0d1829', fontWeight:700}}>✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-600">© 2026 EvolMentra · HIPAA Compliant · SOC2 Ready</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
              <p className="text-sm text-gray-500">Sign in to your clinic</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input"
                  placeholder="sarah@yourclinic.com"
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? 'Signing in…' : 'Sign in →'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              New clinic?{' '}
              <Link href="/auth/signup" className="text-teal-600 font-semibold hover:underline">
                Create your account
              </Link>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-gray-400">
            🔒 256-bit encrypted · HIPAA compliant · Your data never leaves your clinic
          </p>
        </div>
      </div>
    </div>
  )
}
