import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*, clinics(name)').eq('id', user.id).single()

  const { data: patients } = await supabase
    .from('patients').select('*').eq('status', 'active').order('created_at', { ascending: false })

  const today = new Date().toISOString().split('T')[0]
  const { data: todaySessions } = await supabase
    .from('sessions')
    .select('*, patients(first_name, last_name)')
    .eq('therapist_id', user.id)
    .gte('scheduled_at', today + 'T00:00:00')
    .lte('scheduled_at', today + 'T23:59:59')
    .order('scheduled_at')

  const clinicName = (profile?.clinics as any)?.name || 'Your Clinic'
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userName={profile?.full_name || 'Therapist'} clinicName={clinicName} />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Good morning, {firstName} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {format(new Date(), 'EEEE, MMMM d')} · {clinicName}
            </p>
          </div>
          <div className="flex gap-3">
            <a href="/notes" className="btn btn-secondary text-sm">🤖 NOVA AI Note</a>
            <a href="/patients/new" className="btn btn-primary text-sm">+ Add Patient</a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { icon: '👥', value: patients?.length ?? 0, label: 'Active Patients', sub: 'on your caseload', color: 'text-teal-500' },
            { icon: '📅', value: todaySessions?.length ?? 0, label: "Today's Sessions", sub: 'scheduled', color: 'text-blue-500' },
            { icon: '🤖', value: 'Live', label: 'NOVA AI', sub: 'SOAP notes ready', color: 'text-purple-500' },
            { icon: '✅', value: '100%', label: 'HIPAA Secure', sub: 'encrypted + audited', color: 'text-emerald-500' },
          ].map(s => (
            <div key={s.label} className="card">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{s.icon}</span>
                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              </div>
              <div className="text-sm font-semibold text-gray-800">{s.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Schedule */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Today&apos;s Schedule</h2>
              <a href="/sessions" className="text-sm text-teal-500 hover:underline">View all →</a>
            </div>
            {todaySessions && todaySessions.length > 0 ? (
              <div className="space-y-3">
                {todaySessions.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-xs font-mono font-bold text-teal-500 w-12 shrink-0">
                      {format(new Date(s.scheduled_at), 'h:mm')}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {s.patients?.first_name?.[0]}{s.patients?.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {s.patients?.first_name} {s.patients?.last_name}
                      </div>
                      <div className="text-xs text-gray-400">{s.session_type} · {s.location}</div>
                    </div>
                    <span className="badge badge-blue text-xs">{s.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <div className="text-3xl mb-2">📅</div>
                <p className="text-sm font-medium mb-1">No sessions today</p>
                <p className="text-xs mb-4">Use NOVA to write notes for past sessions</p>
                <a href="/notes" className="btn btn-primary text-sm">Open NOVA →</a>
              </div>
            )}
          </div>

          {/* Patients */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Active Patients</h2>
              <a href="/patients" className="text-sm text-teal-500 hover:underline">All patients →</a>
            </div>
            {patients && patients.length > 0 ? (
              <div className="space-y-2">
                {patients.slice(0, 6).map((p: any) => (
                  <a key={p.id} href={`/patients/${p.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ background: p.avatar_color }}>
                      {p.first_name?.[0]}{p.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-teal-600">
                        {p.first_name} {p.last_name}
                      </div>
                      <div className="text-xs text-gray-400">{p.diagnosis} · {p.auth_hours}h/wk</div>
                    </div>
                    <span className="badge badge-green text-xs">active</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <div className="text-3xl mb-2">👥</div>
                <p className="text-sm font-medium mb-1">No patients yet</p>
                <a href="/patients/new" className="btn btn-primary text-sm mt-2">Add First Patient</a>
              </div>
            )}
          </div>
        </div>

        {/* NOVA AI CTA */}
        <div className="p-5 rounded-2xl bg-[#0d1829] border border-white/10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-xl shrink-0">
            🤖
          </div>
          <div className="flex-1">
            <div className="text-white font-semibold">NOVA AI is ready</div>
            <div className="text-white/40 text-sm">Write a SOAP note in seconds — just describe what happened in the session</div>
          </div>
          <a href="/notes" className="btn bg-teal-500 text-white hover:bg-teal-400 shrink-0">
            Open NOVA →
          </a>
        </div>
      </main>
    </div>
  )
}
