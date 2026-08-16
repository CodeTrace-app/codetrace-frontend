import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { signup } from '../api/endpoints';
import { ApiError } from '../api/error';
import { useAuth } from '../auth/useAuth';
import '../styles/button.css'
import '../styles/form.css';

export default function Signup() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setSubmitting(true);

    try {
      const session = await signup( name, email, password );
      signIn(session);

      if (session.organization === null) {
        navigate('/signup/organization', { replace: true });
        return;
      }
      navigate('/dashboard', { replace: true });
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
        <p className="auth__subtitle">작성 배경과 영향 범위를 즉시 파악하는 개발자 도구</p>

        <form onSubmit={handleSubmit}>
          {error !== null && <p className="auth__error">{error}</p>}

          <div className="auth__field">
            <label className="auth__label">이름</label>
            <input
              className="auth__input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="auth__field">
            <label className="auth__label">이메일 주소</label>
            <input
              className="auth__input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              required
            />
          </div>

          <div className="auth__field">
            <label className="auth__label">비밀번호 확인</label>
            <input
              className="auth__input"
              type="password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth__submit-btn" disabled={submitting}>
            {submitting ? '가입 중…' : '다음 조직 생성'}
          </button>
        </form>

        <div className="auth__footer">
          <Link to="/login">로그인 화면으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
}