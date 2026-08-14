/** 백엔드 에러 응답. FastAPI 기본 형식은 `{ "detail": "..." }`이다. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
  }

  /** 401은 토큰 없음·만료 — 화면은 이걸 보고 로그인으로 보낸다 */
  get isUnauthorized(): boolean {
    return this.status === 401
  }

  /** 403은 데모 세션 차단·관리자 전용·플랜 한도. 로그인으로 보내면 안 된다 */
  get isForbidden(): boolean {
    return this.status === 403
  }
}
