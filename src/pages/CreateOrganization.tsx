import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { createOrganization } from '../api/endpoints';
import { ApiError } from '../api/error';
import { useAuth } from '../auth/useAuth';
import '../styles/form.css';

export default function Organization() {
  const navigate = useNavigate();
  const { setOrganization } = useAuth();

  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const created = await createOrganization(orgName);

      // 가입 시점 토큰에는 조직이 없다. 새 토큰으로 바꾸지 않으면
      // 대시보드로 가도 레포 목록이 빈 채로 나온다.
      setOrganization(created.organization, created.access_token);

      navigate('/dashboard', { replace: true });
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : '조직 생성 중 문제가 발생했습니다. 다시 시도해 주세요.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">조직 만들기</h1>
        <p className="auth__subtitle">조직 이름을 정하면 바로 시작할 수 있습니다.</p>

        <form onSubmit={handleSubmit}>
          {error !== null && <p className="auth__error">{error}</p>}

          <div className="auth__field">
            <label className="auth__label">조직 이름</label>
            <input
              className="auth__input"
              type="text"
              value={orgName}
              onChange={(event) => setOrgName(event.target.value)}
              placeholder="에이크미"
              maxLength={100}
              required
            />
          </div>

          {/* 인원 수는 묻지 않는다. 요금제가 레포 수 기준이고 인원은 무제한이라
              여기서 팀 규모를 물으면 인원별 과금으로 오해된다. */}
          <p className="auth__note">
            조직 식별자는 자동으로 만들어집니다. 인원 수 제한은 없습니다.
          </p>

          <button type="submit" className="auth__submit-btn" disabled={submitting}>
            {submitting ? '조직 생성 중…' : '조직 생성하고 시작하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
