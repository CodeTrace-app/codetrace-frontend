import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { createOrganization } from '../api/endpoints'; 
import { ApiError } from '../api/error';
import '../styles/form.css'; 

export default function Organization() {
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState('');
  const [orgRealName, setOrgRealName] = useState('');
  const [teamSize, setTeamSize] = useState('');

  // 🚀 추가된 부분: 에러 상태와 로딩(버튼 중복 클릭 방지) 상태 관리
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await createOrganization(orgName);
      
      navigate('/dashboard', { replace: true }); 
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : '조직 생성 중 문제가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">조직 이름</h1>
        <p className="auth__subtitle">서비스 이용을 위한 조직 정보를 입력하세요.</p>

        <form onSubmit={handleSubmit}>
          {error !== null && <p className="auth__error">{error}</p>}

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

          <button type="submit" className="auth__submit-btn" disabled={submitting}>
            {submitting ? '조직 생성 중…' : '조직 생성 및 시작하기'}
          </button>
        </form>
      </div>
    </div>
  );
}