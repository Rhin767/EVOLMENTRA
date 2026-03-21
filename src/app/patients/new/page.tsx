'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const COLORS = [
  'linear-gradient(135deg,#00d4c8,#0891b2)',
  'linear-gradient(135deg,#7c3aed,#6d28d9)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#ef4444,#dc2626)',
  'linear-gradient(135deg,#6366f1,#4f46e5)',
]

export default function NewPatientPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    first_name: '', last_name: '', date_of_birth: '',
    diagnosis: 'ASD Level 2',
    parent_name: '', parent_email: '', parent_phone: '',
    insurance: '', member_id: '', auth_hours: 20, auth_expiry: '',
    notes: '', status: 'active',
    avatar_color: COLORS[0]
  })

  function update(k: string, v: any) { setForm(f => ({...f, [k]: v})) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { data: profile } = await supabase.from('profiles').select('clinic_id').single()
    const { error: err } = await supabase.from('patients').insert({ ...form, clinic_id: profile?.clinic_id })
    if (err) { setError(err.message); setLoading(false) }
    else router.push('/patients')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="btn btn-secondary text-sm">Back</button>
          <h1 className="text-2xl font-bold">Add New Patient</h1>
        </div>
        <div className="flex gap-2 mb-6">
          {['Basic Info','Parent / Insurance','Clinical Notes'].map((s,i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full ${i+1 <= step ? 'bg-em-teal' : 'bg-gray-200'}`}/>
              <p className={`text-xs mt-1 font-medium ${i+1===step ? 'text-em-teal' : 'text-gray-400'}`}>{s}</p>
            </div>
          ))}
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
        <form onSubmit={step < 3 ? (e) => { e.preventDefault(); setStep(s => s+1) } : submit} className="card space-y-4">
          {step === 1 && (<>
            <h2 className="font-bold text-gray-800">Patient information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">First Name *</label><input className="input" required value={form.first_name} onChange={e => update('first_name', e.target.value)} placeholder="e.g. Liam" /></div>
              <div><label className="label">Last Name *</label><input className="input" required value={form.last_name} onChange={e => update('last_name', e.target.value)} placeholder="e.g. Chen" /></div>
            </div>
            <div><label className="label">Date of Birth</label><input type="date" className="input" value={form.date_of_birth} onChange={e => update('date_of_birth', e.target.value)} /></div>
            <div><label className="label">Diagnosis</label>
              <select className="input" value={form.diagnosis} onChange={e => update('diagnosis', e.target.value)}>
                <option>ASD Level 1</option><option>ASD Level 2</option><option>ASD Level 3</option><option>ASD + ADHD</option><option>Other</option>
              </select>
            </div>
            <div><label className="label">Avatar Color</label>
              <div className="flex gap-2">
                {COLORS.map(c => <button key={c} type="button" onClick={() => update('avatar_color', c)} className={`w-8 h-8 rounded-full border-2 transition-all ${form.avatar_color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`} style={{ background: c }} />)}
              </div>
            </div>
          </>)}
          {step === 2 && (<>
            <h2 className="font-bold text-gray-800">Parent and insurance</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Parent Name</label><input className="input" value={form.parent_name} onChange={e => update('parent_name', e.target.value)} /></div>
              <div><label className="label">Parent Email</label><input type="email" className="input" value={form.parent_email} onChange={e => update('parent_email', e.target.value)} /></div>
            </div>
            <div><label className="label">Parent Phone</label><input className="input" value={form.parent_phone} onChange={e => update('parent_phone', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Insurance</label>
                <select className="input" value={form.insurance} onChange={e => update('insurance', e.target.value)}>
                  <option value="">Select...</option>
                  <option>Aetna</option><option>BlueCross BlueShield</option><option>UnitedHealth</option><option>Cigna</option><option>TRICARE</option><option>Medicaid</option><option>Self-pay</option>
                </select>
              </div>
              <div><label className="label">Member ID</label><input className="input" value={form.member_id} onChange={e => update('member_id', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Auth Hours / Week</label><input type="number" className="input" value={form.auth_hours} onChange={e => update('auth_hours', parseInt(e.target.value))} /></div>
              <div><label className="label">Auth Expiry</label><input type="date" className="input" value={form.auth_expiry} onChange={e => update('auth_expiry', e.target.value)} /></div>
            </div>
          </>)}
          {step === 3 && (<>
            <h2 className="font-bold text-gray-800">Clinical notes</h2>
            <div><label className="label">Presenting concerns</label>
              <textarea className="input h-32 resize-none" value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Referral notes, presenting concerns..." />
            </div>
            <div><label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => update('status', e.target.value)}>
                <option value="active">Active</option><option value="waitlist">Waitlist</option><option value="inactive">Inactive</option>
              </select>
            </div>
          </>)}
          <div className="flex gap-3 pt-2">
            {step > 1 && <button type="button" onClick={() => setStep(s => s-1)} className="btn btn-secondary flex-1 justify-center">Back</button>}
            <button type="submit" disabled={loading} className="btn btn-primary flex-1 justify-center py-3">
              {step < 3 ? 'Next' : loading ? 'Adding...' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
