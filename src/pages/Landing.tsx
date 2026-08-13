import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { startDemo } from '../api/endpoints'
import { useAuth } from '../auth/useAuth'

/* 랜딩 본문(문제 수치·기능 3개·LLM 비교)은 별도 이슈에서 채운다.
 * 여기서는 데모 진입만 붙였다 — 데모 세션이 일반 세션과 같은 토큰 경로를 쓰는지
 * 확인할 수 있어야 하기 때문이다. */
export default function Landing() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [entering, setEntering] = useState(false)

  async function handleDemo() {
    setEntering(true)
    try {
      signIn(await startDemo())
      navigate('/dashboard')
    } catch {
      setEntering(false)
    }
  }

  return (
    <main>
      <h1>Code Trace</h1>
      <p>랜딩 (P0) — 한 줄 정의 + 데모 체험 CTA + 문제 수치 + 기능 3개 + LLM 비교</p>
      <p>
        <button type="button" onClick={handleDemo} disabled={entering}>
          {entering ? '준비 중…' : '데모 체험'}
        </button>{' '}
        <Link to="/login">로그인</Link> <Link to="/pricing">요금제</Link>
      </p>
    </main>
  )
}
