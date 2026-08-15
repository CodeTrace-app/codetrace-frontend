import { useState } from 'react';
import './Integrations.css';

const MOCK_REPOS = [
  { id: 1, name: 'acme-corp / frontend', lastIndex: '2025-01-15 14:32', status: '완료', isActive: true },
  { id: 2, name: 'acme-corp / backend-api', lastIndex: '2025-01-15 13:10', status: '완료', isActive: true },
  { id: 3, name: 'acme-corp / data-pipeline', lastIndex: '인덱싱 중 파싱 중', status: '파싱중', isActive: false },
  { id: 4, name: 'acme-corp / legacy-monolith', lastIndex: '인덱싱 없음', status: '비활성', isActive: false },
  { id: 5, name: 'acme-corp / infra-scripts', lastIndex: '인덱싱 없음', status: '비활성', isActive: false },
];

export default function Integrations() {
  const [repos, setRepos] = useState(MOCK_REPOS);

  const handleToggle = (id: number) => {
    setRepos(repos.map(repo => 
      repo.id === id ? { ...repo, isActive: !repo.isActive } : repo
    ));
  };

  return (
    <div className="integrations-container">
      <h1 className="page-title">연동 설정</h1>

      <h2 className="section-title">외부 서비스 연동</h2>
      <div className="cards-grid">
        
        <div className="integration-card active">
          <div className="card-header">
            <span>🐙</span> GitHub
          </div>
          <div className="card-info">
            <label>연동 계정</label>
            <p>acme-corp</p>
            <label>권한</label>
            <p style={{ color: '#666', fontSize: '13px' }}>레포 읽기·메타데이터 읽기·PR 읽기/쓰기</p>
          </div>
          <button className="card-btn primary">설정 변경</button>
        </div>

        <div className="integration-card">
          <div className="card-header">
            <span style={{ color: '#fc6d26' }}>🦊</span> GitLab
          </div>
          <div className="card-info">
            <label>연동 계정</label>
            <p>-</p>
            <p className="empty">GitLab 연동은 추후 지원 예정입니다.</p>
          </div>
          <button className="card-btn" disabled>연동 예정</button>
        </div>

        <div className="integration-card">
          <div className="card-header">
            <span style={{ color: '#2684FF' }}>🔷</span> Jira
          </div>
          <div className="card-info">
            <label>연동 계정</label>
            <p>-</p>
            <p className="empty">Jira 연동은 추후 지원 예정입니다.</p>
          </div>
          <button className="card-btn" disabled>연동 예정</button>
        </div>

        <div className="integration-card">
          <div className="card-header">
            <span>💠</span> Slack
          </div>
          <div className="card-info">
            <label>연동 계정</label>
            <p>-</p>
            <p className="empty">Slack 연동은 추후 지원 예정입니다.</p>
          </div>
          <button className="card-btn" disabled>연동 예정</button>
        </div>
      </div>

      <h2 className="section-title">인덱싱 대상 레포</h2>
      <div className="repo-section">
        
        <div className="repo-controls">
          <input 
            type="text" 
            className="search-input" 
            placeholder="🔍 레포 검색 (예: acme, frontend)" 
          />
          <button className="refresh-btn">
            <span>🔄</span> 깃허브에서 레포 목록 새로고침
          </button>
        </div>

        <div className="repo-list">
          {repos.map(repo => (
            <div className="repo-item" key={repo.id}>
              <div className="repo-info-box">
                <div className="repo-icon">📄</div>
                <div>
                  <p className="repo-name">{repo.name}</p>
                  <p className="repo-meta">{repo.lastIndex.includes('인덱싱:') ? `마지막 인덱싱: ${repo.lastIndex.replace('마지막 인덱싱: ', '')}` : repo.lastIndex}</p>
                </div>
              </div>
              
              <div className="repo-actions">
                <span className={`status-text ${repo.status === '완료' || repo.status === '파싱중' ? 'blue' : 'gray'}`}>
                  {repo.status}
                </span>
                
                <div className="toggle-group">
                  <span className="toggle-label">인덱싱 활성</span>
                  <div 
                    className={`toggle-switch ${repo.isActive ? 'on' : ''}`}
                    onClick={() => handleToggle(repo.id)}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="start-indexing-btn">선택한 레포 인덱싱 시작 &gt;</button>
      </div>
    </div>
  );
}