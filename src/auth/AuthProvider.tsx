import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { fetchMe } from '../api/endpoints'
import { clearSession, loadSession, saveSession } from '../api/session'
import type { StoredSession } from '../api/session'
import type { Organization, Session } from '../api/types'
import { AuthContext } from './context'
import type { AuthState } from './context'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(() => loadSession())
  const [loading, setLoading] = useState(true)

  // 새로고침 시 저장된 토큰이 아직 유효한지 서버에 확인한다.
  // 만료된 토큰으로 화면을 열어두면 이후 호출이 전부 401로 깨진다.
  useEffect(() => {
    const stored = loadSession()
    if (stored === null) {
      setLoading(false)
      return
    }

    let alive = true
    fetchMe()
      .then((me) => {
        if (!alive) return
        const restored: StoredSession = {
          access_token: stored.access_token,
          read_only: me.read_only ?? false,
          user: me.user,
          organization: me.organization,
        }
        saveSession(restored)
        setSession(restored)
      })
      .catch(() => {
        if (!alive) return
        clearSession()
        setSession(null)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  const signIn = useCallback((incoming: Session) => {
    const stored: StoredSession = {
      access_token: incoming.access_token,
      read_only: incoming.read_only ?? false,
      user: incoming.user,
      organization: incoming.organization,
    }
    saveSession(stored)
    setSession(stored)
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const setOrganization = useCallback((organization: Organization, accessToken: string) => {
    setSession((previous) => {
      if (previous === null) return previous
      // 조직 생성 응답의 새 토큰으로 교체한다. 가입 시점 토큰에는 조직이 없어
      // 그대로 두면 이후 조회가 빈 결과를 받는다.
      const updated: StoredSession = { ...previous, access_token: accessToken, organization }
      saveSession(updated)
      return updated
    })
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      loading,
      user: session?.user ?? null,
      organization: session?.organization ?? null,
      readOnly: session?.read_only ?? false,
      signIn,
      signOut,
      setOrganization,
    }),
    [loading, session, signIn, signOut, setOrganization],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
