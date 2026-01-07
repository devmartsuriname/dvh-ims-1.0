import type { User } from '@supabase/supabase-js'

// Re-export Supabase User type for compatibility
export type UserType = User

// Extended profile data from app_user_profile table
export type UserProfile = {
  user_id: string
  full_name: string
  district_code: string | null
  is_active: boolean | null
  created_at: string | null
}
