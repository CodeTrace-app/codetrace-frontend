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
  
  const [currentPage] = useState(1);

  const mockMembers = [
    { id: 1, name: '이제혁', email: '12341234@gmail.com', role: '관리자', auth: '전체 권한', date: '2024.05.10' },
    { id: 2, name: '노경민', email: '12341234@gmail.com', role: '관리자', auth: '전체 권한', date: '2024.05.11' },
    { id: 3, name: '김주형', email: '12341234@gmail.com', role: '멤버', auth: '읽기 + 탐색', date: '2024.05.12' },
    { id: 4, name: '김연지', email: '12341234@gmail.com', role: '멤버', auth: '읽기 전용', date: '2024.05.13' },
    { id: 5, name: '박효연', email: '12341234@gmail.com', role: '멤버', auth: '읽기 + 탐색', date: '2024.05.14' },
    { id: 6, name: '심민서', email: '12341234@gmail.com', role: '멤버', auth: '읽기 전용', date: '2024.05.16' },
  ];

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

  return (
    <div className="admin-page-wrapper">
      <div className="admin-settings-page">
        <div className="page-header">
          <h1 className="page-title">관리자 설정</h1>
          <button className="btn-primary" onClick={() => navigate('/integrations')}>연동 설정으로 이동</button>
        </div>

        <div className="summary-cards-grid">
          <div className="summary-card">
            <span className="card-label">현재 요금제</span>
            <h2 className="card-value">{formatPlanName(planData?.plan) || 'Pro'} 플랜</h2>
            <p className="card-desc">인덱싱 레포 최대 {planData?.repo_limit || 10}개 · 조직당 정액</p>
            <button className="btn-outline-wide" onClick={() => navigate('/pricing')}>요금제 변경</button>
          </div>
          
          <div className="summary-card">
            <span className="card-label">현재 연동 상태</span>
            <h2 className="card-value">연결됨</h2>
            <p className="card-desc">설치된 레포 {planData?.repos_used || 3}개 · 마지막 동기화 5분 전</p>
            <button className="btn-text-link" onClick={() => navigate('/integrations')}>연동 설정 관리</button>
          </div>

          <div className="summary-card">
            <span className="card-label">조직 멤버</span>
            <h2 className="card-value">12명</h2>
            <p className="card-desc">관리자 2명 포함</p>
          </div>
        </div>

        <div className="admin-section">
          <div className="section-header">
            <h2 className="section-title">조직원 관리</h2>
            <div className="header-actions">
              <button className="btn-outline">✉️ 초대 링크 복사</button>
              <button className="btn-primary">+ 조직원 초대</button>
            </div>
          </div>

          <div className="member-stats-container">
            <div className="stat-item">
              <div className="stat-icon blue">👥</div>
              <div className="stat-text">
                <span className="label">전체 멤버</span>
                <strong className="value">12명</strong>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon gray">⚙️</div>
              <div className="stat-text">
                <span className="label">관리자</span>
                <strong className="value">2명</strong>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon light">👤</div>
              <div className="stat-text">
                <span className="label">일반 멤버</span>
                <strong className="value">9명</strong>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon light">✉️</div>
              <div className="stat-text">
                <span className="label">초대 멤버</span>
                <strong className="value">1명</strong>
              </div>
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>역할</th>
                  <th>권한</th>
                  <th>초대/가입일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {mockMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="font-medium">{member.name}</td>
                    <td className="text-gray">{member.email}</td>
                    <td>
                      <span className={`role-badge ${member.role === '관리자' ? 'admin' : 'member'}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="text-gray">{member.auth}</td>
                    <td className="text-gray">{member.date}</td>
                    <td><button className="btn-more">···</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-container">
            <button className="btn-page-nav">&lt;</button>
            <button className="btn-page-num active">1</button>
            <button className="btn-page-num">2</button>
            <button className="btn-page-nav">&gt;</button>
            <select className="page-size-select"><option>10개씩 보기 </option></select>
          </div>
        </div>

        <div className="admin-section">
          <h2 className="section-title">질의 이력</h2>
          
          <div className="table-controls">
            <div className="search-bar">
              <span className="icon">🔍</span>
              <input type="text" placeholder="사용자 또는 대상 코드 검색" />
            </div>
            <div className="filter-group">
              <select className="filter-select"><option>기간 </option></select>
              <select className="filter-select"><option>사용자 </option></select>
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>일시</th>
                  <th>사용자</th>
                  <th>대상 파일</th>
                  <th>대상 함수</th>
                  <th>질의 유형</th>
                </tr>
              </thead>
              <tbody>
                {logsData?.items?.length > 0 ? (
                  logsData.items.map((log: any) => (
                    <tr key={log.id}>
                      <td className="text-gray">{formatDate(log.created_at)}</td>
                      <td>{log.user_name}</td>
                      <td className="text-gray">{log.repo}</td>
                      <td className="target-code">{log.target}</td>
                      <td><span className="action-tag">{formatAction(log.action)}</span></td>
                    </tr>
                  ))
                ) : (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td><div className="skeleton-box"></div></td>
                      <td><div className="skeleton-box"></div></td>
                      <td><div className="skeleton-box"></div></td>
                      <td><div className="skeleton-box"></div></td>
                      <td><div className="skeleton-box"></div></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="page-footer">
          <button className="btn-link" onClick={() => navigate('/dashboard')}>대시보드로 돌아가기</button>
          <button className="btn-outline">CSV로 내보내기</button>
        </div>
      </div>
    </div>
    
  );
}