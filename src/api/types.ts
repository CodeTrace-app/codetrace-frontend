/* 백엔드 응답 타입. docs/api-spec.md(backend 레포)를 그대로 옮긴 것이다.
 *
 * 여기서 형태를 임의로 바꾸지 않는다. 명세와 어긋나면 목데이터로 만든 화면이
 * 실제 API를 붙이는 순간 깨진다. 명세 변경은 backend 레포의 문서가 먼저다.
 */

// ── 1. 인증·조직 ──────────────────────────────────────────────

export type Role = 'admin' | 'member'
export type Plan = 'starter' | 'team' | 'business'

export interface User {
  id: number
  email: string
  name: string
  role: Role
}

export interface Organization {
  id: number
  name: string
  slug: string
  plan: Plan
}

/** signup·login·demo 공통 응답 */
export interface Session {
  access_token: string
  token_type: 'bearer'
  /** 데모 세션만 true. 쓰기 버튼을 비활성으로 만드는 기준 */
  read_only?: boolean
  user: User
  /** 조직 생성 전이면 null — 프론트는 조직 생성 화면으로 보낸다 */
  organization: Organization | null
}

/** GET /auth/me — 토큰은 이미 클라이언트에 있으므로 돌려주지 않는다 */
export type Me = Omit<Session, 'access_token' | 'token_type'>

export interface OrganizationCreated {
  organization: Organization
  /** 가입 시점 토큰에는 조직이 없다. 이 토큰으로 교체해야 이후 조회가 빈 결과를 받지 않는다 */
  access_token: string
}

// ── 2. 연동 설정 ──────────────────────────────────────────────

export type IntegrationStatus = 'not_connected' | 'connected' | 'coming_soon'

export interface Integrations {
  github: { status: 'not_connected' | 'connected'; installation_id?: number; account?: string }
  gitlab: { status: 'coming_soon' }
  jira: { status: 'coming_soon' }
  slack: { status: 'coming_soon' }
}

export interface GithubRepoChoice {
  github_full_name: string
  private: boolean
  already_added: boolean
}

// ── 3. 레포·인덱싱 ────────────────────────────────────────────

export type IndexingStatus = 'collecting' | 'parsing' | 'done' | 'failed'

export interface RepoStats {
  files: number
  functions: number
  commits: number
  prs: number
}

export interface Repo {
  id: number
  name: string
  github_full_name: string
  default_branch: string
  /** 표시용 대표 언어. 지원 언어 판별과는 무관하다 */
  language: string | null
  indexing_status: IndexingStatus
  /** 진행 중일 때만 값이 있다. done·failed면 null.
   *  label은 지금 무엇을 세고 있는지 — 한 상태 안에 단계가 여럿이라
   *  이름 없이 퍼센트만 보이면 100%에서 0%로 되돌아가는 것처럼 보인다. */
  progress: { current: number; total: number; label: string | null } | null
  last_indexed_at: string | null
  stats: RepoStats
}

export interface DashboardSummary {
  github_account: string | null
  github_connected: boolean
  repo_count: number
  commit_count: number
  review_comment_count: number
  last_indexed_at: string | null
}

export interface RepoList {
  summary: DashboardSummary
  repos: Repo[]
}

export interface ReindexAccepted {
  id: number
  indexing_status: IndexingStatus
}

// ── 4. 코드 탐색기 ────────────────────────────────────────────

export type FileLanguage = 'python' | 'typescript' | 'javascript' | null

export interface TreeNode {
  path: string
  name: string
  type: 'dir' | 'file'
  language?: FileLanguage
  children?: TreeNode[]
}

export interface FileTree {
  root: TreeNode[]
}

export interface FunctionRange {
  name: string
  start_line: number
  end_line: number
}

export interface SourceFile {
  path: string
  language: FileLanguage
  content: string
  /** true면 대용량 파일이 잘린 것 — 뷰어 하단에 "일부만 표시됨" 안내 */
  truncated: boolean
  functions: FunctionRange[]
}

export type ContextStatus = 'ok' | 'no_history' | 'conflicting'

export interface CommitEvidence {
  kind: 'commit'
  sha: string
  title: string
  author: string
  date: string
  url: string
}

export interface PrEvidence {
  kind: 'pr'
  number: number
  title: string
  date: string
  url: string
  review_excerpt?: string
}

export type Evidence = CommitEvidence | PrEvidence

export interface FunctionContext {
  function: { name: string; path: string; start_line: number; end_line: number }
  status: ContextStatus
  /** no_history이거나 요약 생성이 실패하면 null */
  summary: string | null
  /** no_history여도 비어 있지 않을 수 있다. 빈 배열만 가정하지 말 것 */
  evidence: Evidence[]
  evidence_truncated: boolean
  /** 근거가 없을 때 올라갈 상위 모듈. 빈 화면 대신 이동 경로를 준다 */
  parent_module: { path: string; name: string } | null
}

export type ReferenceType = 'call' | 'import' | 'constant' | 'inheritance'
export type SymbolKind = 'function' | 'constant' | 'class'

export interface GraphNode {
  /** "파일경로::함수명" — PR 경고·탐색기 딥링크와 같은 형식 */
  id: string
  name: string
  path: string
  kind: SymbolKind
  depth: 1 | 2
  /** root 기준 caller(이 함수를 참조) / callee(이 함수가 참조) */
  direction: 'caller' | 'callee'
  /** 레포 전체 참조 횟수. 15개 초과 시 이 값 내림차순으로 정렬한 뒤 접는다 */
  reference_count: number
}

export interface GraphEdge {
  source: string
  target: string
  type: ReferenceType
}

export interface ImpactGraph {
  root: { id: string; name: string; path: string; kind: SymbolKind }
  nodes: GraphNode[]
  edges: GraphEdge[]
  total_nodes: number
  /** 서버 상한(100노드) 초과 — 그래프 하단에 "일부만 표시됨" 안내 */
  truncated: boolean
}

// ── 5. PR 경고 이력 ───────────────────────────────────────────

export type ChangeType = 'signature_changed' | 'deleted' | 'renamed' | 'constant_changed'

export interface ImpactedSymbol {
  symbol: string
  path: string
  line: number
  type: ReferenceType
}

export interface Warning {
  change_type: ChangeType
  symbol: string
  detail: string
  impacted: ImpactedSymbol[]
}

export interface PrWarning {
  id: number
  /** 탐색기 링크(?repo=)가 쓰는 값. 이름으로는 링크를 만들 수 없다 */
  repo_id: number
  repo: string
  pr_number: number
  pr_title: string
  pr_url: string
  author: string
  created_at: string
  warnings: Warning[]
}

export interface Paged<T> {
  items: T[]
  page: number
  per_page: number
  total: number
}

// ── 6. 관리자 설정 ────────────────────────────────────────────

export interface QueryLog {
  id: number
  user_name: string
  action: 'context_view' | 'graph_view'
  repo: string
  target: string
  created_at: string
}

export interface PlanInfo {
  plan: Plan
  price_krw: number
  repo_limit: number
  repos_used: number
}

// ── 7. 구독 문의 ──────────────────────────────────────────────

export interface InquiryRequest {
  organization_name: string
  contact_name: string
  contact: string
  plan: Plan
}

export interface InquiryCreated {
  id: number
  message: string
}
