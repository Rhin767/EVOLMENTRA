import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: staff } = await supabase
    .from('staff').select('full_name, clinic_id, clinics(name)').eq('user_id', user.id).single()

  const { data: patients } = await supabase
    .from('patients').select('id, first_name, last_name, diagnosis, auth_hours_per_week, status, avatar_color')
    .eq('clinic_id', staff?.clinic_id ?? '').eq('status', 'active').order('first_name').limit(6)

  const clinicName = (staff?.clinics as any)?.name ?? 'Your Clinic'
  const firstName = staff?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 shrink-0 bg-[#0d1829] flex flex-col">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-sm font-black">E</div>
            <div>
              <div className="text-white text-sm font-bold">EvolMentra</div>
              <div className="text-white/30 text-xs truncate">{clinicName}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {[
            ['/dashboard','📊','Dashboard'],
            ['/patients','👥','Patients'],
            ['/sessions','⏱️','Sessions'],
            ['/notes','📝','SOAP Notes'],
            ['/goals','🎯','Goals'],
            ['/billing','💳','Billing'],
          ].map(([href,icon,label]) => (
            <a key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${href==='/dashboard' ? 'bg-teal-500/15 text-teal-400' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}>
              <span className="w-5 text-center">{icon}</span>{label}
            </a>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <a href="/notes" className="flex items-center gap-3 px-3 py-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-semibold hover:bg-teal-500/20 transition-all">
            <span>🤖</span>NOVA AI<span className="ml-auto w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          </a>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good morning, {firstName} 👋</h1>
            <p className="text-gray-400 text-sm mt-0.5">{clinicName}</p>
          </div>
          <div className="flex gap-3">
            <a href="/notes" className="btn btn-secondary text-sm">🤖 NOVA AI Note</a>
            <a href="/patients/new" className="btn btn-primary text-sm">+ Add Patient</a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: '👥', value: patients?.length ?? 0, label: 'Active Patients', color: 'text-teal-500' },
            { icon: '🤖', value: 'Live', label: 'NOVA AI Ready', color: 'text-purple-500' },
            { icon: '🔒', value: 'HIPAA', label: 'Secure & Encrypted', color: 'text-emerald-500' },
          ].map(s => (
            <div key={s.label} className="card">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{s.icon}</span>
                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              </div>
              <div className="text-sm font-semibold text-gray-800">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Active Patients</h2>
            <a href="/patients" className="text-sm text-teal-500 hover:underline">All patients →</a>
          </div>
          {patients && patients.length > 0 ? (
            <div className="space-y-2">
              {patients.map((p: any) => (
                <a key={p.id} href={`/patients`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: p.avatar_color || '#00d4c8' }}>
                    {p.first_name?.[0]}{p.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{p.first_name} {p.last_name}</div>
                    <div className="text-xs text-gray-400">{p.diagnosis}</div>
                  </div>
                  <span className="badge badge-green text-xs">active</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">👥</div>
              <p className="text-sm mb-3">No patients yet</p>
              <a href="/patients/new" className="btn btn-primary text-sm">Add First Patient</a>
            </div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1829] border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-xl shrink-0">🤖</div>
          <div className="flex-1">
            <div className="text-white font-semibold">NOVA AI is ready</div>
            <div className="text-white/40 text-sm">Write a SOAP note in seconds</div>
          </div>
          <a href="/notes" className="btn bg-teal-500 text-white hover:bg-teal-400 shrink-0 text-sm">Open NOVA →</a>
        </div>
      </main>
    </div>
  )
}
