/* 목데이터. docs/api-spec.md(backend 레포)의 예시 JSON을 복사한 것이다.
 *
 * 값을 지어내지 않는다. 화면에 필요해서 예시보다 개수를 늘린 곳은 주석으로 이유를 남긴다.
 * 형태를 바꾸면 실제 API를 붙이는 순간 화면이 깨진다.
 */

import type {
  FileTree,
  FunctionContext,
  ImpactGraph,
  Integrations,
  GithubRepoChoice,
  Paged,
  PlanInfo,
  PrWarning,
  QueryLog,
  RepoList,
  Session,
  SourceFile,
} from '../api/types'

// ── 인증 ──────────────────────────────────────────────────────

export const loginSession: Session = {
  access_token: 'mock.access.token',
  token_type: 'bearer',
  user: { id: 1, email: 'kim@acme.dev', name: '김팀장', role: 'admin' },
  organization: { id: 1, name: '에이크미', slug: 'acme-x1y2', plan: 'starter' },
}

/** 가입 직후에는 조직이 없다. 프론트는 organization이 null이면 조직 생성 화면으로 보낸다 */
export const signupSession: Session = {
  ...loginSession,
  organization: null,
}

export const demoSession: Session = {
  access_token: 'mock.demo.token',
  token_type: 'bearer',
  read_only: true,
  user: { id: 0, email: 'demo@codetrace.app', name: '데모 사용자', role: 'member' },
  organization: { id: 99, name: 'Acme Corp (데모)', slug: 'demo', plan: 'team' },
}

// ── 연동 설정 ─────────────────────────────────────────────────

export const integrations: Integrations = {
  github: { status: 'connected', installation_id: 12345678, account: 'acme-payments' },
  gitlab: { status: 'coming_soon' },
  jira: { status: 'coming_soon' },
  slack: { status: 'coming_soon' },
}

export const githubRepoChoices: { repos: GithubRepoChoice[] } = {
  repos: [
    { github_full_name: 'acme-payments/acme-payment-service', private: true, already_added: true },
    { github_full_name: 'acme-payments/acme-admin-web', private: true, already_added: false },
  ],
}

// ── 레포·인덱싱 ───────────────────────────────────────────────

/* 예시의 2개에 failed 1개를 더했다. 실패 카드(재인덱싱 버튼만 노출)를
 * 목만으로 확인할 수 있어야 하기 때문이다. 형태는 예시와 같다. */
export const repoList: RepoList = {
  summary: {
    github_account: 'acme-payments',
    github_connected: true,
    repo_count: 4,
    commit_count: 1284,
    review_comment_count: 342,
    last_indexed_at: '2026-08-10T09:30:00Z',
  },
  repos: [
    {
      id: 1,
      name: 'acme-payment-service',
      github_full_name: 'acme-payments/acme-payment-service',
      default_branch: 'main',
      language: 'Python',
      indexing_status: 'parsing',
      progress: { current: 142, total: 218 },
      last_indexed_at: null,
      stats: { files: 87, functions: 342, commits: 418, prs: 96 },
    },
    {
      id: 2,
      name: 'acme-admin-web',
      github_full_name: 'acme-payments/acme-admin-web',
      default_branch: 'main',
      language: 'TypeScript',
      indexing_status: 'done',
      progress: null,
      last_indexed_at: '2026-08-10T09:30:00Z',
      stats: { files: 45, functions: 120, commits: 210, prs: 41 },
    },
    {
      id: 3,
      name: 'acme-batch',
      github_full_name: 'acme-payments/acme-batch',
      default_branch: 'main',
      language: 'Python',
      indexing_status: 'failed',
      progress: null,
      last_indexed_at: null,
      stats: { files: 0, functions: 0, commits: 0, prs: 0 },
    },
  ],
}

// ── 코드 탐색기 ───────────────────────────────────────────────

export const fileTree: FileTree = {
  root: [
    {
      path: 'src',
      name: 'src',
      type: 'dir',
      children: [
        { path: 'src/payment.py', name: 'payment.py', type: 'file', language: 'python' },
        { path: 'src/constants.py', name: 'constants.py', type: 'file', language: 'python' },
        { path: 'src/utils.py', name: 'utils.py', type: 'file', language: 'python' },
        {
          path: 'src/api',
          name: 'api',
          type: 'dir',
          children: [
            { path: 'src/api/checkout.py', name: 'checkout.py', type: 'file', language: 'python' },
            { path: 'src/api/subscribe.py', name: 'subscribe.py', type: 'file', language: 'python' },
          ],
        },
      ],
    },
    { path: 'README.md', name: 'README.md', type: 'file', language: null },
  ],
}

export const sourceFile: SourceFile = {
  path: 'src/payment.py',
  language: 'python',
  content: `import httpx

from src.constants import TIMEOUT_SECONDS
from src.pg.client import PgClient


def process_payment(order_id, amount, retry=3):
    """결제를 승인한다.

    2024-11 PG사 타임아웃 장애 이후 재시도가 붙었다.
    재시도만으로는 중복 결제가 생겨 멱등키 검증을 함께 둔다.
    """
    client = PgClient(timeout=TIMEOUT_SECONDS)
    for attempt in range(retry):
        try:
            return client.request(order_id, amount)
        except httpx.TimeoutException:
            if attempt == retry - 1:
                raise
    return None


def refund_payment(order_id, amount):
    client = PgClient(timeout=TIMEOUT_SECONDS)
    return client.refund(order_id, amount)
`,
  truncated: false,
  functions: [
    { name: 'process_payment', start_line: 7, end_line: 22 },
    { name: 'refund_payment', start_line: 25, end_line: 27 },
  ],
}

export const contextOk: FunctionContext = {
  function: { name: 'process_payment', path: 'src/payment.py', start_line: 5, end_line: 42 },
  status: 'ok',
  summary:
    '2024년 11월 PG사 타임아웃 장애(#PR 41) 이후 재시도 3회와 멱등키 검증이 추가된 함수. 2025년 6월 타임아웃이 3초에서 10초로 조정되었고, 현재는 모든 결제 요청이 이 함수를 단일 경로로 통과한다.',
  evidence: [
    {
      kind: 'commit',
      sha: 'a1b2c3d',
      title: 'fix: 결제 타임아웃 3s→10s 상향',
      author: 'kimdev',
      date: '2025-06-14T02:11:00Z',
      url: 'https://github.com/acme-payments/acme-payment-service/commit/a1b2c3d',
    },
    {
      kind: 'pr',
      number: 41,
      title: '결제 재시도 로직 추가',
      date: '2024-11-02T08:00:00Z',
      url: 'https://github.com/acme-payments/acme-payment-service/pull/41',
      review_excerpt: '재시도만 붙이면 중복 결제 위험이 있어요. 멱등키 검증이 먼저 필요합니다.',
    },
  ],
  evidence_truncated: false,
  parent_module: null,
}

/** 근거 없음(S-UBXNLW). 빈 화면 금지 — parent_module로 이동 경로를 준다 */
export const contextNoHistory: FunctionContext = {
  function: { name: 'format_krw', path: 'src/utils.py', start_line: 3, end_line: 6 },
  status: 'no_history',
  summary: null,
  evidence: [],
  evidence_truncated: false,
  parent_module: { path: 'src', name: 'src' },
}

/** 근거 상충. 추측하지 않고 양쪽 근거를 모두 보여준다 */
export const contextConflicting: FunctionContext = {
  function: { name: 'verify_token', path: 'src/auth.py', start_line: 18, end_line: 47 },
  status: 'conflicting',
  summary:
    '타임아웃을 두고 상반된 결정이 있다. PG사 권장값에 맞춰 10초로 올린 변경과, 커넥션 풀이 고갈된다는 이유로 3초로 되돌린 변경이 함께 남아 있다. 어느 쪽이 현재 기준인지는 수집된 이력만으로 확정할 수 없다.',
  evidence: [
    {
      kind: 'commit',
      sha: 'a1b2c3d',
      title: 'fix: 타임아웃 3s→10s 상향',
      author: 'kimdev',
      date: '2025-06-14T02:11:00Z',
      url: 'https://github.com/acme-payments/acme-payment-service/commit/a1b2c3d',
    },
    {
      kind: 'commit',
      sha: 'e4f5g6h',
      title: 'fix: 타임아웃 10s→3s 원복',
      author: 'leedev',
      date: '2025-08-02T05:00:00Z',
      url: 'https://github.com/acme-payments/acme-payment-service/commit/e4f5g6h',
    },
  ],
  evidence_truncated: false,
  parent_module: null,
}

/* 세 상태 전부 목에 둔다. 빈 상태·상충 화면을 만들려면 필요하다.
 * 파일 경로로 어느 것을 돌려줄지 고른다 — utils.py는 근거 없음, auth.py는 상충. */
export const contextByPath: Record<string, FunctionContext> = {
  'src/utils.py': contextNoHistory,
  'src/auth.py': contextConflicting,
}

/* 예시의 4개 노드에 2단계 노드를 더해 18개로 만들었다.
 * 15개 초과 접기(S-TQFUEH)를 목만으로 확인할 수 있어야 하기 때문이다.
 * 노드 형태와 id 규칙은 예시와 같다. */
export const impactGraph: ImpactGraph = {
  root: {
    id: 'src/payment.py::process_payment',
    name: 'process_payment',
    path: 'src/payment.py',
    kind: 'function',
  },
  nodes: [
    { id: 'src/api/checkout.py::checkout', name: 'checkout', path: 'src/api/checkout.py', kind: 'function', depth: 1, direction: 'caller', reference_count: 12 },
    { id: 'src/payment.py::TIMEOUT_SECONDS', name: 'TIMEOUT_SECONDS', path: 'src/payment.py', kind: 'constant', depth: 1, direction: 'callee', reference_count: 5 },
    { id: 'src/pg/client.py::PgClient.request', name: 'PgClient.request', path: 'src/pg/client.py', kind: 'function', depth: 1, direction: 'callee', reference_count: 3 },
    { id: 'src/api/subscribe.py::renew', name: 'renew', path: 'src/api/subscribe.py', kind: 'function', depth: 2, direction: 'caller', reference_count: 1 },

    { id: 'src/api/refund.py::refund', name: 'refund', path: 'src/api/refund.py', kind: 'function', depth: 1, direction: 'caller', reference_count: 9 },
    { id: 'src/batch/settle.py::settle_daily', name: 'settle_daily', path: 'src/batch/settle.py', kind: 'function', depth: 1, direction: 'caller', reference_count: 7 },
    { id: 'src/pg/client.py::PgClient', name: 'PgClient', path: 'src/pg/client.py', kind: 'class', depth: 1, direction: 'callee', reference_count: 6 },
    { id: 'src/constants.py::RETRY_LIMIT', name: 'RETRY_LIMIT', path: 'src/constants.py', kind: 'constant', depth: 1, direction: 'callee', reference_count: 4 },
    { id: 'src/api/webhook.py::handle_pg_callback', name: 'handle_pg_callback', path: 'src/api/webhook.py', kind: 'function', depth: 2, direction: 'caller', reference_count: 11 },
    { id: 'src/api/order.py::create_order', name: 'create_order', path: 'src/api/order.py', kind: 'function', depth: 2, direction: 'caller', reference_count: 10 },
    { id: 'src/api/cart.py::submit_cart', name: 'submit_cart', path: 'src/api/cart.py', kind: 'function', depth: 2, direction: 'caller', reference_count: 8 },
    { id: 'src/admin/manual_pay.py::manual_charge', name: 'manual_charge', path: 'src/admin/manual_pay.py', kind: 'function', depth: 2, direction: 'caller', reference_count: 6 },
    { id: 'src/batch/retry_failed.py::retry_failed', name: 'retry_failed', path: 'src/batch/retry_failed.py', kind: 'function', depth: 2, direction: 'caller', reference_count: 5 },
    { id: 'src/pg/http.py::send', name: 'send', path: 'src/pg/http.py', kind: 'function', depth: 2, direction: 'callee', reference_count: 14 },
    { id: 'src/pg/sign.py::sign_body', name: 'sign_body', path: 'src/pg/sign.py', kind: 'function', depth: 2, direction: 'callee', reference_count: 4 },
    { id: 'src/log/audit.py::write_audit', name: 'write_audit', path: 'src/log/audit.py', kind: 'function', depth: 2, direction: 'callee', reference_count: 3 },
    { id: 'src/constants.py::PG_BASE_URL', name: 'PG_BASE_URL', path: 'src/constants.py', kind: 'constant', depth: 2, direction: 'callee', reference_count: 2 },
    { id: 'src/pg/errors.py::PgError', name: 'PgError', path: 'src/pg/errors.py', kind: 'class', depth: 2, direction: 'callee', reference_count: 2 },
  ],
  edges: [
    { source: 'src/api/checkout.py::checkout', target: 'src/payment.py::process_payment', type: 'call' },
    { source: 'src/payment.py::process_payment', target: 'src/payment.py::TIMEOUT_SECONDS', type: 'constant' },
    { source: 'src/payment.py::process_payment', target: 'src/pg/client.py::PgClient.request', type: 'call' },
    { source: 'src/api/subscribe.py::renew', target: 'src/api/checkout.py::checkout', type: 'call' },

    { source: 'src/api/refund.py::refund', target: 'src/payment.py::process_payment', type: 'call' },
    { source: 'src/batch/settle.py::settle_daily', target: 'src/payment.py::process_payment', type: 'call' },
    { source: 'src/payment.py::process_payment', target: 'src/pg/client.py::PgClient', type: 'import' },
    { source: 'src/payment.py::process_payment', target: 'src/constants.py::RETRY_LIMIT', type: 'constant' },
    { source: 'src/api/webhook.py::handle_pg_callback', target: 'src/api/refund.py::refund', type: 'call' },
    { source: 'src/api/order.py::create_order', target: 'src/api/checkout.py::checkout', type: 'call' },
    { source: 'src/api/cart.py::submit_cart', target: 'src/api/checkout.py::checkout', type: 'call' },
    { source: 'src/admin/manual_pay.py::manual_charge', target: 'src/api/refund.py::refund', type: 'call' },
    { source: 'src/batch/retry_failed.py::retry_failed', target: 'src/batch/settle.py::settle_daily', type: 'call' },
    { source: 'src/pg/client.py::PgClient.request', target: 'src/pg/http.py::send', type: 'call' },
    { source: 'src/pg/client.py::PgClient.request', target: 'src/pg/sign.py::sign_body', type: 'call' },
    { source: 'src/pg/client.py::PgClient.request', target: 'src/log/audit.py::write_audit', type: 'call' },
    { source: 'src/pg/client.py::PgClient', target: 'src/constants.py::PG_BASE_URL', type: 'constant' },
    { source: 'src/pg/client.py::PgClient', target: 'src/pg/errors.py::PgError', type: 'inheritance' },
  ],
  total_nodes: 18,
  truncated: false,
}

// ── PR 경고 이력 ──────────────────────────────────────────────

export const prWarnings: Paged<PrWarning> = {
  items: [
    {
      id: 8,
      repo: 'acme-payment-service',
      pr_number: 132,
      pr_title: '결제 타임아웃 설정 변경',
      pr_url: 'https://github.com/acme-payments/acme-payment-service/pull/132',
      author: 'kimnewbie',
      created_at: '2026-08-10T04:12:00Z',
      warnings: [
        {
          change_type: 'signature_changed',
          symbol: 'src/payment.py::process_payment',
          detail: '파라미터가 (order_id, amount, retry)에서 (order_id, amount)로 바뀌었습니다',
          impacted: [
            { symbol: 'src/api/checkout.py::checkout', path: 'src/api/checkout.py', line: 27, type: 'call' },
            { symbol: 'src/api/subscribe.py::renew', path: 'src/api/subscribe.py', line: 55, type: 'call' },
          ],
        },
      ],
    },
    /* 나머지 3종(deleted·renamed·constant_changed)도 목에 둔다.
     * 경고 종류별 문구를 화면에서 확인해야 하기 때문이다. */
    {
      id: 7,
      repo: 'acme-payment-service',
      pr_number: 128,
      pr_title: '사용하지 않는 정산 헬퍼 제거',
      pr_url: 'https://github.com/acme-payments/acme-payment-service/pull/128',
      author: 'leedev',
      created_at: '2026-08-08T01:40:00Z',
      warnings: [
        {
          change_type: 'deleted',
          symbol: 'src/batch/settle.py::legacy_settle',
          detail: '함수가 삭제되었습니다',
          impacted: [
            { symbol: 'src/batch/settle.py::settle_daily', path: 'src/batch/settle.py', line: 18, type: 'call' },
          ],
        },
        {
          change_type: 'constant_changed',
          symbol: 'src/constants.py::RETRY_LIMIT',
          detail: '값이 3에서 5로 바뀌었습니다',
          impacted: [
            { symbol: 'src/payment.py::process_payment', path: 'src/payment.py', line: 12, type: 'constant' },
          ],
        },
      ],
    },
    {
      id: 6,
      repo: 'acme-admin-web',
      pr_number: 96,
      pr_title: '결제 상태 유틸 이름 정리',
      pr_url: 'https://github.com/acme-payments/acme-admin-web/pull/96',
      author: 'parkdev',
      created_at: '2026-08-05T07:02:00Z',
      warnings: [
        {
          change_type: 'renamed',
          symbol: 'src/utils/status.ts::toLabel',
          detail: '함수 이름이 toLabel에서 formatStatusLabel로 바뀌었습니다',
          impacted: [
            { symbol: 'src/pages/Orders.tsx::OrderTable', path: 'src/pages/Orders.tsx', line: 44, type: 'import' },
          ],
        },
      ],
    },
  ],
  page: 1,
  per_page: 20,
  total: 8,
}

// ── 관리자 설정 ───────────────────────────────────────────────

export const queryLogs: Paged<QueryLog> = {
  items: [
    { id: 132, user_name: '김신입', action: 'context_view', repo: 'acme-payment-service', target: 'src/payment.py::process_payment', created_at: '2026-08-10T05:21:00Z' },
    { id: 131, user_name: '김신입', action: 'graph_view', repo: 'acme-payment-service', target: 'src/payment.py::process_payment', created_at: '2026-08-10T05:20:12Z' },
    { id: 130, user_name: '박사수', action: 'context_view', repo: 'acme-admin-web', target: 'src/utils/status.ts::toLabel', created_at: '2026-08-09T23:11:00Z' },
  ],
  page: 1,
  per_page: 20,
  total: 132,
}

export const planInfo: PlanInfo = {
  plan: 'starter',
  price_krw: 50000,
  repo_limit: 3,
  repos_used: 1,
}
