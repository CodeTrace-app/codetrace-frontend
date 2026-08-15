import { useState } from 'react';
import type { Evidence } from '../api/types';
import './ContextTab.css';

export interface ContextData {
  status: 'ok' | 'no_history' | 'conflicting';
  function_name?: string;
  parent_module?: string;
  summary?: string;
  evidence_truncated?: boolean;
  evidences?: Evidence[];
}

interface ContextTabProps {
  data: ContextData | any | null;
  functionName?: string;
  onNavigateParent?: (parentPath: string) => void;
}

export default function ContextTab({ data, functionName, onNavigateParent }: ContextTabProps) {
  const [isEvidenceCollapsed, setIsEvidenceCollapsed] = useState(false);

  if (!data) {
    return (
      <div className="context-tab-container">
        <div className="context-tab-empty">맥락 정보가 없습니다.</div>
      </div>
    );
  }

  const currentStatus = data.status || 'ok';
  const evidences: Evidence[] = data.evidences || [];
  const displayName = functionName || (data.function_name ? `${data.function_name}()` : '맥락 상세');

  if (currentStatus === 'no_history') {
    return (
      <div className="context-tab-container">
        <div className="context-header">
          <span className="context-func-name">{displayName}</span>
        </div>
        <div className="context-no-history">
          <p className="no-history-title">변경 이력이 없습니다.</p>
          <p className="no-history-desc">해당 함수에 대한 커밋 및 PR 기록을 찾을 수 없습니다.</p>
          {data.parent_module && (
            <button
              type="button"
              className="btn-parent-module"
              onClick={() => onNavigateParent?.(data.parent_module!)}
            >
              상위 모듈({data.parent_module})로 이동
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="context-tab-container">
      {/* 1) 함수명 + 근거 뱃지 */}
      <div className="context-header">
        <span className="context-func-name">{displayName}</span>
        <span className="evidence-badge">근거 {evidences.length}건</span>
      </div>

      {/* 최근 근거만 표시 안내 배너 */}
      {data.evidence_truncated && (
        <div className="context-warning-banner">
          ⚠️ 근거가 많아 최근 근거만 표시됩니다.
        </div>
      )}

      {/* 상충 상태 안내 배너 */}
      {currentStatus === 'conflicting' && (
        <div className="context-conflicting-banner">
          ⚠️ 상충되는 근거가 감지되었습니다. 양쪽 근거를 모두 표시합니다.
        </div>
      )}

      {/* 2) 작성 배경 섹션 */}
      {data.summary && (
        <div className="context-section">
          <h4 className="section-label">작성 배경</h4>
          <p className="context-summary">{data.summary}</p>
        </div>
      )}

      <div className="context-divider" />

      {/* 3) 근거 출처 섹션 */}
      <div className="context-section">
        <div className="section-label-row">
          <h4 className="section-label">근거 출처</h4>
          {evidences.length > 3 && (
            <button
              type="button"
              className="btn-toggle-collapse"
              onClick={() => setIsEvidenceCollapsed((prev) => !prev)}
            >
              {isEvidenceCollapsed ? '펼치기 ▼' : '접기 ▲'}
            </button>
          )}
        </div>

        {!isEvidenceCollapsed && (
          <div className="evidence-card-list">
            {evidences.map((item: any, idx: number) => {
              const isCommit = item.type === 'commit' || Boolean(item.sha);
              const typeLabel = isCommit ? '커밋' : 'PR';
              const idLabel = isCommit ? (item.sha?.slice(0, 7) || 'sha') : `#${item.number || idx + 1}`;

              const metaInfo = [
                item.date,
                isCommit && item.author ? `@${item.author}` : null,
                isCommit && item.pr_number ? `PR #${item.pr_number}` : null,
                !isCommit && item.author ? `@${item.author} 리뷰` : null,
              ]
                .filter(Boolean)
                .join(' · ');

              return (
                <div key={item.sha || item.number || idx} className="evidence-card">
                  <div className="card-top-row">
                    <div className="card-type-id">
                      <span className="card-type">{typeLabel}</span>
                      <span className="card-id">{idLabel}</span>
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card-github-link"
                      >
                        GitHub 원문
                      </a>
                    )}
                  </div>

                  <div className="card-title">{item.message || item.title}</div>

                  {metaInfo && <div className="card-meta">{metaInfo}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}