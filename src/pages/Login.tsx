import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { login } from '../api/endpoints'
import { ApiError } from '../api/error'
import { useAuth } from '../auth/useAuth'
import '../styles/form.css'

interface LocationState {
  from?: { pathname: string }
}

export default function Login() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // 이미 로그인한 상태로 들어오면 대시보드로 보낸다
  if (user !== null) return <Navigate to="/dashboard" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const session = await login(email, password)
      signIn(session)

      // 조직이 없으면 조직 생성부터. 있으면 원래 가려던 곳으로.
      if (session.organization === null) {
        navigate('/signup/organization', { replace: true })
        return
      }
      const from = (location.state as LocationState | null)?.from?.pathname
      navigate(from ?? '/dashboard', { replace: true })
    } catch (caught) {
      // 실패해도 화면을 갈아치우지 않는다. 폼 위에 문구만 띄운다
      setError(caught instanceof ApiError ? caught.message : '잠시 후 다시 시도해 주세요')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth">
      <form className="auth__card" onSubmit={handleSubmit}>
        <h1 className="auth__title">로그인</h1>
        <p className="auth__subtitle">Code Trace</p>

        {error !== null && <p className="auth__error">{error}</p>}

        <label className="auth__field">
          <span className="auth__label">이메일</span>
          <input
            className="auth__input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="auth__field">
          <span className="auth__label">비밀번호</span>
          <input
            className="auth__input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button className="auth__submit" type="submit" disabled={submitting}>
          {submitting ? '확인 중…' : '로그인'}
        </button>

        {/* 회원가입과 별도 화면이고 상호 이동 링크를 둔다. 소셜 로그인·비밀번호 찾기는 범위 밖 */}
        <p className="auth__footer">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </form>
    </div>
  )
}
