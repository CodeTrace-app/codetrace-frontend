import type { FunctionContext, Evidence } from '../api/types';
import './ContextTab.css';

interface Props {
  data: FunctionContext;
  onNavigateParent?: (parentPath: string) => void;
}

export default function ContextTab({ data, onNavigateParent }: Props) {
  const hasEvidence = data.evidence && data.evidence.length > 0;
  const funcName = data.function?.name || '';

  return (
    <div className="context-tab-container">
      <div className="context-header">
        <span className="context-symbol-name">
          {funcName ? `${funcName}()` : '함수 정보'}
        </span>
        <span className="evidence-badge">
          근거 {data.evidence ? data.evidence.length : 0}건
        </span>
      </div>

      <div className="context-section">
        <div className="section-label">작성 배경</div>
        <p className="summary-text">
          {data.summary || '선택한 코드에 연결된 변경 이력이 존재하지 않습니다.'}
        </p>
      </div>

      <hr className="context-divider" />

      <div className="history-list">
        {hasEvidence ? (
          data.evidence.map((item: Evidence, idx: number) => {
            if (item.kind === 'commit') {
              return (
                <div key={`commit-${idx}`} className="history-card">
                  <div className="history-card-header">
                    <span className="commit-hash">커밋 {item.sha.slice(0, 7)}</span>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="github-link"
                      >
                        GitHub 원문
                      </a>
                    )}
                  </div>
                  <div className="commit-message">{item.title}</div>
                  <div className="commit-meta">
                    {item.date} · {item.author}
                  </div>
                </div>
              );
            }

            return (
              <div key={`pr-${idx}`} className="history-card">
                <div className="history-card-header">
                  <span className="commit-hash">PR #{item.number}</span>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="github-link"
                    >
                      GitHub 원문
                    </a>
                  )}
                </div>
                <div className="commit-message">{item.title}</div>
                <div className="commit-meta">
                  {item.date}
                  {item.review_excerpt && ` · ${item.review_excerpt}`}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-history-container">
            <p className="empty-text">변경 이력이 없습니다.</p>
            {data.parent_module && onNavigateParent && (
              <button
                type="button"
                className="btn-parent-module"
                onClick={() => onNavigateParent(data.parent_module!.path)}
              >
                상위 모듈로 이동 ({data.parent_module.name})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}