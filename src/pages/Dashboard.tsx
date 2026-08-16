import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { repoList as initialRepoList, demoSession } from '../mocks/data';
import type { RepoList } from '../api/types';
import './Dashboard.css';

type RepoItem = RepoList['repos'][number];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<RepoList>(initialRepoList);
  const isDemo = demoSession.read_only ?? false;

  const hasInProgress = data.repos.some(
    (r) => r.indexing_status === 'collecting' || r.indexing_status === 'parsing'
  );

  const pollingRef = useRef<number | null>(null);

  useEffect(() => {
    if (hasInProgress) {
      pollingRef.current = window.setInterval(() => {
        setData((prev) => {
          const updatedRepos = prev.repos.map((repo) => {
            if (repo.indexing_status === 'parsing' && repo.progress) {
              const nextCurrent = Math.min(repo.progress.total, repo.progress.current + 25);
              const isDone = nextCurrent >= repo.progress.total;
              return {
                ...repo,
                indexing_status: (isDone ? 'done' : 'parsing') as RepoItem['indexing_status'],
                progress: isDone ? null : { current: nextCurrent, total: repo.progress.total },
              };
            }
            if (repo.indexing_status === 'collecting' && repo.progress) {
              const nextCurrent = Math.min(repo.progress.total, repo.progress.current + 30);
              const isParsing = nextCurrent >= repo.progress.total;
              return {
                ...repo,
                indexing_status: (isParsing ? 'parsing' : 'collecting') as RepoItem['indexing_status'],
                progress: isParsing
                  ? { current: 1, total: 100 }
                  : { current: nextCurrent, total: repo.progress.total },
              };
            }
            return repo;
          });
          return { ...prev, repos: updatedRepos };
        });
      }, 5000);
    } else if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
    };
  }, [hasInProgress]);

  const handleReindex = (repoId: number) => {
    if (isDemo) return;
    setData((prev) => ({
      ...prev,
      repos: prev.repos.map((r) =>
        r.id === repoId
          ? {
              ...r,
              indexing_status: 'collecting',
              progress: { current: 0, total: 200 },
            }
          : r
      ),
    }));
  };

  const renderStatus = (repo: RepoItem) => {
    switch (repo.indexing_status) {
      case 'collecting':
        return (
          <span className="status-badge">
            수집 중 · 커밋 {repo.progress?.current ?? 0} / {repo.progress?.total ?? 0}
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

  const doneRepos = data.repos.filter((r) => r.indexing_status === 'done');

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">대시보드</h2>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-card-label">연동된 Github 계정</div>
          <div className="summary-card-value">{data.summary.github_account}</div>
          <div className="summary-card-sub">Github App 설치 완료 · 권한 정상</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">인덱싱된 레포</div>
          <div className="summary-card-value">{data.summary.repo_count}개</div>
          <div className="summary-card-sub">마지막 갱신 3분 전</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">수집된 커밋</div>
          <div className="summary-card-value">{data.summary.commit_count.toLocaleString()}건</div>
          <div className="summary-card-sub">
            PR 리뷰 코멘트 {data.summary.review_comment_count}건 포함
          </div>
        </div>
      </div>

      <h3 className="section-title">레포 목록</h3>
      <div className="repo-list">
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