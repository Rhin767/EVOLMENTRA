'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

const COLORS = ['#00d4c8','#7c3aed','#f59e0b','#10b981','#ef4444','#6366f1']

export default function NewPatientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [clinicId, setClinicId] = useState('')
  const [staffId, setStaffId] = useState('')
  const [form, setForm] = useState({ first_name:'',last_name:'',date_of_birth:'2018-01-01',diagnosis:'ASD Level 2',parent_name:'',parent_email:'',parent_phone:'',insurance_carrier:'',insurance_member_id:'',auth_hours_per_week:20,auth_expiry_date:'',notes:'',status:'active',avatar_color:COLORS[0] })

  useEffect(() => {
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    supabase.auth.getUser().then(({data:{user}})=>{
      if(!user)return
      supabase.from('staff').select('id,clinic_id').eq('user_id',user.id).single().then(({data})=>{
        if(data){setClinicId(data.clinic_id);setStaffId(data.id)}
      })
    })
  },[])

  function update(k: string,v: any){setForm(f=>({...f,[k]:v}))}

  async function submit(e: React.FormEvent){
    e.preventDefault()
    if(!clinicId){setError('Could not load clinic. Please refresh.');return}
    setLoading(true);setError('')
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const {error:err} = await supabase.from('patients').insert({...form,clinic_id:clinicId,assigned_bcba_id:staffId||null})
    if(err){setError(err.message);setLoading(false)}
    else router.push('/patients')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={()=>router.back()} className="btn btn-secondary text-sm">← Back</button>
          <h1 className="text-2xl font-bold text-gray-900">Add New Patient</h1>
        </div>
        <div className="flex gap-2 mb-6">
          {['Basic Info','Parent & Insurance','Notes'].map((s,i)=>(
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all ${i+1<=step?'bg-teal-400':'bg-gray-200'}`}/>
              <p className={`text-xs mt-1 font-medium ${i+1===step?'text-teal-500':'text-gray-400'}`}>{s}</p>
            </div>
          ))}
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
        <form onSubmit={step<3?(e)=>{e.preventDefault();setStep(s=>s+1)}:submit} className="card space-y-4">
          {step===1 && (<>
            <h2 className="font-bold text-gray-800">Patient information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">First Name *</label><input className="input" required value={form.first_name} onChange={e=>update('first_name',e.target.value)} placeholder="Liam"/></div>
              <div><label className="label">Last Name *</label><input className="input" required value={form.last_name} onChange={e=>update('last_name',e.target.value)} placeholder="Chen"/></div>
            </div>
            <div><label className="label">Date of Birth *</label><input type="date" className="input" required value={form.date_of_birth} onChange={e=>update('date_of_birth',e.target.value)}/></div>
            <div><label className="label">Diagnosis</label><select className="input" value={form.diagnosis} onChange={e=>update('diagnosis',e.target.value)}><option>ASD Level 1</option><option>ASD Level 2</option><option>ASD Level 3</option><option>ASD + ADHD</option><option>Other</option></select></div>
            <div><label className="label">Avatar Color</label><div className="flex gap-2 mt-1">{COLORS.map(c=><button key={c} type="button" onClick={()=>update('avatar_color',c)} className={`w-8 h-8 rounded-full border-2 transition-all ${form.avatar_color===c?'border-gray-700 scale-110':'border-transparent'}`} style={{background:c}}/>)}</div></div>
          </>)}
          {step===2 && (<>
            <h2 className="font-bold text-gray-800">Parent and insurance</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Parent Name</label><input className="input" value={form.parent_name} onChange={e=>update('parent_name',e.target.value)}/></div>
              <div><label className="label">Parent Email</label><input type="email" className="input" value={form.parent_email} onChange={e=>update('parent_email',e.target.value)}/></div>
            </div>
            <div><label className="label">Parent Phone</label><input className="input" value={form.parent_phone} onChange={e=>update('parent_phone',e.target.value)}/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Insurance</label><select className="input" value={form.insurance_carrier} onChange={e=>update('insurance_carrier',e.target.value)}><option value="">Select...</option><option>Aetna</option><option>BlueCross BlueShield</option><option>UnitedHealth</option><option>Cigna</option><option>TRICARE</option><option>Medicaid</option><option>Self-pay</option></select></div>
              <div><label className="label">Member ID</label><input className="input" value={form.insurance_member_id} onChange={e=>update('insurance_member_id',e.target.value)}/></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Auth Hours/Week</label><input type="number" className="input" value={form.auth_hours_per_week} onChange={e=>update('auth_hours_per_week',parseInt(e.target.value)||0)}/></div>
              <div><label className="label">Auth Expiry</label><input type="date" className="input" value={form.auth_expiry_date} onChange={e=>update('auth_expiry_date',e.target.value)}/></div>
            </div>
          </>)}
          {step===3 && (<>
            <h2 className="font-bold text-gray-800">Clinical notes</h2>
            <div><label className="label">Presenting concerns</label><textarea className="input h-32 resize-none" value={form.notes} onChange={e=>update('notes',e.target.value)} placeholder="Referral notes, presenting concerns..."/></div>
            <div><label className="label">Status</label><select className="input" value={form.status} onChange={e=>update('status',e.target.value)}><option value="active">Active</option><option value="waitlist">Waitlist</option><option value="inactive">Inactive</option></select></div>
          </>)}
          <div className="flex gap-3 pt-2">
            {step>1 && <button type="button" onClick={()=>setStep(s=>s-1)} className="btn btn-secondary flex-1 justify-center py-3">← Back</button>}
            <button type="submit" disabled={loading} className="btn btn-primary flex-1 justify-center py-3">{step<3?'Next →':loading?'Adding...':'Add Patient ✓'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
