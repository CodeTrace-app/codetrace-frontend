import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/button.css'
import '../styles/form.css'; // 똑같이 form.css 사용!

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate('/signup/organization');
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">코드 트레이스</h1>
        <p className="auth__subtitle">작성 배경과 영향 범위를 즉시 파악하는 개발자 도구</p>

        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="auth__submit-btn">
            다음 조직 생성
          </button>
        </form>

        <div className="auth__footer">
          <Link to="/login">로그인 화면으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
}