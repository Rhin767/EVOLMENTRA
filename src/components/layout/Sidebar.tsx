'use client'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const nav = [
  { href: '/dashboard',  icon: '📊', label: 'Dashboard' },
  { href: '/patients',   icon: '👥', label: 'Patients' },
  { href: '/schedule',   icon: '📅', label: 'Schedule' },
  { href: '/sessions',   icon: '⏱️', label: 'Sessions' },
  { href: '/notes',      icon: '📝', label: 'SOAP Notes' },
  { href: '/goals',      icon: '🎯', label: 'Goals' },
  { href: '/billing',    icon: '💳', label: 'Billing' },
]

export default function Sidebar({ userName, clinicName }: { userName: string, clinicName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col min-h-screen bg-[#0d1829] text-white">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-em-teal to-em-blue flex items-center justify-center text-sm font-black">E</div>
          <div>
            <div className="text-sm font-bold leading-tight">EvolMentra</div>
            <div className="text-xs text-white/30 leading-tight truncate max-w-[120px]">{clinicName}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {nav.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <a key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-em-teal/15 text-em-teal' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </a>
          )
        })}
      </nav>

      {/* NOVA AI quick access */}
      <div className="p-3">
        <a href="/notes" className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-em-teal/20 to-em-blue/20 border border-em-teal/20 text-em-teal text-sm font-semibold hover:from-em-teal/30 transition-all">
          <span>🤖</span>
          NOVA AI Notes
        </a>
      </div>

      {/* User */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-em-teal/20 flex items-center justify-center text-em-teal text-sm font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{userName}</div>
          </div>
          <button onClick={signOut} className="text-white/30 hover:text-white text-xs" title="Sign out">
            ↩
          </button>
        </div>
      </div>
    </aside>
  )
}
