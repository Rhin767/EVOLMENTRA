'use client'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const nav = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/patients',  icon: '👥', label: 'Patients' },
  { href: '/schedule',  icon: '📅', label: 'Schedule' },
  { href: '/sessions',  icon: '⏱️', label: 'Sessions' },
  { href: '/notes',     icon: '📝', label: 'SOAP Notes' },
  { href: '/goals',     icon: '🎯', label: 'Goals' },
  { href: '/billing',   icon: '💳', label: 'Billing' },
]

export default function Sidebar({
  userName, clinicName
}: { userName: string; clinicName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside className="w-60 shrink-0 flex flex-col min-h-screen bg-[#0d1829]">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-sm font-black">
            E
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-bold leading-tight">EvolMentra</div>
            <div className="text-white/30 text-xs leading-tight truncate">{clinicName}</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <a key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-teal-500/15 text-teal-400'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}>
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </a>
          )
        })}
      </nav>

      {/* NOVA quick access */}
      <div className="px-3 pb-3">
        <a href="/notes"
          className="flex items-center gap-3 px-3 py-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-semibold hover:bg-teal-500/20 transition-all">
          <span>🤖</span>
          NOVA AI
          <span className="ml-auto w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
        </a>
      </div>

      {/* User + sign out */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">{userName}</div>
          </div>
          <button onClick={signOut}
            className="text-white/20 hover:text-white/60 text-sm transition-colors"
            title="Sign out">
            ↩
          </button>
        </div>
      </div>
    </aside>
  )
}
