import { use } from 'react'

import { AuthContext } from './context'
import type { AuthState } from './context'

/** 로그인 상태·데모 여부를 읽는다. AuthProvider 밖에서 부르면 바로 실패시킨다 */
export function useAuth(): AuthState {
  const value = use(AuthContext)
  if (value === null) {
    throw new Error('useAuth는 AuthProvider 안에서만 쓸 수 있습니다')
  }
  return value
}
