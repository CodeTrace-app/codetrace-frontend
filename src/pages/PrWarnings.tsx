import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchPrWarnings } from '../api/endpoints';
import { ApiError } from '../api/error';
import { explorerLink } from '../utils/explorerLink';
import type { ChangeType, Paged, PrWarning, ReferenceType } from '../api/types';
import './PrWarnings.css';

/** 경고 대상은 이 네 가지뿐이다 (api-spec §5). */
const CHANGE_LABEL: Record<ChangeType, string> = {
  signature_changed: '시그니처 변경',
  deleted: '함수 삭제',
  renamed: '이름 변경',
  constant_changed: '상수 값 변경',
};

const REF_LABEL: Record<ReferenceType, string> = {
  call: '함수 호출',
  import: 'import',
  constant: '전역 상수',
  inheritance: '클래스 상속',
};

/** import 항목의 출발점은 `파일경로::<module>` 형태라 함수가 아니다.
 *  탐색기에서 열 수 없으므로 링크를 걸지 않는다. */
const isModuleLevel = (symbol: string) => symbol.endsWith('::<module>');

export default function PrWarnings() {
  const navigate = useNavigate();
  const [data, setData] = useState<Paged<PrWarning> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchPrWarnings()
      .then((res) => alive && setData(res))
      .catch((err) => {
        if (!alive) return;
        setErrorMsg(
          err instanceof ApiError && err.status === 403
            ? '이 조직의 PR 경고를 볼 권한이 없습니다.'
            : 'PR 경고 이력을 불러오지 못했습니다.',
        );
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const formatDate = (value: string) => {
    const d = new Date(value);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  if (loading) return <div className="loading">로딩 중…</div>;

  if (errorMsg) {
    return (
      <div className="error-container">
        <h2>불러오지 못했습니다</h2>
        <p>{errorMsg}</p>
        <button onClick={() => navigate('/dashboard')}>대시보드로 돌아가기</button>
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="pr-warnings-page-wrapper">
      <div className="pr-warnings-page">
        <h1 className="page-title">PR 경고 이력</h1>
        <p className="page-desc">
          PR이 올라오면 변경된 파일을 다시 파싱해 호출부가 깨질 수 있는 변경을 찾습니다. 경고는
          참고용이며 자동 수정이나 머지 차단은 하지 않습니다.
        </p>

        {/* 경고가 없는 것은 정상이다. 빈 화면 대신 그 사실을 알린다 */}
        {items.length === 0 ? (
          <div className="warnings-empty">
            <p className="warnings-empty-title">아직 감지된 경고가 없습니다.</p>
            <p className="warnings-empty-sub">
              연동한 레포에 PR이 올라오면 여기에 쌓입니다. 경고가 없던 PR과 해소된 PR은 남기지
              않습니다.
            </p>
          </div>
        ) : (
          <div className="warnings-list">
            {items.map((item) => (
              <div key={item.id} className="warning-block">
                <div className="warning-card">
                  <div className="card-header-row">
                    <h3>
                      PR #{item.pr_number} · {item.pr_title}
                    </h3>
                    <a href={item.pr_url} target="_blank" rel="noreferrer" className="pr-link">
                      GitHub에서 보기
                    </a>
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

                {item.warnings.map((warning, wIndex) => (
                  <div key={wIndex} className="warning-detail-group">
                    <div className="warning-card">
                      <div className="warning-headline">
                        <span className="badge outline">{CHANGE_LABEL[warning.change_type]}</span>
                        <code className="warning-symbol">{warning.symbol}</code>
                      </div>
                      <p className="warning-detail">{warning.detail}</p>
                    </div>

                    <h2 className="section-title">
                      영향받는 위치 {warning.impacted.length}곳
                    </h2>
                    <div className="impact-list">
                      {warning.impacted.map((impact, iIndex) => (
                        <div key={iIndex} className="impact-item">
                          <div className="impact-info">
                            <p className="path">
                              {impact.path}:{impact.line}
                            </p>
                            <p className="symbol">
                              {isModuleLevel(impact.symbol) ? (
                                <>이 파일이 import · {REF_LABEL[impact.type]}</>
                              ) : (
                                <>
                                  {impact.symbol} · {REF_LABEL[impact.type]}
                                </>
                              )}
                            </p>
                          </div>
                          {!isModuleLevel(impact.symbol) && (
                            <button
                              className="btn-navigate"
                              onClick={() =>
                                navigate(explorerLink(item.repo_id, impact.symbol, 'impact'))
                              }
                            >
                              코드 탐색기에서 확인 &gt;
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {data && data.total > items.length && (
          <p className="table-note">
            전체 {data.total.toLocaleString()}건 중 {items.length}건 표시
          </p>
        )}
      </div>
    </div>
  );
}
