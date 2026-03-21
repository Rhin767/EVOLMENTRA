'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Patient } from '@/lib/supabase'

export default function NotesPage() {
  const supabase = createClient()
  const [patients, setPatients] = useState<Patient[]>([])
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
    supabase.from('patients').select('*').eq('status','active').then(({ data }) => {
      if (data) setPatients(data)
    })
    // Pre-select from URL param
    const params = new URLSearchParams(window.location.search)
    const pid = params.get('patient')
    if (pid) setSelectedPatient(pid)
  }, [])

  async function generateSOAP() {
    if (!observations) return
    setGenerating(true); setGeneratedNote('')
    const patient = patients.find(p => p.id === selectedPatient)
    const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'the patient'

    const res = await fetch('/api/nova', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'soap',
        patient: patientName,
        cptCode,
        duration: `${duration} minutes`,
        observations,
        diagnosis: patient?.diagnosis || 'ASD',
      })
    })
    const data = await res.json()
    setGeneratedNote(data.text || 'Error generating note')
    setGenerating(false)
  }

  async function saveNote() {
    if (!generatedNote || !selectedPatient) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('session_notes').insert({
      patient_id: selectedPatient,
      therapist_id: user?.id,
      full_note: generatedNote,
      nova_generated: true,
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function generateGoal() {
    if (!goalDesc) return
    setGenerating(true); setGeneratedGoal('')
    const res = await fetch('/api/nova', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'goal', description: goalDesc })
    })
    const data = await res.json()
    setGeneratedGoal(data.text || '')
    setGenerating(false)
  }

  const tabs = [
    { id: 'soap', label: '📝 SOAP Note' },
    { id: 'goal', label: '🎯 Goal Writer' },
    { id: 'session', label: '📋 Session Plan' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Simple sidebar placeholder */}
      <div className="w-60 shrink-0 bg-[#0d1829] p-4">
        <a href="/dashboard" className="text-white/40 text-sm hover:text-white flex items-center gap-2 mb-6">← Dashboard</a>
        <div className="text-white font-bold mb-4">NOVA AI</div>
        <nav className="space-y-1">
          {[['dashboard','📊','Dashboard'],['patients','👥','Patients'],['schedule','📅','Schedule'],['notes','📝','SOAP Notes'],['goals','🎯','Goals'],['billing','💳','Billing']].map(([href,icon,label]) => (
            <a key={href} href={`/${href}`} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${href==='notes' ? 'bg-em-teal/15 text-em-teal' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
              <span>{icon}</span>{label}
            </a>
          ))}
        </nav>
      </div>

      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NOVA AI Clinical Tools</h1>
              <p className="text-gray-500 text-sm">AI-powered SOAP notes, goal writing, and session planning</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#0d1829] rounded-xl">
              <span className="text-em-teal text-sm">🤖</span>
              <span className="text-white text-sm font-semibold">NOVA Active</span>
              <div className="w-2 h-2 rounded-full bg-em-teal animate-pulse"/>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-2 mb-6">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab===t.id ? 'bg-em-teal text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-em-teal'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'soap' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="card space-y-4">
                <h2 className="font-bold text-gray-800">Session Details</h2>
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
                      <option value="30">30 min</option><option value="60">60 min</option>
                      <option value="90">90 min</option><option value="120">120 min</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">What happened this session?</label>
                  <textarea
                    className="input h-40 resize-none"
                    placeholder="e.g. Patient arrived calm. Worked on mand training — 8/10 correct. Had one brief tantrum at transition. Parent present for last 15 minutes..."
                    value={observations}
                    onChange={e => setObservations(e.target.value)}
                  />
                </div>
                <button onClick={generateSOAP} disabled={generating || !observations}
                  className="btn btn-primary w-full justify-center py-3">
                  {generating ? '🤖 NOVA is writing...' : '🤖 Generate SOAP Note'}
                </button>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800">NOVA-Generated Note</h2>
                  {generatedNote && (
                    <div className="flex gap-2">
                      <button onClick={saveNote} disabled={saving || saved}
                        className={`btn text-sm py-1.5 ${saved ? 'bg-green-50 text-green-700' : 'btn-primary'}`}>
                        {saved ? '✓ Saved' : saving ? 'Saving...' : '💾 Save to Chart'}
                      </button>
                      <button onClick={() => navigator.clipboard.writeText(generatedNote)}
                        className="btn btn-secondary text-sm py-1.5">
                        Copy
                      </button>
                    </div>
                  )}
                </div>
                {generating ? (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-6 h-6 border-2 border-em-teal border-t-transparent rounded-full animate-spin"/>
                    <div>
                      <div className="text-sm font-semibold text-gray-700">NOVA is generating your SOAP note...</div>
                      <div className="text-xs text-gray-400">Usually takes 5–10 seconds</div>
                    </div>
                  </div>
                ) : generatedNote ? (
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-mono text-xs">
                    {generatedNote}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <div className="text-4xl mb-3">📝</div>
                    <p className="text-sm">Fill in session details and click Generate</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'goal' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="card space-y-4">
                <h2 className="font-bold text-gray-800">Describe the goal</h2>
                <div>
                  <label className="label">Patient</label>
                  <select className="input" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
                    <option value="">Select patient...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Describe what you want to target (plain language)</label>
                  <textarea className="input h-36 resize-none"
                    placeholder="e.g. He grabs things instead of asking. We want him to use words to request preferred items in at least 80% of opportunities."
                    value={goalDesc} onChange={e => setGoalDesc(e.target.value)} />
                </div>
                <button onClick={generateGoal} disabled={generating || !goalDesc} className="btn btn-primary w-full justify-center py-3">
                  {generating ? '🤖 Writing goal...' : '🎯 Generate SMART Goal'}
                </button>
              </div>
              <div className="card">
                <h2 className="font-bold text-gray-800 mb-4">NOVA-Generated Goal</h2>
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

          {activeTab === 'session' && (
            <div className="card text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <p className="font-semibold mb-1">Session Planner</p>
              <p className="text-sm">Coming in next build session</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
