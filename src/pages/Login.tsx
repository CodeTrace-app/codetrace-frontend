import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { login } from '../api/endpoints';
import { ApiError } from '../api/error';
import { useAuth } from '../auth/useAuth';
import '../styles/button.css'
import '../styles/form.css';

interface LocationState {
  from?: { pathname: string };
}

/* 아직 붙이지 않은 소셜 로그인. 버튼을 지우지 않고 비활성으로 두는 이유는
 * 연동 설정 화면의 "준비 중" 카드와 같다 — 없는 것과 아직인 것은 다르다.
 * GitHub이 가장 앞인 것은 우리가 이미 GitHub App으로 레포를 연동하기 때문이다.
 */

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
      <path
        fill="#1a1d21"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
           0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01
           1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95
           0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27
           2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82
           1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01
           2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

function KakaoMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="#191600"
        d="M12 3C6.99 3 3 6.2 3 10.14c0 2.52 1.66 4.73 4.16 6l-.9 3.3c-.08.3.25.54.51.37l3.96-2.6c.41.05.83.08
           1.27.08 5.01 0 9-3.2 9-7.14S17.01 3 12 3z"
      />
    </svg>
  );
}

const SOCIAL_PROVIDERS = [
  { name: 'GitHub', Mark: GitHubMark },
  { name: 'Google', Mark: GoogleMark },
  { name: 'Kakao', Mark: KakaoMark },
] as const;

export default function Login() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user !== null) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const session = await login(email, password);
      signIn(session);

      if (session.organization === null) {
        navigate('/signup/organization', { replace: true });
        return;
      }
      const from = (location.state as LocationState | null)?.from?.pathname;
      navigate(from ?? '/dashboard', { replace: true });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : '잠시 후 다시 시도해 주세요');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">코드 트레이스</h1>
        <p className="auth__subtitle">로그인</p>

        <form onSubmit={handleSubmit}>
          {error !== null && <p className="auth__error">{error}</p>}

          <div className="auth__field">
            <label className="auth__label">이메일</label>
            <input
              className="auth__input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth__field">
            <label className="auth__label">비밀번호</label>
            <input
              className="auth__input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="auth__submit-btn" disabled={submitting}>
            {submitting ? '확인 중…' : '로그인'}
          </button>
        </form>

        <div className="auth__social">
          <div className="auth__divider">소셜 로그인</div>
          <div className="auth__social-buttons">
            {SOCIAL_PROVIDERS.map(({ name, Mark }) => (
              <button
                key={name}
                type="button"
                className="auth__social-btn"
                disabled
                title="소셜 로그인은 준비 중입니다"
              >
                <Mark />
                {name}
              </button>
            ))}
          </div>
          <p className="auth__social-note">준비 중입니다</p>
        </div>

        <div className="auth__footer">
          계정이 없으신가요? 
          <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
}