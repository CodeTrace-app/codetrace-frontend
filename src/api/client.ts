// 백엔드 주소는 VITE_API_URL로만 주입한다. 하드코딩 금지 (CLAUDE.md §2).
const API_URL: string = import.meta.env.VITE_API_URL

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init)
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`)
  }
  return res.json() as Promise<T>
}
