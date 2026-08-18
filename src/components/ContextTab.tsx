import type { FunctionContext, Evidence } from '../api/types';
import './ContextTab.css';

interface Props {
  data: FunctionContext;
  onNavigateParent?: (parentPath: string) => void;
}

/** 작성 배경 자리에 무엇을 쓸지. status와 summary 조합이 네 가지다.
 *
 *  ok + 요약         정상
 *  ok + 요약 없음     근거는 있는데 요약이 아직 없다 (생성 실패·중단)
 *  no_history        의미 있는 이력이 없다. 근거가 있어도 요약은 만들지 않는다
 *  conflicting       상반된 결정이 남아 있다
 *
 *  넷을 구분하지 않고 "요약이 비면 이력 없음"으로 뭉개면,
 *  근거를 바로 아래 보여주면서 없다고 말하는 화면이 된다.
 */
function describe(data: FunctionContext, evidenceCount: number) {
  if (data.summary) return { text: data.summary, tone: 'normal' as const };

  if (data.status === 'no_history') {
    return evidenceCount > 0
      ? {
          text: '남아 있는 변경 이력이 포맷팅·주석 같은 것뿐이라 작성 배경을 복원할 수 없습니다. 추측하지 않고 근거만 보여드립니다.',
          tone: 'muted' as const,
        }
      : {
          text: '선택한 코드에 연결된 변경 이력이 없습니다.',
          tone: 'muted' as const,
        };
  }

  if (evidenceCount > 0) {
    return {
      text: `이 코드를 바꾼 이력 ${evidenceCount}건을 찾았습니다. 배경 요약은 아직 만들어지지 않았습니다 — 아래 근거를 먼저 확인하세요.`,
      tone: 'pending' as const,
    };
  }

  return { text: '선택한 코드에 연결된 변경 이력이 없습니다.', tone: 'muted' as const };
}

export default function ContextTab({ data, onNavigateParent }: Props) {
  const evidence = data.evidence ?? [];
  const funcName = data.function?.name || '';
  const background = describe(data, evidence.length);

  return (
    <div className="context-tab-container">
      <div className="context-header">
        <span className="context-symbol-name">
          {funcName ? `${funcName}()` : '함수 정보'}
        </span>
        <span className="evidence-badge">근거 {evidence.length}건</span>
      </div>

      {/* 상반된 결정이 남아 있으면 어느 쪽이 맞다고 고르지 않는다 */}
      {data.status === 'conflicting' && (
        <div className="context-conflicting-banner">
          상반된 결정이 함께 남아 있습니다. 어느 쪽이 현재 기준인지는 수집된 이력만으로
          확정할 수 없어 양쪽을 모두 보여드립니다.
        </div>
      )}

      <div className="context-section">
        <div className="section-label">작성 배경</div>
        <p className={`summary-text summary-text--${background.tone}`}>{background.text}</p>
      </div>

      {data.evidence_truncated && (
        <p className="evidence-truncated-note">
          이력이 많아 최근 것부터 일부만 표시합니다.
        </p>
      )}

      <hr className="context-divider" />

      <div className="history-list">
        {evidence.length > 0 ? (
          evidence.map((item: Evidence, idx: number) => {
            if (item.kind === 'commit') {
              return (
                <div key={`commit-${idx}`} className="history-card">
                  <div className="history-card-header">
                    <span className="commit-hash">커밋 {item.sha.slice(0, 7)}</span>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noreferrer" className="github-link">
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
                    <a href={item.url} target="_blank" rel="noreferrer" className="github-link">
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
          // 빈 화면을 두지 않는다. 올라갈 곳을 준다 (S-UBXNLW)
          <div className="empty-history-container">
            <p className="empty-text">이 코드를 바꾼 커밋이나 PR을 찾지 못했습니다.</p>
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
