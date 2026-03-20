import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Types matching our schema
export type Profile = {
  id: string
  clinic_id: string
  full_name: string
  title: string
  email: string
  role: 'admin' | 'bcba' | 'therapist' | 'rbt'
}

export type Patient = {
  id: string
  clinic_id: string
  first_name: string
  last_name: string
  date_of_birth?: string
  diagnosis: string
  insurance?: string
  member_id?: string
  auth_hours: number
  auth_expiry?: string
  parent_name?: string
  parent_email?: string
  parent_phone?: string
  status: 'active' | 'inactive' | 'waitlist' | 'discharged'
  avatar_color: string
  created_at: string
}

export type Session = {
  id: string
  patient_id: string
  therapist_id: string
  clinic_id: string
  scheduled_at: string
  started_at?: string
  ended_at?: string
  duration_min?: number
  session_type: string
  location: string
  cpt_code: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
}

export type SessionNote = {
  id: string
  session_id: string
  patient_id: string
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
  full_note?: string
  nova_generated: boolean
  signed_at?: string
  locked: boolean
}

export type Goal = {
  id: string
  patient_id: string
  domain: string
  title: string
  description?: string
  target_pct: number
  current_pct: number
  status: 'active' | 'mastered' | 'discontinued' | 'on_hold'
}
