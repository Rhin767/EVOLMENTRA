'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

type Patient = {
  id: string
  first_name: string
  last_name: string
  diagnosis: string
}

export default function NotesPage() {
  const supabase = createClient()
  const [patients, setPatients] = useState<Patient[]>([])
  const [staffId, setStaffId] = useState('')
  const [clinicId, setClinicId] = useState('')
  const [selectedPatient, setSelectedPatient] = useState('')
  const [cptCode, setCptCode] = useState('97153')
  const [duration, setDuration] = useState('60')
  const [observations, setObservations] = useState('')
  const [generatedNote, setGeneratedNote] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('soap')
  const [goalDesc, setGoalDesc] = useState('')
  const [generatedGoal, setGeneratedGoal] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('staff').select('id, clinic_id').eq('user_id', user.id).single()
        .then(({ data: staff }) => {
          if (!staff) return
          setStaffId(staff.id)
          setClinicId(staff.clinic_id)
          supabase.from('patients').select('id, first_name, last_name, diagnosis')
            .eq('clinic_id', staff.clinic_id).eq('status', 'active')
            .then(({ data }) => { if (data) setPatients(data) })
        })
    })
    const params = new URLSearchParams(window.location.search)
    const pid = params.get('patient')
    if (pid) setSelectedPatient(pid)
  }, [])

  async function generateSOAP() {
    if (!observations) return
    setGenerating(true); setGeneratedNote('')
    const patient = patients.find(p => p.id === selectedPatient)
    const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'the patient'
    try {
      const res = await fetch('/api/nova', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'soap', patient: patientName, cptCode, duration: `${duration} minutes`, observations, diagnosis: patient?.diagnosis || 'ASD' })
      })
      const data = await res.json()
      setGeneratedNote(data.text || data.error || 'Error generating note')
    } catch {
      setGeneratedNote('Connection error. Check your API key.')
    }
    setGenerating(false)
  }

  async function saveNote() {
    if (!generatedNote || !selectedPatient || !staffId || !clinicId) return
    setSaving(true)
    await supabase.from('session_notes').insert({
      patient_id: selectedPatient,
      clinic_id: clinicId,
      author_id: staffId,
      raw_observations: observations,
      full_note: generatedNote,
      ai_generated: true,
    } as any)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function generateGoal() {
    if (!goalDesc) return
    setGenerating(true); setGeneratedGoal('')
    try {
      const res = await fetch('/api/nova', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'goal', description: goalDesc })
      })
      const data = await res.json()
      setGeneratedGoal(data.text || '')
    } catch {
      setGeneratedGoal('Connection error.')
    }
    setGenerating(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mini sidebar */}
      <aside className="w-60 shrink-0 bg-[#0d1829] flex flex-col">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-sm font-black">E</div>
            <span className="text-white text-sm font-bold">EvolMentra</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {[['dashboard','📊','Dashboard'],['patients','👥','Patients'],['schedule','📅','Schedule'],['sessions','⏱️','Sessions'],['notes','📝','SOAP Notes'],['goals','🎯','Goals'],['billing','💳','Billing']].map(([href,icon,label]) => (
            <a key={href} href={`/${href}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${href==='notes' ? 'bg-teal-500/15 text-teal-400' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}>
              <span className="w-5 text-center">{icon}</span>{label}
            </a>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <a href="/dashboard" className="text-white/30 hover:text-white/60 text-xs flex items-center gap-2 px-3 py-2 transition-colors">← Dashboard</a>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NOVA AI Clinical Tools</h1>
              <p className="text-gray-400 text-sm">AI-powered SOAP notes and goal writing — powered by Claude</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#0d1829] rounded-xl">
              <span className="text-teal-400 text-sm">🤖</span>
              <span className="text-white text-sm font-semibold">NOVA Active</span>
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[['soap','📝 SOAP Note'],['goal','🎯 Goal Writer']].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab===id ? 'bg-teal-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300'}`}>
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'soap' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Left: inputs */}
              <div className="card space-y-4">
                <h2 className="font-bold text-gray-900">Session details</h2>
                <div>
                  <label className="label">Patient</label>
                  <select className="input" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
                    <option value="">Select patient...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">CPT Code</label>
                    <select className="input" value={cptCode} onChange={e => setCptCode(e.target.value)}>
                      <option value="97153">97153 — ABA Direct</option>
                      <option value="97155">97155 — Protocol Mod</option>
                      <option value="97156">97156 — Parent Training</option>
                      <option value="97158">97158 — Group</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Duration</label>
                    <select className="input" value={duration} onChange={e => setDuration(e.target.value)}>
                      <option value="30">30 min</option>
                      <option value="60">60 min</option>
                      <option value="90">90 min</option>
                      <option value="120">120 min</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">What happened this session?</label>
                  <textarea className="input h-44 resize-none"
                    placeholder="e.g. Patient arrived calm. Worked on mand training — 8 correct out of 10 trials. Had one brief tantrum at transition to table work. Parent joined for last 15 minutes for coaching..."
                    value={observations} onChange={e => setObservations(e.target.value)} />
                </div>
                <button onClick={generateSOAP} disabled={generating || !observations || !selectedPatient}
                  className="btn btn-primary w-full justify-center py-3 disabled:opacity-50">
                  {generating ? '🤖 NOVA is writing...' : '🤖 Generate SOAP Note'}
                </button>
                {!selectedPatient && <p className="text-xs text-amber-600 text-center">Select a patient first</p>}
              </div>

              {/* Right: output */}
              <div className="card flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">NOVA-Generated Note</h2>
                  {generatedNote && (
                    <div className="flex gap-2">
                      <button onClick={saveNote} disabled={saving || saved}
                        className={`btn text-sm py-1.5 ${saved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'btn-primary'}`}>
                        {saved ? '✓ Saved to chart' : saving ? 'Saving...' : '💾 Save to chart'}
                      </button>
                      <button onClick={() => navigator.clipboard?.writeText(generatedNote)}
                        className="btn btn-secondary text-sm py-1.5">Copy</button>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  {generating ? (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl h-full">
                      <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-gray-700">NOVA is generating your SOAP note...</div>
                        <div className="text-xs text-gray-400 mt-1">Usually takes 5–10 seconds</div>
                      </div>
                    </div>
                  ) : generatedNote ? (
                    <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-mono border border-gray-100">
                      {generatedNote}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                      <div className="text-4xl mb-3">📝</div>
                      <p className="text-sm font-medium">Fill in session details and click Generate</p>
                      <p className="text-xs mt-1">Takes 5–10 seconds</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goal' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="card space-y-4">
                <h2 className="font-bold text-gray-900">Describe the goal</h2>
                <div>
                  <label className="label">Patient</label>
                  <select className="input" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
                    <option value="">Select patient...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Describe what you want to target</label>
                  <textarea className="input h-36 resize-none"
                    placeholder="e.g. He grabs things instead of asking. We want him to use words to request preferred items at least 80% of the time."
                    value={goalDesc} onChange={e => setGoalDesc(e.target.value)} />
                </div>
                <button onClick={generateGoal} disabled={generating || !goalDesc}
                  className="btn btn-primary w-full justify-center py-3 disabled:opacity-50">
                  {generating ? '🤖 Writing goal...' : '🎯 Generate SMART Goal'}
                </button>
              </div>
              <div className="card">
                <h2 className="font-bold text-gray-900 mb-4">NOVA-Generated Goal</h2>
                {generatedGoal ? (
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {generatedGoal}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <div className="text-4xl mb-3">🎯</div>
                    <p className="text-sm">Describe the goal and click Generate</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
