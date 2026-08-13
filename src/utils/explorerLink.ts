/* 탐색기 진입 링크 규격 (api-spec §8, 프론트·백엔드 합의).
 *
 *   /explorer?repo=<repo_id>&fn=<파일경로::함수명>&tab=impact
 *
 * PR 경고 코멘트(백엔드)와 PR 경고 이력 화면이 같은 형식을 쓴다.
 * 여기서만 만들고 여기서만 읽는다 — 양쪽이 따로 조립하면 어긋난다.
 */

export type ExplorerTab = 'context' | 'impact'

export interface ExplorerTarget {
  repoId: number
  /** "파일경로::함수명" — 그래프 노드 id와 같은 형식 */
  fn: string
  tab: ExplorerTab
}

export function explorerLink(repoId: number, fn: string, tab: ExplorerTab = 'context'): string {
  const query = new URLSearchParams({ repo: String(repoId), fn, tab })
  return `/explorer?${query.toString()}`
}

/** 탐색기가 진입 시 파라미터를 읽는다. 형식이 어긋나면 null — 화면은 기본 상태로 연다 */
export function parseExplorerTarget(search: string): ExplorerTarget | null {
  const query = new URLSearchParams(search)
  const repo = query.get('repo')
  const fn = query.get('fn')
  if (repo === null || fn === null) return null

  const repoId = Number(repo)
  if (!Number.isInteger(repoId)) return null

  // tab은 생략 가능하며 기본값은 context다
  const tab = query.get('tab')
  return { repoId, fn, tab: tab === 'impact' ? 'impact' : 'context' }
}

/** "src/payment.py::process_payment" → 파일경로와 심볼명 */
export function splitSymbolId(id: string): { path: string; name: string } | null {
  const separator = id.indexOf('::')
  if (separator === -1) return null
  return { path: id.slice(0, separator), name: id.slice(separator + 2) }
}
