import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'
import './Layout.css'

/* 헤더 메뉴. 순서는 시안을 따른다.
 *
 * 로그인 전에는 공개 메뉴만 보여준다. 시안 헤더에는 전 메뉴가 그려져 있지만
 * 로그아웃 상태에서 누르면 전부 로그인으로 튕기는 죽은 링크가 된다.
 *
 * PR 경고 이력은 시안 헤더에 없지만 다른 진입 경로가 없어 여기 둔다
 * (막다른 화면을 만들지 않는다).
 */
const PUBLIC_MENU = [{ to: '/pricing', label: '요금제' }]

const MEMBER_MENU = [
  { to: '/pricing', label: '요금제' },
  { to: '/dashboard', label: '대시보드' },
  { to: '/explorer', label: '코드 탐색기' },
  { to: '/pr-warnings', label: 'PR 경고' },
  { to: '/settings/integrations', label: '연동 설정' },
]

/** 관리자 설정은 admin 전용이다 (api-spec §6). 데모 세션은 member라 여기 걸린다 */
const ADMIN_MENU = [{ to: '/admin', label: '관리자 설정' }]

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'layout__nav-link layout__nav-link--active' : 'layout__nav-link'
}

export default function Layout() {
  const { user, organization, readOnly, signOut } = useAuth()
  const navigate = useNavigate()

  const signedIn = user !== null
  const menu = signedIn
    ? [...MEMBER_MENU, ...(user.role === 'admin' ? ADMIN_MENU : [])]
    : PUBLIC_MENU

  function handleSignOut() {
    signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="layout">
      <header className="layout__header">
        {/* 모든 화면에서 돌아갈 곳이 있어야 한다. 막다른 화면을 만들지 않는다 */}
        <Link to={signedIn ? '/dashboard' : '/'} className="layout__logo">
          CodeTrace
        </Link>

        <nav className="layout__nav">
          {menu.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="layout__user">
          {signedIn ? (
            <>
              {/* 데모임을 항상 보이게 둔다. 쓰기가 막히는 이유를 알아야 한다 */}
              {readOnly && <span className="layout__demo-badge">데모 · 읽기 전용</span>}
              {organization !== null && <span className="layout__org">{organization.name}</span>}
              <span>{user.name}</span>
              <button type="button" className="layout__signout" onClick={handleSignOut}>
                {readOnly ? '나가기' : '로그아웃'}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>
                로그인
              </NavLink>
              <NavLink to="/signup" className={navClass}>
                회원가입
              </NavLink>
            </>
          )}
        </div>
      </header>

      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  )
}
