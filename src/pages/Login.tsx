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
          <div style={{ color: '#ccc', letterSpacing: '2px' }}>... ... ...</div>
          <div className="auth__social-icons">
            {['G', 'f', '🍎'].map((mark, index) => (
              <span 
                key={index} 
                style={{ cursor: 'not-allowed', opacity: 0.5 }} 
                title="소셜 로그인은 준비 중입니다"
              >
                {mark === 'f' ? <span style={{ color: '#1877F2' }}>{mark}</span> : mark}
              </span>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
            소셜 로그인은 준비 중입니다
          </p>
        </div>

        <div className="auth__footer">
          계정이 없으신가요? 
          <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
}