import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/form.css'; 

export default function Organization() {
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState('');
  const [orgRealName, setOrgRealName] = useState('');
  const [teamSize, setTeamSize] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate('/dashboard'); 
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">조직 이름</h1>
        <p className="auth__subtitle">서비스 이용을 위한 조직 정보를 입력하세요.</p>

        <form onSubmit={handleSubmit}>
          <div className="auth__field">
            <label className="auth__label">조직 이름</label>
            <input
              className="auth__input"
              type="text"
              value={orgName}
              onChange={(event) => setOrgName(event.target.value)}
              required
            />
          </div>

          <div className="auth__field">
            <label className="auth__label">조직 실명 (선택)</label>
            <input
              className="auth__input"
              type="text"
              value={orgRealName}
              onChange={(event) => setOrgRealName(event.target.value)}
            />
          </div>

          <div className="auth__field">
            <label className="auth__label">팀 규모</label>
            <input
              className="auth__input"
              type="text"
              value={teamSize}
              onChange={(event) => setTeamSize(event.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth__submit-btn">
            조직 생성 및 시작하기
          </button>
        </form>
      </div>
    </div>
  );
}