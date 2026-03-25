import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'therapist' | 'patient'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface Patient {
  id: string
  therapist_id: string
  profile_id: string | null
  full_name: string
  email: string
  phone?: string
  birth_date?: string
  diagnosis?: string
  notes?: string
  status: 'active' | 'inactive' | 'pending'
  invitation_token?: string
  invited_at?: string
  created_at: string
  profile?: Profile
}

export interface Session {
  id: string
  therapist_id: string
  patient_id: string
  scheduled_at: string
  duration_minutes: number
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  patient?: Patient
}

export interface Availability {
  id: string
  therapist_id: string
  day_of_week: number // 0=Sunday, 1=Monday...6=Saturday
  start_time: string // HH:MM
  end_time: string   // HH:MM
}

export interface Test {
  id: string
  name: string
  code: string
  description: string
  questions: TestQuestion[]
}

export interface TestQuestion {
  id: number
  text: string
  options: { value: number; label: string }[]
  subscale?: string
}

export interface AssignedTest {
  id: string
  therapist_id: string
  patient_id: string
  test_code: string
  status: 'pending' | 'completed'
  assigned_at: string
  completed_at?: string
  answers?: Record<number, number>
  score?: Record<string, number>
  patient?: Patient
}

export interface MoodEntry {
  id: string
  patient_id: string
  date: string
  mood: number // 1-10
  note?: string
  created_at: string
}

export interface Notification {
  id: string
  patient_id: string
  title: string
  message: string
  type: 'test' | 'appointment' | 'general'
  read: boolean
  created_at: string
}
