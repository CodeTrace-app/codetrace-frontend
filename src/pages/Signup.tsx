import { Link } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
  return (
    <div className="auth-wrapper">
      <header className="auth-header">
        <Link to="/" className="logo">CodeTrace</Link>
        <nav className="nav-links">
          <Link to="/pricing">요금제</Link>
          <Link to="/dashboard">대시보드</Link>
          <Link to="/explorer">코드 탐색기</Link>
          {/* PM님 코드 기준 연동 설정 경로는 /settings/integrations 야 */}
          <Link to="/settings/integrations">연동 설정</Link>
          <Link to="/admin">관리자 설정</Link>
        </nav>
        <div className="auth-links">
          <Link to="/login">로그인</Link>
          <span className="user-btn">사용자</span>
        </div>
      </header>

      <main className="auth-container">
        <h1 className="auth-title">코드 트레이스</h1>
        <p className="auth-subtitle">작성 배경과 영향 범위를 즉시 파악하는 개발자 도구</p>

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <label>이름</label>
            <input type="text" />
          </div>
          <div className="input-group">
            <label>이메일 주소</label>
            <input type="email" />
          </div>
          <div className="input-group">
            <label>비밀번호</label>
            <input type="password" />
          </div>
          <div className="input-group">
            <label>비밀번호 확인</label>
            <input type="password" />
          </div>
          <button type="submit" className="auth-submit-btn">다음 조직 생성</button>
        </form>

        <div className="auth-footer-link">
          <Link to="/login" className="back-link">로그인 화면으로 돌아가기</Link>
        </div>
      </main>
    </div>
  );
};

export default Signup;