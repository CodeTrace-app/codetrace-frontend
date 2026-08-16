/* API 클라이언트.
 *
 * 컴포넌트는 목데이터를 직접 import하지 않는다. 항상 이 모듈을 호출하고,
 * 목/실제 판단은 여기서 VITE_USE_MOCK으로 한다.
 * 이래야 화면 하나씩 실제 API로 넘길 수 있다 (전부 한 번에 바꾸지 않아도 된다).
 */

import { ApiError } from './error'
import { currentToken } from './session'
import { mockRequest } from '../mocks'

// 백엔드 주소는 VITE_API_URL로만 주입한다. 하드코딩 금지.
const BASE = `${import.meta.env.VITE_API_URL}/api/v1`

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface Options {
  /** 인증 없이 부르는 엔드포인트(🔓)는 false. 기본은 토큰을 붙인다 */
  auth?: boolean
}

async function request<T>(method: Method, path: string, body?: unknown, options: Options = {}): Promise<T> {
  if (USE_MOCK) {
    return (await mockRequest(method, path, body)) as T
  }

  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (options.auth !== false) {
    const token = currentToken()
    if (token !== null) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!res.ok) {
    throw new ApiError(res.status, await readDetail(res))
  }

  // 204는 본문이 없다
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/** FastAPI는 `{ "detail": "..." }`로 내려준다. 형식이 다르면 상태 코드만 쓴다 */
async function readDetail(res: Response): Promise<string> {
  try {
    const parsed: unknown = await res.json()
    const detail = (parsed as { detail?: unknown }).detail
    if (typeof detail === 'string') return detail
    // 422는 detail이 배열(pydantic 검증 오류)로 온다
    if (Array.isArray(detail)) return '입력값을 확인해 주세요'
  } catch {
    /* 본문이 JSON이 아니면 아래 기본 문구를 쓴다 */
  }
  return `요청을 처리하지 못했습니다 (${res.status})`
}

export function apiGet<T>(path: string, options?: Options): Promise<T> {
  return request<T>('GET', path, undefined, options)
}

export function apiPost<T>(path: string, body?: unknown, options?: Options): Promise<T> {
  return request<T>('POST', path, body, options)
}

/** 화면에서 목 모드임을 알려야 할 때 쓴다 (예: 개발용 배지) */
export const usingMock = USE_MOCK
