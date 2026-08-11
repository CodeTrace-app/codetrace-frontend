import Editor from '@monaco-editor/react'

// 코드 탐색기 (P0 핵심) — 3분할: 좌 파일트리 / 중 코드뷰어(읽기 전용) / 우 탭 패널
export default function Explorer() {
  return (
    <main style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: 240 }}>
        <h2>파일 트리</h2>
      </aside>
      <section style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          defaultValue="# 코드뷰어 (읽기 전용)"
          options={{ readOnly: true }}
        />
      </section>
      <aside style={{ width: 320 }}>
        <h2>맥락 / 영향 범위</h2>
        <p>탭1 맥락(요약+커밋+PR 출처), 탭2 영향 범위 그래프</p>
      </aside>
    </main>
  )
}
