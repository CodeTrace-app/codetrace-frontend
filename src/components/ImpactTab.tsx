import { useState } from 'react';
import './ImpactTab.css';

export interface ImpactNode {
  name: string;
  file: string;
  relationType: 'call' | 'const' | 'import';
  relationLabel: string;
  refCount: number;
  githubUrl?: string;
}

export interface ImpactGroup {
  levelLabel: string;
  items: ImpactNode[];
}

export interface ImpactData {
  target: {
    name: string;
    file: string;
    githubUrl?: string;
  };
  step1: ImpactNode[];
  step2: ImpactNode[];
  truncated?: boolean;
}

interface ImpactTabProps {
  data: ImpactData;
  onSelectNode?: (filePath: string, funcName?: string) => void;
}

export default function ImpactTab({ data, onSelectNode }: ImpactTabProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalCount = data.step1.length + data.step2.length;
  const isOverLimit = totalCount > 15;
  const sortedStep1 = [...data.step1].sort((a, b) => b.refCount - a.refCount);
  const sortedStep2 = [...data.step2].sort((a, b) => b.refCount - a.refCount);
  const displayStep1 = isOverLimit && !isExpanded ? sortedStep1.slice(0, 10) : sortedStep1;
  const displayStep2 = isOverLimit && !isExpanded ? sortedStep2.slice(0, Math.max(0, 15 - displayStep1.length)) : sortedStep2;

  const getGradientClass = (index: number) => {
    if (index === 0) return 'card-grad-1';
    if (index === 1) return 'card-grad-2';
    if (index === 2) return 'card-grad-3';
    return 'card-grad-4';
  };

  const handleCardClick = (node: ImpactNode) => {
    if (onSelectNode) {
      onSelectNode(node.file, node.name);
    }
  };

  return (
    <div className="impact-tab-container">
      <h3 className="impact-title">{data.target.name}()</h3>

      <div className="impact-card target-card">
        <div className="card-top-row">
          <span className="card-func-name">{data.target.name}</span>
          {data.target.githubUrl && (
            <a
              href={data.target.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="target-github-link"
              onClick={(e) => e.stopPropagation()}
            >
              GitHub 원문
            </a>
          )}
        </div>
        <div className="card-bottom-row">{data.target.file}</div>
      </div>

      <div className="impact-vertical-line" />

      <div className="impact-section-label">1단계 · {data.step1.length}곳</div>
      <div className="impact-card-list">
        {displayStep1.map((item, idx) => (
          <div
            key={`${item.file}-${item.name}-${idx}`}
            className={`impact-card step-card ${getGradientClass(idx)}`}
            onClick={() => handleCardClick(item)}
          >
            <div className="card-top-row">
              <span className="card-func-name">{item.name}</span>
              <span className="card-ref-count">참조 {item.refCount}</span>
            </div>
            <div className="card-bottom-row">
              {item.file} · {item.relationLabel}
            </div>
          </div>
        ))}
      </div>

      {displayStep2.length > 0 && (
        <>
          <div className="impact-vertical-line" />
          <div className="impact-section-label">2단계 · {data.step2.length}곳</div>
          <div className="impact-card-list">
            {displayStep2.map((item, idx) => (
              <div
                key={`${item.file}-${item.name}-${idx}`}
                className="impact-card step-card card-step2"
                onClick={() => handleCardClick(item)}
              >
                <div className="card-top-row">
                  <span className="card-func-name">{item.name}</span>
                  <span className="card-ref-count">참조 {item.refCount}</span>
                </div>
                <div className="card-bottom-row">
                  {item.file} · {item.relationLabel}
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