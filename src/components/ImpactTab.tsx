import { useState } from 'react';
import type { ImpactGraph } from '../api/types';
import './ImpactTab.css';

type ImpactNodeItem = ImpactGraph['nodes'][number];

interface ImpactTabProps {
  data: ImpactGraph;
  onSelectNode?: (path: string, funcName?: string) => void;
}

export default function ImpactTab({ data, onSelectNode }: ImpactTabProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const step1Nodes = data.nodes.filter((n) => n.depth === 1);
  const step2Nodes = data.nodes.filter((n) => n.depth === 2);

  const totalCount = data.total_nodes || data.nodes.length;
  const isOverLimit = totalCount > 15;

  const sortedStep1 = [...step1Nodes].sort((a, b) => b.reference_count - a.reference_count);
  const sortedStep2 = [...step2Nodes].sort((a, b) => b.reference_count - a.reference_count);

  const displayStep1 = isOverLimit && !isExpanded ? sortedStep1.slice(0, 10) : sortedStep1;
  const displayStep2 = isOverLimit && !isExpanded ? sortedStep2.slice(0, Math.max(0, 15 - displayStep1.length)) : sortedStep2;

  const getGradientClass = (index: number) => {
    if (index === 0) return 'card-grad-1';
    if (index === 1) return 'card-grad-2';
    if (index === 2) return 'card-grad-3';
    return 'card-grad-4';
  };

  const getRelationLabel = (node: ImpactNodeItem) => {
    if (node.kind === 'constant') return '전역 상수';
    if (node.kind === 'class') return 'import';
    return '함수 호출';
  };

  const handleCardClick = (node: ImpactNodeItem) => {
    if (onSelectNode) {
      onSelectNode(node.path, node.name);
    }
  };

  return (
    <div className="impact-tab-container">
      <h3 className="impact-title">{data.root.name}()</h3>

      <div className="impact-card target-card">
        <div className="card-top-row">
          <span className="card-func-name">{data.root.name}</span>
          <span className="card-id-badge">기준 함수</span>
        </div>
        <div className="card-bottom-row">{data.root.path}</div>
      </div>

      <div className="impact-vertical-line" />

      <div className="impact-section-label">1단계 · {step1Nodes.length}곳</div>
      <div className="impact-card-list">
        {displayStep1.map((item, idx) => (
          <div
            key={item.id}
            className={`impact-card step-card ${getGradientClass(idx)}`}
            onClick={() => handleCardClick(item)}
          >
            <div className="card-top-row">
              <span className="card-func-name">{item.name}</span>
              <span className="card-ref-count">참조 {item.reference_count}</span>
            </div>
            <div className="card-bottom-row">
              {item.path} · {getRelationLabel(item)}
            </div>
          </div>
        ))}
      </div>

      {displayStep2.length > 0 && (
        <>
          <div className="impact-vertical-line" />
          <div className="impact-section-label">2단계 · {step2Nodes.length}곳</div>
          <div className="impact-card-list">
            {displayStep2.map((item) => (
              <div
                key={item.id}
                className="impact-card step-card card-step2"
                onClick={() => handleCardClick(item)}
              >
                <div className="card-top-row">
                  <span className="card-func-name">{item.name}</span>
                  <span className="card-ref-count">참조 {item.reference_count}</span>
                </div>
                <div className="card-bottom-row">
                  {item.path} · {getRelationLabel(item)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isOverLimit && !isExpanded && (
        <button
          type="button"
          className="impact-more-button"
          onClick={() => setIsExpanded(true)}
        >
          더보기 · {totalCount - (displayStep1.length + displayStep2.length)}곳 접힘
        </button>
      )}

      {data.truncated && (
        <div className="impact-truncated-banner">
          ⚠️ 일부 영향 범위만 표시됩니다.
        </div>
      )}
    </div>
  );
}