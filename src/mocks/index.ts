/* 목 응답 라우터.
 *
 * 컴포넌트는 목데이터를 직접 import하지 않는다. 항상 api()를 호출하고,
 * 목/실제 판단은 클라이언트가 VITE_USE_MOCK으로 한다. 이래야 화면 하나씩
 * 실제 API로 넘길 수 있다.
 */

import { ApiError } from '../api/error'
import * as mock from './data'

/** 로딩 상태가 실제로 보이는지 확인할 수 있게 약간 지연시킨다 */
const DELAY_MS = 300

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

/** 목이 아직 없는 엔드포인트는 여기서 걸러 화면이 조용히 빈 값을 받지 않게 한다 */
function notMocked(method: Method, path: string): never {
  throw new ApiError(501, `목데이터 없음: ${method} ${path}`)
}

function match(path: string, pattern: RegExp): RegExpMatchArray | null {
  return path.match(pattern)
}

function route(method: Method, path: string, body: unknown): unknown {
  // 쿼리스트링은 분리해 둔다. 목은 대부분 경로만 보고 응답한다.
  const [pathname, search = ''] = path.split('?')
  const query = new URLSearchParams(search)

  if (method === 'POST') {
    switch (pathname) {
      case '/auth/signup':
        return mock.signupSession
      case '/auth/login':
        return mock.loginSession
      case '/auth/demo':
        return mock.demoSession
      case '/organizations':
        return {
          organization: {
            id: 1,
            name: (body as { name?: string })?.name ?? '에이크미',
            slug: 'acme-x1y2',
            plan: 'starter',
          },
          // 가입 시점 토큰에는 조직이 없다. 프론트는 이 토큰으로 교체한다
          access_token: 'mock.access.token',
        }
      case '/inquiries':
        return { id: 7, message: '문의가 접수되었습니다. 1영업일 내 연락드립니다.' }
      case '/repos':
        return mock.repoList.repos[0]
    }
    if (match(pathname, /^\/repos\/\d+\/reindex$/)) {
      return { id: 1, indexing_status: 'collecting' }
    }
    return notMocked(method, pathname)
  }

  if (method !== 'GET') return notMocked(method, pathname)

  switch (pathname) {
    case '/auth/me':
      // me는 로그인 응답에서 토큰만 뺀 형태다
      return {
        read_only: mock.loginSession.read_only ?? false,
        user: mock.loginSession.user,
        organization: mock.loginSession.organization,
      }
    case '/integrations':
      return mock.integrations
    case '/integrations/github/install-url':
      return { url: 'https://github.com/apps/codetrace-app/installations/new?state=mock' }
    case '/integrations/github/repos':
      return mock.githubRepoChoices
    case '/repos':
      return mock.repoList
    case '/pr-warnings':
      return mock.prWarnings
    case '/admin/query-logs':
      return mock.queryLogs
    case '/admin/plan':
      return mock.planInfo
  }

  if (match(pathname, /^\/repos\/\d+\/tree$/)) return mock.fileTree
  if (match(pathname, /^\/repos\/\d+\/file$/)) return mock.sourceFile
  if (match(pathname, /^\/repos\/\d+\/graph$/)) return mock.impactGraph
  if (match(pathname, /^\/repos\/\d+\/context$/)) {
    // 근거 없음·상충 화면을 만들려면 세 상태가 다 나와야 한다.
    // 파일 경로로 고른다 — utils.py는 근거 없음, auth.py는 상충, 나머지는 정상.
    const filePath = query.get('path') ?? ''
    return mock.contextByPath[filePath] ?? mock.contextOk
  }

  return notMocked(method, pathname)
}

export async function mockRequest(method: Method, path: string, body: unknown): Promise<unknown> {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
  return route(method, path, body)
}
