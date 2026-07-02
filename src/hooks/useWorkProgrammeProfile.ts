import { useCallback, useEffect, useState } from 'react'
import { deleteWorkProgrammeProfile, fetchWorkProgrammeProfile, saveWorkProgrammeProfile } from '../api/workProgrammes'
import { useAuth } from '../context/AuthContext'
import type { CareerProfile } from '../types/careerHub'
import { readCareerProfile, writeCareerProfile } from '../utils/careerHub/profileStorage'

type UseWorkProgrammeProfileResult = {
  profile: CareerProfile | null
  loading: boolean
  saveProfile: (profile: CareerProfile) => Promise<void>
  clearProfile: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export function useWorkProgrammeProfile(): UseWorkProgrammeProfileResult {
  const { user } = useAuth()
  const [profile, setProfile] = useState<CareerProfile | null>(() => readCareerProfile())
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    setLoading(true)
    try {
      if (!user) {
        setProfile(readCareerProfile())
        return
      }

      const remote = await fetchWorkProgrammeProfile()
      if (remote) {
        writeCareerProfile(remote)
        setProfile(remote)
        return
      }
      const local = readCareerProfile()
      if (local) {
        const saved = await saveWorkProgrammeProfile(local)
        writeCareerProfile(saved)
        setProfile(saved)
        return
      }
      setProfile(null)
    } catch {
      setProfile(readCareerProfile())
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void refreshProfile()
  }, [refreshProfile])

  const saveProfile = useCallback(
    async (next: CareerProfile) => {
      writeCareerProfile(next)
      setProfile(next)
      if (user) {
        const saved = await saveWorkProgrammeProfile(next)
        writeCareerProfile(saved)
        setProfile(saved)
      }
    },
    [user],
  )

  const clearProfile = useCallback(async () => {
    localStorage.removeItem('apply_once_career_profile_v1')
    setProfile(null)
    if (user) {
      try {
        await deleteWorkProgrammeProfile()
      } catch {
        // ignore — local cleared
      }
    }
  }, [user])

  return { profile, loading, saveProfile, clearProfile, refreshProfile }
}
