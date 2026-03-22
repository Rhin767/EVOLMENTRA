import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'

export default async function PatientsPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: staff } = await supabase
    .from('staff').select('full_name, clinic_id, clinics(name)').eq('user_id', user.id).single()

  const { data: patients } = await supabase
    .from('patients').select('*').eq('clinic_id', staff?.clinic_id ?? '').order('first_name')

  const clinicName = (staff?.clinics as any)?.name ?? 'Your Clinic'

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
            <div>
              <div className="text-white text-sm font-bold">EvolMentra</div>
              <div className="text-white/30 text-xs truncate">{clinicName}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {[['/dashboard','📊','Dashboard'],['/patients','👥','Patients'],['/sessions','⏱️','Sessions'],['/notes','📝','SOAP Notes'],['/goals','🎯','Goals'],['/billing','💳','Billing']].map(([href,icon,label]) => (
            <a key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${href==='/patients' ? 'bg-teal-500/15 text-teal-400' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}>
              <span className="w-5 text-center">{icon}</span>{label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-400 text-sm">{patients?.length ?? 0} total</p>
          </div>
          <a href="/patients/new" className="btn btn-primary">+ Add Patient</a>
        </div>

        <div className="card p-0 overflow-hidden">
          {patients && patients.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  {['Patient','Diagnosis','Insurance','Status',''].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {patients.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ background: p.avatar_color || '#00d4c8' }}>
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
                    <td className="px-5 py-3.5">
                      <span className={`badge ${statusBadge[p.status] || 'badge-blue'}`}>{p.status}</span>
                    </td>
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
              <a href="/patients/new" className="btn btn-primary mt-3">+ Add Patient</a>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
