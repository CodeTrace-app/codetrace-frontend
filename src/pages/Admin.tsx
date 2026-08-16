import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQueryLogs, fetchPlan } from '../api/endpoints';
import { ApiError } from '../api/error';
import './Admin.css';

export default function AdminSettings() {
  const navigate = useNavigate();
  const [logsData, setLogsData] = useState<any>(null);
  const [planData, setPlanData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      try {
        const [planInfo, queryLogs] = await Promise.all([
          fetchPlan(),
          fetchQueryLogs(currentPage)
        ]);
        
        setPlanData(planInfo);
        setLogsData(queryLogs);
        setErrorMsg(null);
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
          setErrorMsg('관리자 권한이 필요합니다. 데모 세션 및 일반 사용자는 접근할 수 없습니다.');
        } else {
          setErrorMsg('관리자 데이터를 불러오는 데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };
    loadAdminData();
  }, [currentPage]);

  const formatPlanName = (plan: string) => {
    if (!plan) return '';
    return plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const formatAction = (action: string) => {
    switch(action) {
      case 'context_view': return '컨텍스트 조회';
      case 'graph_view': return '그래프 조회';
      default: return action;
    }
  };

  if (loading && !planData) return <div className="loading">로딩 중...</div>;

  if (errorMsg) {
    return (
      <div className="error-container">
        <h2>접근 권한 없음</h2>
        <p>{errorMsg}</p>
        <button className="btn-primary" onClick={() => navigate('/')}>홈으로 돌아가기</button>
      </div>
    );
  }

  const totalPages = logsData ? Math.ceil(logsData.total / logsData.per_page) : 1;

  return (
    <div className="admin-settings-page">
      <div className="page-header">
        <h1 className="page-title">관리자 설정</h1>
        <button className="btn-primary" onClick={() => navigate('/integrations')}>연동 설정으로 이동</button>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <span className="card-label">현재 요금제</span>
          <h2 className="card-value">{formatPlanName(planData?.plan)} 플랜</h2>
          <p className="card-desc">인덱싱 레포 최대 {planData?.repo_limit}개 · 조직당 정액</p>
          <button className="btn-outline" onClick={() => navigate('/pricing')}>요금제 변경</button>
        </div>
        
        <div className="summary-card">
          <span className="card-label">레포 사용량 (현재 연동 상태)</span>
          <h2 className="card-value">{planData?.repos_used} / {planData?.repo_limit} 개 연결됨</h2>
          <p className="card-desc">설치된 레포 {planData?.repos_used}개 · 잔여 한도 {planData?.repo_limit - planData?.repos_used}개</p>
          <button className="btn-text" onClick={() => navigate('/integrations')}>연동 설정 관리 &gt;</button>
        </div>
      </div>

      <div className="query-logs-section">
        <h2 className="section-title">질의 이력</h2>
        
        <div className="table-controls">
          <div className="search-inputs">
            <div className="search-bar">
              <span className="icon">🔍</span>
              <input type="text" placeholder="사용자 또는 대상 코드 검색" />
            </div>
            <select className="filter-select"><option>기간 ∨</option></select>
            <select className="filter-select"><option>사용자 ∨</option></select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>일시</th>
                <th>사용자</th>
                <th>동작 (질의 유형)</th>
                <th>대상 레포</th>
                <th>대상 범위</th>
              </tr>
            </thead>
            <tbody>
              {logsData?.items.map((log: any) => (
                <tr key={log.id}>
                  <td className="text-gray">{formatDate(log.created_at)}</td>
                  <td>{log.user_name}</td>
                  <td><span className="action-tag">{formatAction(log.action)}</span></td>
                  <td className="text-gray">{log.repo}</td>
                  <td className="target-code">{log.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination-container">
            <button className="btn-page-nav" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>&lt;</button>
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button 
                  key={num} 
                  className={`btn-page-num ${currentPage === num ? 'active' : ''}`}
                  onClick={() => setCurrentPage(num)}
                >
                  {num}
                </button>
              ))}
            </div>
            <button className="btn-page-nav" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>&gt;</button>
            <select className="page-size-select"><option>10개씩 보기 ∨</option></select>
          </div>
        )}
      </div>

      <div className="page-footer">
        <button className="btn-link" onClick={() => navigate('/dashboard')}>대시보드로 돌아가기</button>
        <button className="btn-outline">CSV로 내보내기</button>
      </div>
    </div>
  );
}