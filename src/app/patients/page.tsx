'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('em_patients')
    if (saved) setPatients(JSON.parse(saved))
  }, [])

  const statusBadge: Record<string,string> = {
    active: 'badge-green', inactive: 'badge-amber',
    waitlist: 'badge-purple', discharged: 'badge-red'
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 shrink-0 bg-[#0d1829] flex flex-col">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-sm font-black">E</div>
            <div><div className="text-white text-sm font-bold">EvolMentra</div><div className="text-white/30 text-xs">EvolMentra Clinic</div></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {[['/dashboard','📊','Dashboard'],['/patients','👥','Patients'],['/notes','📝','SOAP Notes'],['/goals','🎯','Goals'],['/billing','💳','Billing']].map(([href,icon,label]) => (
            <a key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${href==='/patients' ? 'bg-teal-500/15 text-teal-400' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}>
              <span className="w-5 text-center">{icon}</span>{label}
            </a>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <a href="/notes" className="flex items-center gap-3 px-3 py-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-semibold">
            <span>🤖</span>NOVA AI<span className="ml-auto w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          </a>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-400 text-sm">{(patients as any[]).length} total · {(patients as any[]).filter((p:any) => p.status === 'active').length} active</p>
          </div>
          <a href="/patients/new" className="btn btn-primary">+ Add Patient</a>
        </div>

        <div className="card p-0 overflow-hidden">
          {(patients as any[]).length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {['Patient','Diagnosis','Insurance','Auth','Status',''].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(patients as any[]).map((p:any) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{background: p.avatar_color || '#00d4c8'}}>
                          {p.first_name[0]}{p.last_name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{p.first_name} {p.last_name}</div>
                          {p.parent_name && <div className="text-xs text-gray-400">{p.parent_name}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{p.diagnosis}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{p.insurance_carrier || '—'}</td>
                    <td className="px-5 py-3.5 text-sm font-mono text-gray-700">{p.auth_hours_per_week ? `${p.auth_hours_per_week}h/wk` : '—'}</td>
                    <td className="px-5 py-3.5"><span className={`badge ${statusBadge[p.status] || 'badge-blue'}`}>{p.status}</span></td>
                    <td className="px-5 py-3.5">
                      <a href={`/notes?patient=${p.id}`} className="btn text-xs py-1 px-3 bg-teal-50 text-teal-600 hover:bg-teal-100 border border-teal-100">SOAP</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">👥</div>
              <p className="font-semibold text-gray-600 mb-1">No patients yet</p>
              <p className="text-sm mb-4">Add your first patient to get started</p>
              <a href="/patients/new" className="btn btn-primary">+ Add Patient</a>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
