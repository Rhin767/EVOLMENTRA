'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    clinicName: '', fullName: '', title: 'BCBA',
    email: '', password: '', confirmPassword: ''
  })
  const router = useRouter()
  const supabase = createClient()

  function update(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')

    // 1. Create auth user
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })
    if (authErr || !authData.user) {
      setError(authErr?.message || 'Signup failed')
      setLoading(false)
      return
    }

    // 2. Create clinic
    const { data: clinic, error: clinicErr } = await supabase
      .from('clinics')
      .insert({ name: form.clinicName, owner_id: authData.user.id, email: form.email })
      .select()
      .single()

    if (clinicErr || !clinic) {
      setError(clinicErr?.message || 'Failed to create clinic')
      setLoading(false)
      return
    }

    // 3. Create staff record
    const { error: staffErr } = await supabase.from('staff').insert({
      clinic_id: clinic.id,
      user_id: authData.user.id,
      full_name: form.fullName,
      title: form.title,
      role: 'owner',
      email: form.email,
    })

    if (staffErr) {
      setError(staffErr.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1829] to-[#1a2640] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xl font-black">E</div>
            <span className="text-white text-2xl font-bold">EvolMentra</span>
          </div>
          <p className="text-white/40 text-sm">Set up your ABA clinic in 60 seconds</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {/* Progress */}
          <div className="flex gap-2 mb-6">
            {['Clinic', 'Your Info', 'Account'].map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all ${i + 1 <= step ? 'bg-teal-400' : 'bg-gray-100'}`} />
                <p className={`text-xs mt-1 font-medium ${i + 1 === step ? 'text-teal-500' : 'text-gray-400'}`}>{s}</p>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={step < 3 ? (e) => { e.preventDefault(); setStep(s => s + 1) } : handleSignup}>
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Your clinic</h2>
                <div>
                  <label className="label">Clinic / Practice Name *</label>
                  <input className="input" placeholder="e.g. Sunshine ABA Therapy" value={form.clinicName}
                    onChange={e => update('clinicName', e.target.value)} required />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Your info</h2>
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input" placeholder="e.g. Sarah Johnson" value={form.fullName}
                    onChange={e => update('fullName', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Your Title</label>
                  <select className="input" value={form.title} onChange={e => update('title', e.target.value)}>
                    <option>BCBA</option>
                    <option>BCaBA</option>
                    <option>Clinic Director</option>
                    <option>Administrator</option>
                    <option>RBT</option>
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Create account</h2>
                <div>
                  <label className="label">Email *</label>
                  <input type="email" className="input" placeholder="you@clinic.com" value={form.email}
                    onChange={e => update('email', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Password *</label>
                  <input type="password" className="input" placeholder="min 8 characters" value={form.password}
                    onChange={e => update('password', e.target.value)} required minLength={8} />
                </div>
                <div>
                  <label className="label">Confirm Password *</label>
                  <input type="password" className="input" placeholder="confirm password" value={form.confirmPassword}
                    onChange={e => update('confirmPassword', e.target.value)} required />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="btn btn-secondary flex-1 justify-center py-3">
                  ← Back
                </button>
              )}
              <button type="submit" disabled={loading}
                className="btn btn-primary flex-1 justify-center py-3 text-base">
                {step < 3 ? 'Next →' : loading ? 'Creating account...' : 'Launch My Clinic →'}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{' '}
            <a href="/auth/login" className="text-teal-500 font-semibold hover:underline">Sign in</a>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-4">
          🔒 HIPAA compliant · Data encrypted at rest · SOC2 in progress
        </p>
      </div>
    </div>
  )
}
