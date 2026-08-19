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

/** 왜 이 변경이 경고 대상인지, 그리고 무엇은 경고하지 않는지.
 *
 * 신입은 경고를 받고도 "이게 왜 문제인지"를 모른다. 판별 기준을 화면에 적어두면
 * 경고 하나가 학습 재료가 된다. 제외 조건까지 함께 쓰는 이유는, 안 뜨는 경우를
 * 알아야 이 도구를 신뢰할 수 있어서다.
 */
const CHANGE_REASON: Record<ChangeType, string> = {
  signature_changed:
    '파라미터의 개수나 이름이 달라지면 이 함수를 부르던 위치가 그대로는 동작하지 않을 수 있어 경고 대상으로 분류됩니다. 내부 로직·주석·타입 힌트·기본값만 바뀐 경우는 경고에서 제외됩니다.',
  deleted:
    '함수가 사라지면 이를 호출하던 위치가 그대로는 동작하지 않아 경고 대상으로 분류됩니다. 호출되지 않는 함수의 삭제도 같은 기준으로 알립니다.',
  renamed:
    '이름이 바뀌면 기존 이름으로 부르던 위치가 그대로는 동작하지 않아 경고 대상으로 분류됩니다. 같은 커밋에서 호출부까지 함께 고쳤다면 아래 목록은 비어 있습니다.',
  constant_changed:
    '다른 곳에서 참조하는 전역 상수의 값이 바뀌면 그 상수를 쓰는 위치의 동작이 달라질 수 있어 경고 대상으로 분류됩니다. 참조가 없는 상수는 경고하지 않습니다.',
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

/** `파일경로::함수명` 에서 함수명만. 헤더에 경로까지 쓰면 줄이 넘친다. */
const functionOf = (symbol: string) => symbol.split('::').pop() ?? symbol;

/** 이 PR에서 무엇이 바뀌었는지 한 줄로. 경고가 여러 건이면 나머지는 수로 줄인다. */
const changedFunctions = (warnings: PrWarning['warnings']) => {
  if (warnings.length === 0) return '—';
  const first = `${functionOf(warnings[0].symbol)}()`;
  return warnings.length === 1 ? first : `${first} 외 ${warnings.length - 1}개`;
};

function FileIcon() {
  return (
    <svg className="icon" width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M9.5 1.5H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5l-3.5-3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M9.5 1.5V5H13" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

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
          참고용이며 자동 수정이나 머지 차단은 하지 않습니다. 변경이 해결되면 목록에서 자동으로
          사라집니다.
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
                    <div className="badges">
                      {/* 같은 유형이 여러 건이면 뱃지가 중복된다. 유형 단위로 한 번만 세운다 */}
                      {[...new Set(item.warnings.map((w) => w.change_type))].map((type) => (
                        <span key={type} className="badge outline">
                          {CHANGE_LABEL[type]} 감지
                        </span>
                      ))}
                      <a
                        href={item.pr_url}
                        target="_blank"
                        rel="noreferrer"
                        className="badge fill pr-link"
                      >
                        GitHub에서 보기
                      </a>
                    </div>
                  </div>

                  <div className="card-info-grid">
                    <div className="info-col">
                      <label>대상 레포</label>
                      <p>{item.repo}</p>
                    </div>
                    <div className="info-col">
                      <label>변경 함수</label>
                      <p className="mono">{changedFunctions(item.warnings)}</p>
                    </div>
                    <div className="info-col">
                      <label>감지 일시</label>
                      <p>{formatDate(item.created_at)}</p>
                    </div>
                  </div>
                </div>

                {item.warnings.map((warning, wIndex) => (
                  <div key={wIndex} className="warning-detail-group">
                    <h2 className="section-title">경고 요약</h2>
                    <div className="warning-card">
                      <table className="summary-table">
                        <tbody>
                          <tr>
                            <th>변경 대상</th>
                            <td>
                              <code className="warning-symbol">{warning.symbol}</code>
                            </td>
                          </tr>
                          <tr>
                            <th>변경 유형</th>
                            <td>
                              <span className="badge outline">
                                {CHANGE_LABEL[warning.change_type]}
                              </span>
                              <span className="summary-detail">{warning.detail}</span>
                            </td>
                          </tr>
                          <tr>
                            <th>판별 근거</th>
                            <td>{CHANGE_REASON[warning.change_type]}</td>
                          </tr>
                          <tr>
                            <th>경고 수준</th>
                            <td>
                              <span className="level-badge">참고</span>
                              <span className="level-desc">
                                참고 수준 경고 — 자동 수정 및 머지 차단은 적용되지 않습니다.
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <h2 className="section-title">
                      영향받는 파일 및 함수 · {warning.impacted.length}곳
                    </h2>
                    <div className="impact-list">
                      {warning.impacted.map((impact, iIndex) => (
                        <div key={iIndex} className="impact-item">
                          <div className="impact-info">
                            <FileIcon />
                            <div>
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
