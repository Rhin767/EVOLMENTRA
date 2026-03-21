import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export default async function PatientsPage() {
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
    .from('patients').select('*').order('first_name')

  const clinicName = (profile?.clinics as any)?.name || 'Your Clinic'

  const statusBadge: Record<string, string> = {
    active: 'badge-green', inactive: 'badge-amber',
    waitlist: 'badge-purple', discharged: 'badge-red'
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userName={profile?.full_name || 'Therapist'} clinicName={clinicName} />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-400 text-sm">
              {patients?.length ?? 0} total · {patients?.filter(p => p.status === 'active').length ?? 0} active
            </p>
          </div>
          <a href="/patients/new" className="btn btn-primary">+ Add Patient</a>
        </div>

        <div className="card p-0 overflow-hidden">
          {patients && patients.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Patient', 'Diagnosis', 'Insurance', 'Auth', 'Status', ''].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {patients.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ background: p.avatar_color }}>
                          {p.first_name[0]}{p.last_name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{p.first_name} {p.last_name}</div>
                          {p.parent_name && <div className="text-xs text-gray-400">{p.parent_name}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{p.diagnosis}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{p.insurance || '—'}</td>
                    <td className="px-5 py-3.5 text-sm font-mono text-gray-700">{p.auth_hours}h/wk</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${statusBadge[p.status] || 'badge-blue'}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <a href={`/patients/${p.id}`} className="btn btn-secondary text-xs py-1 px-3">View</a>
                        <a href={`/notes?patient=${p.id}`} className="btn text-xs py-1 px-3 bg-teal-50 text-teal-600 hover:bg-teal-100 border border-teal-100">SOAP</a>
                      </div>
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
