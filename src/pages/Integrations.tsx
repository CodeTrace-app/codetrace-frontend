import { useState, useEffect } from 'react';
import './Integrations.css';

import { fetchMe, fetchIntegrations, fetchGithubInstallUrl, fetchGithubRepos, addRepo } from '../api/endpoints'; 
import { ApiError } from '../api/error';

export default function Integrations() {
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [integrations, setIntegrations] = useState<any>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [installUrl, setInstallUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const me = (await fetchMe()) as { read_only?: boolean };
        setIsReadOnly(Boolean(me.read_only));

        const intData = await fetchIntegrations();
        setIntegrations(intData);

        if (intData.github.status === 'connected') {
          const repoData = await fetchGithubRepos();
          setRepos(repoData.repos);
        } else {
          const urlData = await fetchGithubInstallUrl();
          setInstallUrl(urlData.url);
        }
      } catch (err) {
        console.error('데이터 로드 실패', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleToggle = async (repo: any) => {
    if (repo.already_added || isReadOnly) return;

    setErrorMsg(null);
    try {
      await addRepo(repo.github_full_name);
      
      setRepos(prev => prev.map(r => 
        r.github_full_name === repo.github_full_name ? { ...r, already_added: true } : r
      ));
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 403) {
        setErrorMsg('요금제 한도를 초과하여 레포를 추가할 수 없습니다.');
      } else {
        setErrorMsg('인덱싱 시작에 실패했습니다.');
      }
    }
  };

  const filteredRepos = repos.filter(repo => 
    repo.github_full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="integrations-container">
      <h1 className="page-title">연동 설정</h1>

      {isReadOnly && (
        <div className="error-banner" style={{ color: '#fc6d26', marginBottom: '15px', fontWeight: 'bold' }}>
          💡 데모 세션에서는 연동 설정을 변경하거나 레포를 추가할 수 없습니다.
        </div>
      )}
      {errorMsg && (
        <div className="error-banner" style={{ color: '#d32f2f', marginBottom: '15px', fontWeight: 'bold' }}>
          🚨 {errorMsg}
        </div>
      )}

      <h2 className="section-title">외부 서비스 연동</h2>
      <div className="cards-grid">
        
        <div className={`integration-card ${integrations?.github.status === 'connected' ? 'active' : ''}`}>
          <div className="card-header">
            <span>🐙</span> GitHub
          </div>
          <div className="card-info">
            {integrations?.github.status === 'connected' ? (
              <>
                <label>연동 계정</label>
                <p>{integrations.github.account}</p>
                <label>권한</label>
                <p style={{ color: '#666', fontSize: '13px' }}>레포 읽기·메타데이터 읽기·PR 읽기/쓰기</p>
              </>
            ) : (
              <p className="empty">GitHub 연동이 필요합니다.</p>
            )}
          </div>
          {integrations?.github.status === 'connected' ? (
            <button className="card-btn primary" disabled={isReadOnly}>설정 변경</button>
          ) : (
            <button 
              className="card-btn primary" 
              disabled={isReadOnly}
              onClick={() => { if (installUrl) window.location.href = installUrl; }}
            >
              GitHub 설치 및 연동
            </button>
          )}
        </div>

        <div className="integration-card">
          <div className="card-header"><span style={{ color: '#fc6d26' }}>🦊</span> GitLab</div>
          <div className="card-info">
            <label>연동 계정</label>
            <p>-</p>
            <p className="empty">GitLab 연동은 추후 지원 예정입니다.</p>
          </div>
          <button className="card-btn" disabled>연동 예정</button>
        </div>

        <div className="integration-card">
          <div className="card-header"><span style={{ color: '#2684FF' }}>🔷</span> Jira</div>
          <div className="card-info">
            <label>연동 계정</label>
            <p>-</p>
            <p className="empty">Jira 연동은 추후 지원 예정입니다.</p>
          </div>
          <button className="card-btn" disabled>연동 예정</button>
        </div>

        <div className="integration-card">
          <div className="card-header"><span>💠</span> Slack</div>
          <div className="card-info">
            <label>연동 계정</label>
            <p>-</p>
            <p className="empty">Slack 연동은 추후 지원 예정입니다.</p>
          </div>
          <button className="card-btn" disabled>연동 예정</button>
        </div>
      </div>

      {integrations?.github.status === 'connected' && (
        <>
          <h2 className="section-title">인덱싱 대상 레포</h2>
          <div className="repo-section">
            
            <div className="repo-controls">
              <input 
                type="text" 
                className="search-input" 
                placeholder="🔍 레포 검색 (예: acme, frontend)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="refresh-btn">
                <span>🔄</span> 깃허브에서 레포 목록 새로고침
              </button>
            </div>

            <div className="repo-list">
              {filteredRepos.map(repo => (
                <div className="repo-item" key={repo.github_full_name}>
                  <div className="repo-info-box">
                    <div className="repo-icon">{repo.private ? '🔒' : '🌐'}</div>
                    <div>
                      <p className="repo-name">{repo.github_full_name}</p>
                      <p className="repo-meta">
                        {repo.already_added ? '연동 완료' : '인덱싱 대기 중'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="repo-actions">
                    <span className={`status-text ${repo.already_added ? 'blue' : 'gray'}`}>
                      {repo.already_added ? '완료' : '비활성'}
                    </span>
                    
                    <div className="toggle-group">
                      <span className="toggle-label">인덱싱 활성</span>
                      <div 
                        className={`toggle-switch ${repo.already_added ? 'on' : ''}`}
                        onClick={() => handleToggle(repo)}
                        style={{ cursor: repo.already_added || isReadOnly ? 'not-allowed' : 'pointer' }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}