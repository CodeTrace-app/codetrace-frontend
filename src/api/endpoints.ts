/* 엔드포인트별 호출 함수.
 *
 * 화면에서 경로 문자열을 직접 만들지 않는다. 경로·쿼리 조립을 여기 모아두면
 * 명세가 바뀔 때 고칠 곳이 한 군데다.
 */

import { apiGet, apiPost } from './client'
import type {
  FileTree,
  FunctionContext,
  ImpactGraph,
  Integrations,
  GithubRepoChoice,
  InquiryCreated,
  InquiryRequest,
  Me,
  OrganizationCreated,
  Paged,
  PlanInfo,
  PrWarning,
  QueryLog,
  ReindexAccepted,
  Repo,
  RepoList,
  Session,
  SourceFile,
} from './types'

// ── 인증·조직 ─────────────────────────────────────────────────
/** 인자 셋이 모두 문자열이라 순서를 바꿔도 타입 검사에 걸리지 않는다.
 *  실제로 (name, email, password) 순으로 불러 가입이 422로 막혀 있었다.
 *  이름을 붙여 같은 실수를 구조적으로 막는다. */
export const signup = (form: { email: string; password: string; name: string }) =>
  apiPost<Session>('/auth/signup', form, { auth: false })

export const login = (email: string, password: string) =>
  apiPost<Session>('/auth/login', { email, password }, { auth: false })

export const startDemo = () => apiPost<Session>('/auth/demo', undefined, { auth: false })

export const fetchMe = () => apiGet<Me>('/auth/me')

export const createOrganization = (name: string) =>
  apiPost<OrganizationCreated>('/organizations', { name })

// ── 연동 설정 ─────────────────────────────────────────────────

export const fetchIntegrations = () => apiGet<Integrations>('/integrations')

export const fetchGithubInstallUrl = () =>
  apiGet<{ url: string }>('/integrations/github/install-url')

export const fetchGithubRepos = () =>
  apiGet<{ repos: GithubRepoChoice[] }>('/integrations/github/repos')

// ── 레포·인덱싱 ───────────────────────────────────────────────

export const fetchRepos = () => apiGet<RepoList>('/repos')

export const addRepo = (githubFullName: string) =>
  apiPost<Repo>('/repos', { github_full_name: githubFullName })

export const reindexRepo = (repoId: number) =>
  apiPost<ReindexAccepted>(`/repos/${repoId}/reindex`)

/** 인덱싱 중인 레포가 있을 때만 폴링한다. 전부 done·failed면 멈춘다 */
export const POLL_INTERVAL_MS = 5000

// ── 코드 탐색기 ───────────────────────────────────────────────

export const fetchTree = (repoId: number) => apiGet<FileTree>(`/repos/${repoId}/tree`)

export const fetchFile = (repoId: number, path: string) =>
  apiGet<SourceFile>(`/repos/${repoId}/file?path=${encodeURIComponent(path)}`)

export const fetchContext = (repoId: number, path: string, line: number) =>
  apiGet<FunctionContext>(
    `/repos/${repoId}/context?path=${encodeURIComponent(path)}&line=${line}`,
  )

export const fetchGraph = (repoId: number, path: string, functionName: string) =>
  apiGet<ImpactGraph>(
    `/repos/${repoId}/graph?path=${encodeURIComponent(path)}&function=${encodeURIComponent(functionName)}`,
  )

// ── PR 경고 이력 ──────────────────────────────────────────────

export const fetchPrWarnings = (repoId?: number, page = 1) => {
  const query = new URLSearchParams({ page: String(page) })
  if (repoId !== undefined) query.set('repo_id', String(repoId))
  return apiGet<Paged<PrWarning>>(`/pr-warnings?${query.toString()}`)
}

// ── 관리자 설정 ───────────────────────────────────────────────

export const fetchQueryLogs = (page = 1) =>
  apiGet<Paged<QueryLog>>(`/admin/query-logs?page=${page}`)

export const fetchPlan = () => apiGet<PlanInfo>('/admin/plan')

// ── 구독 문의 ─────────────────────────────────────────────────

export const createInquiry = (payload: InquiryRequest) =>
  apiPost<InquiryCreated>('/inquiries', payload, { auth: false })
