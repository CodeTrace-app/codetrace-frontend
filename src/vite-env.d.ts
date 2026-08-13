/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 백엔드 주소. 하드코딩 금지 — 이 값으로만 주입한다 */
  readonly VITE_API_URL: string
  /** "true"면 목데이터로 동작한다. 백엔드 없이 화면을 만들 때 쓴다 */
  readonly VITE_USE_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
