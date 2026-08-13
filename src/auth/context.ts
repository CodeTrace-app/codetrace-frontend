import { createContext } from 'react'

import type { Organization, Session, User } from '../api/types'

export interface AuthState {
  /** 세션 복원 중. 이 값이 true인 동안 보호된 화면을 로그인으로 보내면 안 된다 */
  loading: boolean
  user: User | null
  organization: Organization | null
  /** 데모 세션이면 true. 쓰기 버튼은 숨기지 않고 비활성 + 안내로 처리한다 */
  readOnly: boolean
  /** 로그인·회원가입·데모 응답을 그대로 넘긴다 */
  signIn: (session: Session) => void
  signOut: () => void
  /** 조직 생성 후 새 토큰과 조직 정보로 갱신한다 */
  setOrganization: (organization: Organization, accessToken: string) => void
}

export const AuthContext = createContext<AuthState | null>(null)
