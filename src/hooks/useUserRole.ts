import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

export type AppRole = 
  | 'system_admin'
  | 'minister'
  | 'project_leader'
  | 'frontdesk_bouwsubsidie'
  | 'frontdesk_housing'
  | 'admin_staff'
  | 'audit'
  | 'social_field_worker'
  | 'technical_inspector'

interface UseUserRoleReturn {
  roles: AppRole[]
  district: string | null
  loading: boolean
  hasRole: (role: AppRole) => boolean
  hasAnyRole: (roles: AppRole[]) => boolean
  isNationalRole: boolean
  isDistrictScoped: boolean
}

export const useUserRole = (): UseUserRoleReturn => {
  const [roles, setRoles] = useState<AppRole[]>([])
  const [district, setDistrict] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRoleData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        // Fetch user roles
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)

        if (roleError) {
          console.error('Error fetching roles:', roleError)
        } else {
          setRoles((roleData?.map(r => r.role) || []) as AppRole[])
        }

        // Fetch user profile with district
        const { data: profile, error: profileError } = await supabase
          .from('app_user_profile')
          .select('district_code')
          .eq('user_id', user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError)
        } else {
          setDistrict(profile?.district_code || null)
        }
      } catch (error) {
        console.error('Error in useUserRole:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRoleData()
  }, [])

  const hasRole = useCallback((role: AppRole): boolean => {
    return roles.includes(role)
  }, [roles])

  const hasAnyRole = useCallback((checkRoles: AppRole[]): boolean => {
    return checkRoles.some(role => roles.includes(role))
  }, [roles])

  const isNationalRole = roles.some(role => 
    ['system_admin', 'minister', 'project_leader', 'audit'].includes(role)
  )

  const isDistrictScoped = roles.some(role =>
    ['frontdesk_bouwsubsidie', 'frontdesk_housing', 'admin_staff', 'social_field_worker'].includes(role)
  ) && !isNationalRole

  return {
    roles,
    district,
    loading,
    hasRole,
    hasAnyRole,
    isNationalRole,
    isDistrictScoped,
  }
}
