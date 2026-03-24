'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState({ name: 'Rhinnard Williams', clinic: 'EvolMentra Clinic' })
  const router = useRouter()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 shrink-0 bg-[#0d1829] flex flex-col">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-sm font-black">E</div>
            <div>
              <div className="text-white text-sm font-bold">EvolMentra</div>
              <div className="text-white/30 text-xs">{user.clinic}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {[['/dashboard','📊','Dashboard'],['/patients','👥','Patients'],['/notes','📝','SOAP Notes'],['/goals','🎯','Goals'],['/billing','💳','Billing']].map(([href,icon,label]) => (
            <a key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${href==='/dashboard' ? 'bg-teal-500/15 text-teal-400' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good morning, Rhinnard 👋</h1>
            <p className="text-gray-400 text-sm mt-0.5">EvolMentra Clinic · ABA Clinical Platform</p>
          </div>
          <div className="flex gap-3">
            <a href="/notes" className="btn btn-secondary text-sm">🤖 NOVA AI Note</a>
            <a href="/patients/new" className="btn btn-primary text-sm">+ Add Patient</a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-2"><span className="text-2xl">👥</span><span className="text-2xl font-bold text-teal-500">0</span></div>
            <div className="text-sm font-semibold text-gray-800">Active Patients</div>
            <div className="text-xs text-gray-400 mt-0.5">Add your first patient</div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2"><span className="text-2xl">🤖</span><span className="text-2xl font-bold text-purple-500">Live</span></div>
            <div className="text-sm font-semibold text-gray-800">NOVA AI Ready</div>
            <div className="text-xs text-gray-400 mt-0.5">Write SOAP notes instantly</div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2"><span className="text-2xl">🔒</span><span className="text-2xl font-bold text-emerald-500">ON</span></div>
            <div className="text-sm font-semibold text-gray-800">HIPAA Secure</div>
            <div className="text-xs text-gray-400 mt-0.5">Encrypted and audited</div>
          </div>
        </div>

        <div className="card text-center py-12 mb-6">
          <div className="text-4xl mb-3">👥</div>
          <p className="font-semibold text-gray-700 mb-1">No patients yet</p>
          <p className="text-sm text-gray-400 mb-4">Add your first patient to get started</p>
          <a href="/patients/new" className="btn btn-primary">+ Add First Patient</a>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1829] border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-xl shrink-0">🤖</div>
          <div className="flex-1">
            <div className="text-white font-semibold">NOVA AI is ready</div>
            <div className="text-white/40 text-sm">Write a SOAP note in seconds — just describe what happened</div>
          </div>
          <a href="/notes" className="btn bg-teal-500 text-white hover:bg-teal-400 shrink-0 text-sm">Open NOVA →</a>
        </div>
      </main>
    </div>
  )
}
