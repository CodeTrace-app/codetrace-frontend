import { useState } from 'react';
import type { ImpactGraph, ReferenceType } from '../api/types';
import './ImpactTab.css';

type ImpactNodeItem = ImpactGraph['nodes'][number];

interface ImpactTabProps {
  data: ImpactGraph;
  onSelectNode?: (path: string, funcName?: string) => void;
}

/** 15개까지 펼쳐 보이고 나머지는 접는다 (S-TQFUEH). */
const VISIBLE_LIMIT = 15;

/** 연결 유형은 색과 글자로 함께 표기한다. 색만으로 구분하면 색맹·흑백에서 읽히지 않는다. */
const RELATION_LABEL: Record<ReferenceType, string> = {
  call: '함수 호출',
  import: 'import',
  constant: '전역 상수',
  inheritance: '클래스 상속',
};

/** 범례에 세우는 순서. 데모 레포에 나오지 않는 유형도 규칙은 같다. */
const LEGEND: ReferenceType[] = ['call', 'constant', 'import', 'inheritance'];

export default function ImpactTab({ data, onSelectNode }: ImpactTabProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  /** 노드의 연결 유형은 edge에 있다. node.kind는 심볼의 종류라 다른 축이다.
   *
   * caller는 이 함수를 부르는 쪽이라 간선의 출발점이고, callee는 도착점이다.
   * 한 심볼이 여러 간선에 걸쳐 있을 때 엉뚱한 간선을 집지 않도록 방향을 먼저 본다.
   */
  const relationOf = (node: ImpactNodeItem): ReferenceType => {
    const byDirection = data.edges.find((e) =>
      node.direction === 'caller' ? e.source === node.id : e.target === node.id,
    );
    const anyEdge = data.edges.find((e) => e.source === node.id || e.target === node.id);
    return (byDirection ?? anyEdge)?.type ?? 'call';
  };

  const byReference = (a: ImpactNodeItem, b: ImpactNodeItem) =>
    b.reference_count - a.reference_count;

  const step1 = data.nodes.filter((n) => n.depth === 1).sort(byReference);
  const step2 = data.nodes.filter((n) => n.depth === 2).sort(byReference);

  const total = step1.length + step2.length;
  const isOverLimit = total > VISIBLE_LIMIT;
  const collapsed = isOverLimit && !isExpanded;

  // 참조 많은 순으로 자른다. 1단계를 먼저 채우고 남는 자리에 2단계를 넣는다.
  const shownStep1 = collapsed ? step1.slice(0, VISIBLE_LIMIT) : step1;
  const shownStep2 = collapsed
    ? step2.slice(0, Math.max(0, VISIBLE_LIMIT - shownStep1.length))
    : step2;
  const hiddenCount = total - (shownStep1.length + shownStep2.length);

  const renderCard = (node: ImpactNodeItem) => {
    const relation = relationOf(node);
    return (
      <div
        key={node.id}
        className={`impact-card step-card ref-${relation}`}
        onClick={() => onSelectNode?.(node.path, node.name)}
      >
        <div className="card-top-row">
          <span className="card-func-name">{node.name}</span>
          <span className="card-ref-count">참조 {node.reference_count}</span>
        </div>
        <div className="card-bottom-row">
          {node.path} · {RELATION_LABEL[relation]}
        </div>
      </div>
    );
  };

  return (
    <div className="impact-tab-container">
      <div className="impact-header">
        <h3 className="impact-title">{data.root.name}()</h3>
        <span className="impact-summary">
          {collapsed ? `영향 ${total}곳 · 참조 많은 순 표시` : `영향 ${total}곳 · 깊이 2단계`}
        </span>
      </div>

      <div className="impact-card target-card">
        <div className="card-top-row">
          <span className="card-func-name">{data.root.name}</span>
          <span className="card-id-badge">기준 함수</span>
        </div>
        <div className="card-bottom-row">{data.root.path}</div>
      </div>

      <div className="impact-vertical-line" />

      <div className="impact-section-label">1단계 · {step1.length}곳</div>
      <div className="impact-card-list">{shownStep1.map(renderCard)}</div>

      {shownStep2.length > 0 && (
        <>
          <div className="impact-vertical-line" />
          <div className="impact-section-label">2단계 · {step2.length}곳</div>
          <div className="impact-card-list">{shownStep2.map(renderCard)}</div>
        </>
      )}

      {collapsed && hiddenCount > 0 && (
        <button type="button" className="impact-more-button" onClick={() => setIsExpanded(true)}>
          더 보기 · {hiddenCount}곳 접힘
        </button>
      )}

      <div className="impact-legend">
        {LEGEND.map((type) => (
          <span key={type} className="impact-legend-item">
            <span className={`impact-legend-dot ref-${type}`} />
            {RELATION_LABEL[type]}
          </span>
        ))}
      </div>

      {data.truncated && (
        <div className="impact-truncated-banner">
          영향 범위가 넓어 일부만 표시됩니다.
        </div>
      )}
    </div>
  );
}
