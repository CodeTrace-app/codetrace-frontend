import { useState, useEffect, useCallback } from 'react';
import './Integrations.css';

import { fetchMe, fetchIntegrations, fetchGithubInstallUrl, fetchGithubRepos, fetchRepos, addRepo } from '../api/endpoints'; 
import { ApiError } from '../api/error';

interface MergedRepo {
  name: string;
  isPrivate: boolean;
  status: '완료' | '파싱중' | '비활성' | '실패';
  lastIndexText: string;
}

export default function Integrations() {
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [integrations, setIntegrations] = useState<any>(null);
  const [repos, setRepos] = useState<MergedRepo[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  
  const [installUrl, setInstallUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const loadRepoData = useCallback(async () => {
    try {
      const [githubData, dashboardData] = await Promise.all([
        fetchGithubRepos(),
        fetchRepos().catch(() => ({ repos: [] })) 
      ]);

      const activeRepoMap = new Map<string, any>();
      (dashboardData.repos || []).forEach((r: any) => {
        const repoName = r.name || r.github_full_name;
        if (repoName) activeRepoMap.set(repoName, r);
      });

      const mergedList: MergedRepo[] = (githubData.repos || []).map((ghRepo: any) => {
        const matched = activeRepoMap.get(ghRepo.github_full_name);
        
        let status: MergedRepo['status'] = '비활성';
        let lastIndexText = '인덱싱 없음';

        if (matched) {
          if (matched.indexing_status === 'done') {
            status = '완료';
            lastIndexText = matched.last_indexed_at 
              ? `마지막 인덱싱: ${formatDateTime(matched.last_indexed_at)}` 
              : '마지막 인덱싱 완료';
          } else if (matched.indexing_status === 'parsing' || matched.indexing_status === 'indexing') {
            status = '파싱중';
            lastIndexText = '인덱싱 중 파싱 중';
          } else if (matched.indexing_status === 'failed') {
            status = '실패';
            lastIndexText = '인덱싱 실패';
          }
        } else if (ghRepo.already_added) {
          status = '파싱중';
          lastIndexText = '인덱싱 중 파싱 중';
        }

        return {
          name: ghRepo.github_full_name,
          isPrivate: Boolean(ghRepo.private),
          status,
          lastIndexText,
        };
      });

      setRepos(mergedList);
    } catch (err) {
      console.error('레포 목록 갱신 실패:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const me = (await fetchMe()) as { read_only?: boolean };
        setIsReadOnly(Boolean(me.read_only));

        const intData = await fetchIntegrations();
        setIntegrations(intData);

        if (intData.github.status === 'connected') {
          await loadRepoData();
        } else {
          const urlData = await fetchGithubInstallUrl();
          setInstallUrl(urlData.url);
        }
      } catch (err) {
        console.error('초기 데이터 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadRepoData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setErrorMsg(null);
    await loadRepoData();
    setRefreshing(false);
  };

  const handleToggle = (repo: MergedRepo) => {
    if (repo.status !== '비활성' || isReadOnly) return;

    setSelectedRepos(prev => {
      const next = new Set(prev);
      if (next.has(repo.name)) {
        next.delete(repo.name);
      } else {
        next.add(repo.name);
      }
      return next;
    });
  };

  const handleBatchIndex = async () => {
    if (selectedRepos.size === 0 || isReadOnly) return;
    setErrorMsg(null);

    setRepos(prev => prev.map(r => 
      selectedRepos.has(r.name) ? { ...r, status: '파싱중', lastIndexText: '인덱싱 시작 중...' } : r
    ));

    let hasError = false;
    for (const repoName of selectedRepos) {
      try {
        await addRepo(repoName);
      } catch (err: any) {
        hasError = true;
        if (err instanceof ApiError && err.status === 403) {
          setErrorMsg('요금제 한도를 초과하여 일부 레포를 추가할 수 없습니다.');
        } else {
          setErrorMsg('일부 레포 인덱싱 시작에 실패했습니다.');
        }
      }
    }

    setSelectedRepos(new Set());
    await loadRepoData();
  };

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>로딩 중...</div>;

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
        <div className={`integration-card ${integrations?.github?.status === 'connected' ? 'active' : ''}`}>
          <div className="card-header">
            <span>🐙</span> GitHub
          </div>
          <div className="card-info">
            {integrations?.github?.status === 'connected' ? (
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
          {integrations?.github?.status === 'connected' ? (
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

        <div className="integration-card"><div className="card-header"><span style={{ color: '#fc6d26' }}>🦊</span> GitLab</div><div className="card-info"><label>연동 계정</label><p>-</p><p className="empty">GitLab 연동은 추후 지원 예정.</p></div><button className="card-btn" disabled>연동 예정</button></div>
        <div className="integration-card"><div className="card-header"><span style={{ color: '#2684FF' }}>🔷</span> Jira</div><div className="card-info"><label>연동 계정</label><p>-</p><p className="empty">Jira 연동은 추후 지원 예정.</p></div><button className="card-btn" disabled>연동 예정</button></div>
        <div className="integration-card"><div className="card-header"><span>💠</span> Slack</div><div className="card-info"><label>연동 계정</label><p>-</p><p className="empty">Slack 연동은 추후 지원 예정.</p></div><button className="card-btn" disabled>연동 예정</button></div>
      </div>

      {integrations?.github?.status === 'connected' && (
        <>
          <h2 className="section-title" style={{ marginTop: '40px' }}>인덱싱 대상 레포</h2>
          <div className="repo-section">
            
            <div className="repo-controls">
              <input 
                type="text" 
                className="search-input" 
                placeholder="🔍 레포 검색 (예: acme, frontend)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                className="refresh-btn" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <span>🔄</span> {refreshing ? '갱신 중...' : '깃허브에서 레포 목록 새로고침'}
              </button>
            </div>

            <div className="repo-list">
              {filteredRepos.map(repo => {
                const isToggleOn = repo.status !== '비활성' || selectedRepos.has(repo.name);
                
                return (
                  <div className="repo-item" key={repo.name}>
                    <div className="repo-info-box">
                      <div className="repo-icon">{repo.isPrivate ? '🔒' : '📄'}</div>
                      <div>
                        <p className="repo-name">{repo.name}</p>
                        <p className="repo-meta">{repo.lastIndexText}</p>
                      </div>
                    </div>
                    
                    <div className="repo-actions">
                      <span className={`status-text ${repo.status === '완료' || repo.status === '파싱중' ? 'blue' : 'gray'}`}>
                        {repo.status}
                      </span>
                      
                      <div className="toggle-group">
                        <span className="toggle-label">인덱싱 활성</span>
                        <div 
                          className={`toggle-switch ${isToggleOn ? 'on' : ''}`}
                          onClick={() => handleToggle(repo)}
                          style={{ cursor: repo.status !== '비활성' || isReadOnly ? 'not-allowed' : 'pointer' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                className="start-indexing-btn" 
                onClick={handleBatchIndex}
                disabled={selectedRepos.size === 0 || isReadOnly}
              >
                선택한 레포 인덱싱 시작 &gt;
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}