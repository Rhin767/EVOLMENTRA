'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep]           = useState(1)
  const [fullName, setFullName]   = useState('')
  const [clinicName, setClinic]   = useState('')
  const [title, setTitle]         = useState('BCBA')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // 1. Create auth user
      const { data, error: signupErr } = await supabase.auth.signUp({ email, password })
      if (signupErr) throw signupErr
      if (!data.user) throw new Error('Signup failed — please try again')

      // 2. Create clinic
      const { data: clinic, error: clinicErr } = await supabase
        .from('clinics')
        .insert({ name: clinicName, owner_id: data.user.id, email })
        .select()
        .single()
      if (clinicErr) throw clinicErr

      // 3. Create staff record
      const { error: staffErr } = await supabase
        .from('staff')
        .insert({
          clinic_id: clinic.id,
          user_id: data.user.id,
          full_name: fullName,
          title,
          role: 'owner',
          email,
        })
      if (staffErr) throw staffErr

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold mb-1" style={{fontFamily:'var(--font-sora)'}}>
            <span style={{color:'#0d9488'}}>Evol</span>Mentra
          </div>
          <p className="text-sm text-gray-500">Set up your clinic in 60 seconds</p>
        </div>

        <div className="card p-8">
          {/* Step indicator */}
          <div className="flex gap-2 mb-8">
            {[1,2].map(s => (
              <div key={s} className="flex-1 h-1.5 rounded-full transition-colors"
                style={{background: s <= step ? '#0d9488' : '#e5e7eb'}}/>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div>
              <h2 className="text-xl font-bold mb-1">Your clinic</h2>
              <p className="text-sm text-gray-500 mb-6">Tell us about your practice</p>
              <div className="space-y-4">
                <div>
                  <label className="label">Clinic name</label>
                  <input className="input" placeholder="Sunshine ABA Clinic" value={clinicName} onChange={e => setClinic(e.target.value)} required/>
                </div>
                <div>
                  <label className="label">Your full name</label>
                  <input className="input" placeholder="Sarah Johnson" value={fullName} onChange={e => setFullName(e.target.value)} required/>
                </div>
                <div>
                  <label className="label">Your title</label>
                  <select className="input" value={title} onChange={e => setTitle(e.target.value)}>
                    {['BCBA','BCaBA','Clinic Director','Administrator','RBT'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <button onClick={() => { if(clinicName && fullName) setStep(2) }} className="btn-primary w-full justify-center py-3">
                  Continue →
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignup}>
              <h2 className="text-xl font-bold mb-1">Create your account</h2>
              <p className="text-sm text-gray-500 mb-6">You'll use these to log in</p>
              <div className="space-y-4">
                <div>
                  <label className="label">Work email</label>
                  <input type="email" className="input" placeholder="sarah@yourclinic.com" value={email} onChange={e => setEmail(e.target.value)} required/>
                </div>
                <div>
                  <label className="label">Password</label>
                  <input type="password" className="input" placeholder="8+ characters" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required/>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? 'Creating your clinic…' : 'Launch my clinic →'}
                </button>
                <button type="button" onClick={() => setStep(1)} className="btn-ghost w-full justify-center">
                  ← Back
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-teal-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
