import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQueryLogs, fetchPlan, fetchIntegrations } from '../api/endpoints';
import { ApiError } from '../api/error';
import type { Integrations, Paged, PlanInfo, QueryLog } from '../api/types';
import './Admin.css';

const PLAN_LABEL: Record<string, string> = {
  starter: 'Starter',
  team: 'Team',
  business: 'Business',
};

const ACTION_LABEL: Record<string, string> = {
  context_view: '맥락 조회',
  graph_view: '영향 범위 조회',
};

export default function AdminSettings() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<Paged<QueryLog> | null>(null);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [github, setGithub] = useState<Integrations['github'] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page] = useState(1);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [planInfo, queryLogs, integrations] = await Promise.all([
          fetchPlan(),
          fetchQueryLogs(page),
          fetchIntegrations(),
        ]);
        if (!alive) return;
        setPlan(planInfo);
        setLogs(queryLogs);
        setGithub(integrations.github);
        setErrorMsg(null);
      } catch (err) {
        if (!alive) return;
        setErrorMsg(
          err instanceof ApiError && err.status === 403
            ? '관리자만 볼 수 있는 화면입니다. 데모 세션과 일반 사용자는 접근할 수 없습니다.'
            : '관리자 데이터를 불러오지 못했습니다.',
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [page]);

  const formatDate = (value: string) => {
    const d = new Date(value);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  if (loading && plan === null) return <div className="loading">로딩 중…</div>;

  if (errorMsg) {
    return (
      <div className="error-container">
        <h2>접근 권한 없음</h2>
        <p>{errorMsg}</p>
        <button className="btn-primary" onClick={() => navigate('/dashboard')}>
          대시보드로 돌아가기
        </button>
      </div>
    );
  }

  const connected = github?.status === 'connected';

  return (
    <div className="admin-page-wrapper">
      <div className="admin-settings-page">
        <div className="page-header">
          <h1 className="page-title">관리자 설정</h1>
          <button className="btn-primary" onClick={() => navigate('/settings/integrations')}>
            연동 설정으로 이동
          </button>
        </div>

        <div className="summary-cards-grid">
          <div className="summary-card">
            <span className="card-label">현재 요금제</span>
            <h2 className="card-value">
              {plan ? `${PLAN_LABEL[plan.plan] ?? plan.plan} 플랜` : '-'}
            </h2>
            <p className="card-desc">
              {plan
                ? `월 ${plan.price_krw.toLocaleString()}원 · 인덱싱 레포 ${plan.repo_limit}개 · 인원 무제한`
                : '요금제 정보를 불러오지 못했습니다'}
            </p>
            <button className="btn-outline-wide" onClick={() => navigate('/pricing')}>
              요금제 변경
            </button>
          </div>

          <div className="summary-card">
            <span className="card-label">사용 중인 레포</span>
            <h2 className="card-value">
              {plan ? `${plan.repos_used} / ${plan.repo_limit}개` : '-'}
            </h2>
            <p className="card-desc">
              {plan && plan.repos_used >= plan.repo_limit
                ? '한도에 도달했습니다. 레포를 더 추가하려면 요금제를 올리세요'
                : '인덱싱 중인 레포 수입니다'}
            </p>
          </div>

          <div className="summary-card">
            <span className="card-label">GitHub 연동</span>
            <h2 className="card-value">{connected ? '연결됨' : '연결 안 됨'}</h2>
            <p className="card-desc">
              {connected
                ? `계정 ${github?.account ?? '-'}`
                : '연동 설정에서 GitHub App을 설치하세요'}
            </p>
            <button className="btn-text-link" onClick={() => navigate('/settings/integrations')}>
              연동 설정 관리
            </button>
          </div>
        </div>

        <div className="admin-section">
          <h2 className="section-title">질의 이력</h2>
          <p className="section-desc">
            조직원이 어떤 코드의 맥락과 영향 범위를 조회했는지 남습니다. 90일이 지나면 자동으로
            삭제됩니다.
          </p>

          <div className="table-responsive-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>일시</th>
                  <th>사용자</th>
                  <th>레포</th>
                  <th>대상</th>
                  <th>질의 유형</th>
                </tr>
              </thead>
              <tbody>
                {logs && logs.items.length > 0 ? (
                  logs.items.map((log) => (
                    <tr key={log.id}>
                      <td className="text-gray">{formatDate(log.created_at)}</td>
                      <td>{log.user_name}</td>
                      <td className="text-gray">{log.repo}</td>
                      <td className="target-code">{log.target}</td>
                      <td>
                        <span className="action-tag">{ACTION_LABEL[log.action] ?? log.action}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="table-empty">
                      아직 조회 기록이 없습니다. 코드 탐색기에서 함수를 열면 여기에 남습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {logs && logs.total > logs.items.length && (
            <p className="table-note">
              전체 {logs.total.toLocaleString()}건 중 {logs.items.length}건 표시
            </p>
          )}
        </div>

        <div className="page-footer">
          <button className="btn-link" onClick={() => navigate('/dashboard')}>
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
