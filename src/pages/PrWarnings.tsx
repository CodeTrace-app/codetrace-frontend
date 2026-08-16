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
    <div className="pr-warnings-page-wrapper">
      <div className="pr-warnings-page">
        <h1 className="page-title">PR 경고 코멘트</h1>

        <div className="warnings-list">
          {warningsData?.items.map((item: any) => (
            <div key={item.id} className="warning-block">
              
              <div className="warning-card">
                <div className="card-header-row">
                  <h3>PR #{item.pr_number} - {item.pr_title}</h3>
                  <div className="badges">
                    <span className="badge outline">✨ 시그니처 변경 감지</span>
                    <span className="badge fill">ⓘ 경고 코멘트 게시됨</span>
                  </div>
                </div>
                
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

              {item.warnings.map((warning: any, wIndex: number) => {
                return (
                  <div key={wIndex} className="warning-detail-group">
                    
                    <h2 className="section-title">ⓘ 경고 요약</h2>
                    <div className="warning-card">
                      <table className="summary-table">
                        <tbody>
                          <tr>
                            <th>변경 유형</th>
                            <td>{warning.change_type}</td>
                          </tr>
                          <tr>
                            <th>판별 근거</th>
                            <td>
                              시그니처 변경은 호출 측 코드와의 호환성을 깨뜨릴 수 있어 경고 대상으로 분류됩니다.<br/>
                              함수 내부 로직만 변경된 경우는 경고에서 제외됩니다.
                            </td>
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

                    <h2 className="section-title">영향받는 파일 및 함수</h2>
                    <div className="impact-list">
                      {warning.impacted.map((impact: any, iIndex: number) => (
                        <div key={iIndex} className="impact-item">
                          <div className="impact-info">
                            <span className="icon">📄</span>
                            <div>
                              <p className="path">{impact.path}</p>
                              <p className="symbol">호출 함수: {impact.symbol}</p>
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

                    <h2 className="section-title">Github PR 코멘트 원문</h2>
                    <div className="warning-card comment-box">
                      <p className="comment-header">ⓘ Code Trace 영향 범위 경고 - 참고용</p>
                      <p className="comment-text">
                        processPayment() 함수의 시그니처가 변경되었습니다. 아래 파일과 함수가 이 함수를 참조하고 있으며 미수정 상태입니다.
                      </p>
                      
                      <div className="comment-impact-lines">
                        <p>src/checkout/CheckoutService.ts - handleCheckout()</p>
                        <p>src/subscription/RenewalJob.ts - runRenewal()</p>
                        <p>src/admin/ManualBillingController.ts - triggerManualCharge()</p>
                        <p>test/payment/processPayment.spec.ts - describe('processPayment')</p>
                      </div>

                      <p className="comment-footer">
                        이 경고는 자동으로 생성된 참고 정보입니다. 자동 수정 및 머지 차단은 적용되지 않습니다.<br/>
                        Code Trace에서 각 참조 지점의 작성 맥락을 확인하세요.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}