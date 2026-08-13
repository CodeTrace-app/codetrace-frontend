import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { startDemo } from '../api/endpoints'
import { useAuth } from '../auth/useAuth'
import '../styles/button.css'

/* 히어로와 데모 진입만 붙였다. 문제 수치·기능 3개·LLM 비교·시연 영상은 랜딩 이슈에서 채운다.
 * 데모 진입을 먼저 둔 이유는, 데모 세션이 일반 세션과 같은 토큰 경로를 쓰는지
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
      // 실패해도 에러 화면을 띄우지 않는다. 버튼만 되돌린다
      setEntering(false)
    }
  }

  return (
    <main>
      <h1>레거시 코드, 이제 맥락까지 이해하세요.</h1>
      <p>
        커밋·PR 이력을 근거로 코드 작성 배경을 요약하고 영향 범위를 분석합니다. 신규 합류 개발자의
        온보딩 시간을 단축하는 개발자 도구입니다.
      </p>
      <p>
        <button
          type="button"
          className="button button--primary"
          onClick={handleDemo}
          disabled={entering}
        >
          {entering ? '준비 중…' : '데모 체험하기'}
        </button>{' '}
        <button type="button" className="button button--secondary" onClick={() => navigate('/pricing')}>
          요금제 보기
        </button>
      </p>
      <p>랜딩 (P0) — 문제 수치 + 기능 3개 + LLM 비교 + 시연 영상은 별도 이슈</p>
    </main>
  )
}
