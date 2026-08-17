import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRepos, reindexRepo, POLL_INTERVAL_MS } from '../api/endpoints';
import { useAuth } from '../auth/useAuth';
import type { RepoList } from '../api/types';
import './Dashboard.css';

type RepoItem = RepoList['repos'][number];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<RepoList | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 데모 세션은 읽기 전용이다. 버튼을 숨기지 않고 비활성 + 안내로 처리한다.
  const { readOnly: isDemo } = useAuth();

  // 레포 목록 데이터 조회 함수
  const loadRepoList = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setError(null);
      const res = await fetchRepos();
      setData(res);
    } catch (err: unknown) {
      console.error('Failed to fetch repo list:', err);
      if (!isPolling) {
        setError('레포지토리 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      if (!isPolling) setIsLoading(false);
    }
  }, []);

  // 1. 초기 데이터 로드
  useEffect(() => {
    loadRepoList();
  }, [loadRepoList]);

  // 진행 중인 레포(collecting / parsing)가 있는지 확인
  const hasInProgress = data?.repos.some(
    (r) => r.indexing_status === 'collecting' || r.indexing_status === 'parsing'
  ) ?? false;

  const pollingRef = useRef<number | null>(null);

  // 2. 5초 폴링 제어 (진행 중인 레포가 있을 때만 백엔드 재조회)
  useEffect(() => {
    if (hasInProgress) {
      pollingRef.current = window.setInterval(() => {
        loadRepoList(true);
      }, POLL_INTERVAL_MS);
    } else if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
      }
    };
  }, [hasInProgress, loadRepoList]);

  // 재인덱싱 클릭 핸들러
  const handleReindex = async (repoId: number) => {
    if (isDemo) return;
    try {
      await reindexRepo(repoId);
      loadRepoList(true);
    } catch (err) {
      console.error('Reindex request failed:', err);
      // 백엔드에 reindex API가 아직 없더라도 화면 상태 갱신 시도
      loadRepoList(true);
    }
  };

  // 상태 배지 텍스트 렌더링
  const renderStatus = (repo: RepoItem) => {
    // 진행률은 단계마다 세는 대상이 바뀐다 (커밋 → PR → 파일). 단위를 붙이지 않는다.
    switch (repo.indexing_status) {
      case 'collecting':
        return (
          <span className="status-badge">
            수집 중 · {repo.progress?.current ?? 0} / {repo.progress?.total ?? 0}
          </span>
        );
      case 'parsing': {
        const percent =
          repo.progress && repo.progress.total > 0
            ? Math.round((repo.progress.current / repo.progress.total) * 100)
            : 0;
        return <span className="status-badge">파싱 · {percent}%</span>;
      }
      case 'done':
        return <span className="status-badge">완료</span>;
      case 'failed':
        return <span className="status-badge failed">실패</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <h2 className="dashboard-title">대시보드</h2>
        <div style={{ padding: '40px 0', color: '#656d76', textAlign: 'center' }}>
          대시보드 데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="dashboard-container">
        <h2 className="dashboard-title">대시보드</h2>
        <div style={{ padding: '40px 0', color: '#cf222e', textAlign: 'center' }}>
          {error || '데이터를 불러올 수 없습니다.'}
        </div>
      </div>
    );
  }

  const doneRepos = data.repos.filter((r) => r.indexing_status === 'done');
  // 수집·파싱 중인 레포 수. 요약 카드가 '없다'와 '1개'로 어긋나지 않게 한다.
  const indexingNow = data.repos.filter(
    (r) => r.indexing_status === 'collecting' || r.indexing_status === 'parsing',
  ).length;


  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">대시보드</h2>

      {/* 1. 상단 요약 카드 3개 */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-card-label">연동된 Github 계정</div>
          <div className="summary-card-value">
            {data.summary.github_connected ? data.summary.github_account : '연동 안 됨'}
          </div>
          <div className="summary-card-sub">
            {data.summary.github_connected
              ? 'GitHub App 설치됨'
              : '연동 설정에서 GitHub을 연결하세요'}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">인덱싱된 레포</div>
          <div className="summary-card-value">{data.summary.repo_count}개</div>
          <div className="summary-card-sub">
            {indexingNow > 0
              ? `${indexingNow}개 인덱싱 진행 중`
              : data.summary.last_indexed_at
                ? `마지막 인덱싱 ${new Date(data.summary.last_indexed_at).toLocaleDateString('ko-KR')}`
                : '아직 인덱싱한 레포가 없습니다'}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">수집된 커밋</div>
          <div className="summary-card-value">{data.summary.commit_count.toLocaleString()}건</div>
          <div className="summary-card-sub">
            PR 리뷰 코멘트 {data.summary.review_comment_count}건 포함
          </div>
        </div>
      </div>

      {/* 2. 레포 목록 */}
      <h3 className="section-title">레포 목록</h3>
      <div className="repo-list">
        {/* 레포가 없을 때 빈 화면을 두지 않는다. 무엇을 해야 하는지 알려준다 */}
        {data.repos.length === 0 && (
          <div className="repo-empty">
            <p className="repo-empty-title">아직 인덱싱한 레포가 없습니다.</p>
            <p className="repo-empty-sub">
              {data.summary.github_connected
                ? '연동 설정에서 인덱싱할 레포를 선택하세요.'
                : '연동 설정에서 GitHub을 연결하면 레포를 선택할 수 있습니다.'}
            </p>
            <button
              type="button"
              className="btn-open-explorer"
              onClick={() => navigate('/settings/integrations')}
            >
              연동 설정으로 가기
            </button>
          </div>
        )}
        {data.repos.map((repo) => {
          const isDone = repo.indexing_status === 'done';
          const isFailed = repo.indexing_status === 'failed';

          return (
            <div key={repo.id} className="repo-card">
              <div className="repo-card-left">
                <div className="repo-name">{repo.github_full_name}</div>
                <div className="repo-meta">
                  {repo.language} · 커밋 {repo.stats.commits}건 · PR {repo.stats.prs}건
                </div>
              </div>

              <div className="repo-card-right">
                {renderStatus(repo)}
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn-open-explorer"
                    onClick={() => navigate(`/explorer?repo=${repo.id}`)}
                  >
                    코드 탐색기 열기
                  </button>

                  {(isDone || isFailed) && (
                    <button
                      type="button"
                      className="btn-reindex"
                      disabled={isDemo}
                      title={isDemo ? '데모 세션에서는 재인덱싱할 수 없습니다.' : ''}
                      onClick={() => handleReindex(repo.id)}
                    >
                      재인덱싱
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. 최근 인덱싱 결과 */}
      {doneRepos.length > 0 && (
        <>
          <h3 className="section-title">최근 인덱싱 결과</h3>
          <div className="recent-results-grid">
            {doneRepos.slice(0, 2).map((repo) => (
              <div key={`recent-${repo.id}`} className="recent-result-card">
                <div className="repo-card-left">
                  <div className="repo-name">{repo.github_full_name}</div>
                  <div className="repo-meta">
                    {repo.language} · 커밋 {repo.stats.commits}건 · PR {repo.stats.prs}건
                  </div>
                </div>
                <div className="check-icon-circle">✓</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}