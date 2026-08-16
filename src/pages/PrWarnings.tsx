import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPrWarnings } from '../api/endpoints';
import { ApiError } from '../api/error';
import './PrWarnings.css';

export default function PrWarnings() {
  const navigate = useNavigate();
  const [warningsData, setWarningsData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPrWarnings();
        setWarningsData(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
          setErrorMsg('관리자 권한이 필요합니다. 데모 세션 및 일반 사용자는 접근할 수 없습니다.');
        } else {
          setErrorMsg('데이터를 불러오는 데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleNavigateToExplorer = (repo: string, fnSymbol: string) => {
    navigate(`/explorer?repo=${encodeURIComponent(repo)}&fn=${encodeURIComponent(fnSymbol)}&tab=impact`);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (loading) return <div className="loading">로딩 중...</div>;

  if (errorMsg) {
    return (
      <div className="error-container">
        <h2>접근 권한 없음</h2>
        <p>{errorMsg}</p>
        <button onClick={() => navigate('/')}>홈으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="pr-warnings-page">
      <h1 className="page-title">PR 경고 이력</h1>

      <div className="warnings-list">
        {warningsData?.items.map((item: any) => (
          <div key={item.id} className="warning-block">
            
            <div className="warning-card">
              <div className="card-header-row">
                <h3>PR #{item.pr_number} - {item.pr_title}</h3>
                <div className="badges">
                  <span className="badge outline">변경 감지</span>
                  <span className="badge fill">경고 코멘트 게시됨</span>
                </div>
              </div>
              
              {/* 🚀 3등분 가운데 정렬된 헤더 영역 */}
              <div className="card-info-grid">
                <div className="info-col">
                  <label>대상 레포</label>
                  <p>{item.repo}</p>
                </div>
                <div className="info-col">
                  <label>작성자</label>
                  <p>{item.author}</p>
                </div>
                <div className="info-col">
                  <label>감지 일시</label>
                  <p>{formatDate(item.created_at)}</p>
                </div>
              </div>
            </div>

            {item.warnings.map((warning: any, wIndex: number) => (
              <div key={wIndex} className="warning-detail-group">
                
                <div className="warning-card">
                  <div className="card-title">
                    <span>❗</span> 경고 요약
                  </div>
                  <table className="summary-table">
                    <tbody>
                      <tr>
                        <th>변경 유형</th>
                        <td>{warning.change_type} ({warning.symbol.split('::')[1] || warning.symbol})</td>
                      </tr>
                      <tr>
                        <th>상세 내용</th>
                        <td>{warning.detail}</td>
                      </tr>
                      <tr>
                        <th>경고 수준</th>
                        <td>
                          <span className="level-badge high">높음</span> 
                          <span className="level-desc">참고 수준 경고 - 자동 수정 및 머지 차단은 적용되지 않습니다.</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="warning-card">
                  <div className="card-title">영향받는 위치</div>
                  <div className="impact-list">
                    {warning.impacted.map((impact: any, iIndex: number) => (
                      <div key={iIndex} className="impact-item">
                        <div className="impact-info">
                          <span className="icon">📄</span>
                          <div>
                            <p className="path">{impact.path}</p>
                            <p className="symbol">대상: {impact.symbol}</p>
                          </div>
                        </div>
                        <button 
                          className="btn-navigate"
                          onClick={() => handleNavigateToExplorer(item.repo, impact.symbol)}
                        >
                          코드 탐색기에서 확인 &gt;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}