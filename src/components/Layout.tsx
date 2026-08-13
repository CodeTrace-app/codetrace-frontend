import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'
import './Layout.css'

/** 헤더에 놓는 메뉴. 준비 안 된 화면은 여기 올리지 않는다 */
const MENU = [
  { to: '/dashboard', label: '대시보드' },
  { to: '/explorer', label: '코드 탐색기' },
  { to: '/pr-warnings', label: 'PR 경고' },
  { to: '/settings/integrations', label: '연동 설정' },
  { to: '/admin', label: '관리자 설정' },
]

export default function Layout() {
  const { user, organization, readOnly, signOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="layout">
      <header className="layout__header">
        {/* 모든 화면에서 대시보드로 돌아갈 수 있어야 한다. 막다른 화면을 만들지 않는다 */}
        <Link to="/dashboard" className="layout__logo">
          <span className="layout__logo-mark" aria-hidden="true" />
          Code Trace
        </Link>

        <nav className="layout__nav">
          {MENU.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'layout__nav-link layout__nav-link--active' : 'layout__nav-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="layout__user">
          {readOnly && <span className="layout__demo-badge">데모 · 읽기 전용</span>}
          {organization !== null && <span className="layout__org">{organization.name}</span>}
          {user !== null && <span>{user.name}</span>}
          <button type="button" className="layout__signout" onClick={handleSignOut}>
            {readOnly ? '나가기' : '로그아웃'}
          </button>
        </div>
      </header>

      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  )
}
