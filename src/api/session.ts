/* 세션 저장소.
 *
 * 새로고침해도 로그인이 유지되어야 하므로 localStorage에 둔다.
 * 데모 세션도 같은 경로를 쓴다 — 읽기 전용 토큰일 뿐 우회로가 아니다.
 *
 * React 밖(api 클라이언트)에서도 토큰을 읽어야 해서 컨텍스트가 아니라 모듈로 둔다.
 */

import type { Organization, User } from './types'

const KEY = 'codetrace.session'

export interface StoredSession {
  access_token: string
  read_only: boolean
  user: User
  /** 조직 생성 전이면 null */
  organization: Organization | null
}

/** 저장된 값이 우리가 기대하는 형태인지 본다. 옛 버전이 남아 있으면 화면이 깨진다 */
function isStoredSession(value: unknown): value is StoredSession {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<StoredSession>
  return typeof candidate.access_token === 'string' && typeof candidate.user === 'object'
}

export function loadSession(): StoredSession | null {
  const raw = localStorage.getItem(KEY)
  if (raw === null) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isStoredSession(parsed)) {
      localStorage.removeItem(KEY)
      return null
    }
    return parsed
  } catch {
    localStorage.removeItem(KEY)
    return null
  }
}

export function saveSession(session: StoredSession): void {
  localStorage.setItem(KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(KEY)
}

/** api 클라이언트가 Authorization 헤더를 채울 때 쓴다 */
export function currentToken(): string | null {
  return loadSession()?.access_token ?? null
}
