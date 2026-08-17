import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { startDemo } from '../api/endpoints';
import { useAuth } from '../auth/useAuth';
import './Landing.css';
import '../styles/button.css';

/* 랜딩의 비교표. 근거 없는 수치를 쓰지 않고, 우리가 실제로 하는 것만 적는다. */
const COMPARISON = [
  {
    question: '이 함수는 왜 이렇게 짜였나',
    llm: '코드만 보고 추측한다',
    ours: '그 함수를 바꾼 커밋과 PR 리뷰를 근거로 보여준다',
  },
  {
    question: '고치면 어디가 깨지나',
    llm: '물어본 파일 안에서만 답한다',
    ours: '레포 전체를 파싱해 참조 위치를 2단계까지 찾는다',
  },
  {
    question: '근거가 없을 때',
    llm: '그럴듯한 설명을 만들어 낸다',
    ours: '변경 이력 없음을 명시한다',
  },
  {
    question: '언제 알려주나',
    llm: '물어봐야 답한다',
    ours: 'PR을 올리면 묻지 않아도 경고한다',
  },
];

export default function Landing() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [entering, setEntering] = useState(false);

  async function handleDemo() {
    setEntering(true);
    try {
      signIn(await startDemo());
      navigate('/dashboard');
    } catch {
      setEntering(false);
    }
  }

  return (
    <div className="landing-wrapper">
      <section className="hero-section">
        <h1>래거시 코드, 이제 맥락까지 이해하세요.</h1>
        <p>커밋-PR 이력을 근거로 코드 작성 배경을 요약하고 영향 범위를 분석합니다. 신규 합류 개발자의 온보딩 시간을 단축하는 개발자 도구입니다.</p>
        <div className="button-group">
          <button 
            className="primary-btn" 
            onClick={handleDemo}
            disabled={entering}
          >
            {entering ? '준비 중…' : '데모 체험하기'}
          </button>
          <button className="secondary-btn" onClick={() => navigate('/pricing')}>
            요금제 보기
          </button>
        </div>
      </section>

      <section className="content-section">
        <h2>개발팀이 겪는 실제 문제</h2>
        <div className="card-container">
          <div className="card">
            <span className="card-tag">신규 합류 후 코드 맥락 파악</span>
            <h3>평균 3~4주 소요</h3>
            <p>인터뷰에 응한 현직 개발자 8명 중 87%가 사수 문의를 대체할 도구가 없다고 응답했습니다.</p>
          </div>
          <div className="card">
            <span className="card-tag">AI 코딩 도구 한계</span>
            <h3>맥락 없는 응답</h3>
            <p>범용 LLM은 왜 이 코드가 이렇게 작성됐는지 설명하지 못합니다. 커밋 이력이 없기 때문입니다.</p>
          </div>
          <div className="card">
            <span className="card-tag">PR 리뷰 사각지대</span>
            <h3>숨겨진 영향 범위</h3>
            <p>변경된 함수가 어디에서 참조되는지 파악하지 못한 채 머지되는 경우가 반복됩니다.</p>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h2>핵심 기능</h2>
        <div className="card-container">
          <div className="card">
            <h3>작성 배경 추적</h3>
            <p>선택한 함수나 코드 블록에 연결된 커밋 메시지와 PR 리뷰를 근거로 작성 배경을 자연어로 요약합니다.</p>
            <p className="sub-text">근거가 없을 때는 추측하지 않고 근거 부족을 명시합니다.</p>
          </div>
          <div className="card">
            <h3>영향 범위 분석</h3>
            <p>특정 함수를 변경하면 어디에 영향이 가는지 2단계 깊이의 호출 그래프로 즉시 확인합니다.</p>
            <p className="sub-text">15개 초과 노드는 자동 접기로 과열을 방지합니다.</p>
          </div>
          <div className="card">
            <h3>PR 사전 경고</h3>
            <p>PR 생성 시 시그니처 변경 함수 삭제가 감지되면 영향받는 미수정 참조 지점을 코멘트로 자동 기록합니다.</p>
            <p className="sub-text">자동 수정이나 머지 차단 없이 참고 수준으로 제공합니다.</p>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h2>범용 LLM과 무엇이 다른가</h2>
        <div className="table-container">
          <div className="table-header">
            <span>묻는 것</span>
            <span>범용 LLM</span>
            <span>코드 트레이스</span>
          </div>
          {COMPARISON.map((row) => (
            <div key={row.question} className="table-row">
              <div className="table-cell table-cell--label">{row.question}</div>
              <div className="table-cell">{row.llm}</div>
              <div className="table-cell table-cell--ours">{row.ours}</div>
            </div>
          ))}
        </div>
      </section>


      <section className="demo-section">
        <h2>3분 시연으로 직접 확인하세요</h2>
        <div className="demo-container">
          <div className="demo-video-card">
            <div className="video-placeholder">시연 영상 썸네일</div>
            <h3>3분 시연 영상</h3>
            <p>동일한 레거시 코드에 범용 LLM과 코드 트레이스가 각각 어떻게 응답하는지 비교합니다.</p>
          </div>
          <div className="demo-repo-card">
            <h3>데모 레포 체험</h3>
            <p>2년차 커밋 이력이 담긴 샘플 레포를 로그인 없이 바로 탐색해 볼 수 있습니다.</p>
            <button 
              className="primary-btn full-width" 
              onClick={handleDemo}
              disabled={entering}
            >
              {entering ? '준비 중…' : '코드 탐색기 바로 열기'}
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <Link to="/pricing" className="footer-link">요금제 확인</Link>
        <Link to="/login" className="footer-link">로그인</Link>
      </footer>
    </div>
  );
}