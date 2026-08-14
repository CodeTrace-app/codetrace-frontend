import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from './useAuth'

interface Props {
  /** 조직 생성 화면 자신은 조직이 없어야 들어온다. 그 화면만 false로 쓴다 */
  requireOrganization?: boolean
}

/** 로그인이 필요한 화면을 감싼다. 데모 세션도 로그인 상태로 본다 — 읽기 전용일 뿐이다. */
export default function RequireAuth({ requireOrganization = true }: Props) {
  const { loading, user, organization } = useAuth()
  const location = useLocation()

  // 세션 복원이 끝나기 전에 판단하면, 새로고침할 때마다 로그인 화면이 한 번 스친다
  if (loading) return null

  if (user === null) {
    // 로그인 후 원래 가려던 곳으로 돌려보내기 위해 위치를 넘긴다
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 가입은 했지만 조직이 없는 상태. 조직 없이는 조회가 전부 빈 결과다
  if (requireOrganization && organization === null) {
    return <Navigate to="/signup/organization" replace />
  }

  return <Outlet />
}
