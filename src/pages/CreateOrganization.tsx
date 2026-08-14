import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// 💡 방금 우리가 완벽하게 통일해둔 그 폼 스타일을 그대로 씁니다!
import '../styles/form.css'; 

export default function Organization() {
  const navigate = useNavigate();

  // 사진에 있는 3가지 입력 필드 상태 관리
  const [orgName, setOrgName] = useState('');
  const [orgRealName, setOrgRealName] = useState('');
  const [teamSize, setTeamSize] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    // (나중에 여기에 PM님이 주실 조직 생성 API가 들어갈 자리)
    
    // 폼 제출 후 대시보드로 이동하도록 임시 연결
    navigate('/dashboard'); 
  }

  return (
    <div className="auth">
      <div className="auth__card">
        {/* 타이틀 및 서브타이틀 */}
        <h1 className="auth__title">조직 이름</h1>
        <p className="auth__subtitle">서비스 이용을 위한 조직 정보를 입력하세요.</p>

        <form onSubmit={handleSubmit}>
          {/* 1. 조직 이름 */}
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

          {/* 2. 조직 실명 (선택) */}
          <div className="auth__field">
            <label className="auth__label">조직 실명 (선택)</label>
            <input
              className="auth__input"
              type="text"
              value={orgRealName}
              onChange={(event) => setOrgRealName(event.target.value)}
              // 선택 사항이므로 required 속성 뺌
            />
          </div>

          {/* 3. 팀 규모 */}
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

          {/* 제출 버튼 */}
          <button type="submit" className="auth__submit-btn">
            조직 생성 및 시작하기
          </button>
        </form>
      </div>
    </div>
  );
}