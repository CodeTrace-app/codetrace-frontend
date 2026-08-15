import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import type { RepoTreeResponse, FileResponse, ContextResponse } from '../api/types';
import FileTree from '../components/FileTree';
import ContextTab from '../components/ContextTab';
import './Explorer.css';

const mockTreeData: RepoTreeResponse = {
  root: [
    {
      name: 'src',
      type: 'directory',
      children: [
        {
          name: 'api',
          type: 'directory',
          children: [
            { name: 'checkout.py', type: 'file', path: 'src/api/checkout.py' },
          ],
        },
        { name: 'auth_service.py', type: 'file', path: 'src/auth_service.py' },
        { name: 'legacy_util.py', type: 'file', path: 'src/legacy_util.py' },
        { name: 'heavy_data.py', type: 'file', path: 'src/heavy_data.py' },
      ],
    },
    { name: 'README.md', type: 'file', path: 'README.md' },
  ],
};

const mockFiles: Record<string, FileResponse> = {
  'src/auth_service.py': {
    path: 'src/auth_service.py',
    language: 'python',
    truncated: false,
    content: `import jwt
from datetime import datetime, timedelta

ALLOWED_ALGORITHMS = ["HS256", "RS256"]

def verify_token(token: str, secret_key: str):
    """OAuth 토큰 및 JWT 서명을 검증합니다."""
    # [Case 1: ok + 다수 근거 + evidence_truncated]
    header = jwt.get_unverified_header(token)
    algo = header.get("alg")
    if algo not in ALLOWED_ALGORITHMS:
        raise ValueError("지원하지 않는 알고리즘")
    return jwt.decode(token, secret_key, algorithms=[algo])

def check_permission(user_id: str, role: str):
    """권한 검증 함수"""
    # [Case 2: conflicting 상충 근거 발생 케이스]
    return role == "ADMIN"
`,
    functions: [],
  },
  'src/api/checkout.py': {
    path: 'src/api/checkout.py',
    language: 'python',
    truncated: false,
    content: `import httpx
from src.constants import TIMEOUT_SECONDS
from src.pg.client import PgClient

def process_payment(order_id, amount, retry=3):
    """결제를 승인한다."""
    # [Case 3: 일반 ok 케이스]
    client = PgClient(timeout=TIMEOUT_SECONDS)
    for attempt in range(retry):
        try:
            return client.request(order_id, amount)
        except httpx.TimeoutException:
            if attempt == retry - 1:
                raise
    return None
`,
    functions: [],
  },
  'src/legacy_util.py': {
    path: 'src/legacy_util.py',
    language: 'python',
    truncated: false,
    content: `def format_old_string(text: str):
    """이 함수는 git blame 이력이 없는 신규/고립 함수입니다."""
    # [Case 4: no_history 케이스 -> 상위 모듈 이동 제공]
    return text.strip().lower()
`,
    functions: [],
  },
  'src/heavy_data.py': {
    path: 'src/heavy_data.py',
    language: 'python',
    truncated: true,
    content: `# [Case 5: 대용량 파일 truncated 경고 배너 테스트]
# 이 파일은 500KB를 초과하여 일부 라인만 렌더링된 상태입니다.

DATA_MATRIX = [
    [i * j for j in range(100)] for i in range(100)
]

def load_matrix():
    return DATA_MATRIX
`,
    functions: [],
  },
  'README.md': {
    path: 'README.md',
    language: null as any,
    truncated: false,
    content: `# CodeTrace Project

코드의 변경 이력과 맥락(Context)을 한눈에 추적하는 개발자 도구입니다.

### 지원 기능
1. **맥락 탭 (Context)**: 함수 작성 배경 및 커밋/PR 근거 출처 조회
2. **영향 범위 (Impact)**: 수정 시 영향을 받는 의존성 모듈 분석
3. **대용량 파일 가드**: 파일 초과 시 경고 배너 표시
`,
    functions: [],
  },
};

const mockContextMap: Record<string, ContextResponse> = {
  'src/auth_service.py::verify_token': {
    status: 'ok',
    function_name: 'verify_token',
    summary:
      '2022년 11월 OAuth 토큰 검증 표준화 작업(PR #143) 당시 도입되었습니다. 기존 세션 기반 인증에서 JWT 방식으로 전환하면서 검증 로직을 단일 서비스 계층으로 분리한 것이 원래 의도입니다. 이후 2023년 3월 보안 감사(PR #201)에서 알고리즘 화이트리스트 강제가 추가되었고, 현재 settings.ALGORITHM 주입 구조가 이때 확정되었습니다.',
    evidence_truncated: true,
    evidences: [
      {
        type: 'commit',
        sha: 'a3f9c12489ab',
        message: 'feat: JWT 검증 서비스 계층 분리',
        author: 'kim-dev',
        date: '2022-11-06',
        pr_number: 143,
        url: 'https://github.com',
      },
      {
        type: 'pr',
        number: 143,
        title: 'OAuth 토큰 표준화 재선 -> JWT 전환',
        author: 'kim-dev',
        date: '2022-11-12',
        url: 'https://github.com',
      },
      {
        type: 'commit',
        sha: '8bc1e47321ef',
        message: '보안 감사: 알고리즘 화이트리스트 강제 주입',
        author: 'park-sec',
        date: '2023-03-15',
        pr_number: 201,
        url: 'https://github.com',
      },
      {
        type: 'pr',
        number: 201,
        title: '알고리즘 미지정 시 보안 취약점 방어',
        author: 'park-sec',
        date: '2023-03-16',
        url: 'https://github.com',
      },
      {
        type: 'commit',
        sha: '109ef32a87bc',
        message: 'refactor: 만료 시간 예외 세분화',
        author: 'choi-core',
        date: '2023-08-01',
        url: 'https://github.com',
      },
    ],
  },
  'src/auth_service.py::check_permission': {
    status: 'conflicting',
    function_name: 'check_permission',
    summary:
      'PR #88에서는 모든 관리자 권한을 단일 role 필드로 체크하도록 합의하였으나, 이후 Commit a90b2c1에서 임시 핫픽스로 레거시 permission_level을 병행 참조하면서 의도가 충돌하고 있습니다.',
    evidence_truncated: false,
    evidences: [
      {
        type: 'pr',
        number: 88,
        title: 'RBAC 단일 role 체계로 통합',
        author: 'admin-lead',
        date: '2023-05-10',
        url: 'https://github.com',
      },
      {
        type: 'commit',
        sha: 'a90b2c1998af',
        message: 'hotfix: 이전 시스템 호환을 위한 level 필드 병행',
        author: 'intern-dev',
        date: '2023-05-12',
        url: 'https://github.com',
      },
    ],
  },
  'src/api/checkout.py::process_payment': {
    status: 'ok',
    function_name: 'process_payment',
    summary:
      '2024년 11월 PG사 타임아웃 장애(#PR 41) 이후 재시도 3회와 멱등키 검증이 추가된 함수입니다. 2025년 6월 타임아웃이 3초에서 10초로 조정되었고, 현재는 모든 결제 요청이 이 함수를 단일 경로로 통과합니다.',
    evidence_truncated: false,
    evidences: [
      {
        type: 'commit',
        sha: 'c8f12a912389',
        message: 'fix: PG사 타임아웃 대응 재시도 로직 추가',
        author: 'lee-pg',
        date: '2024-11-20',
        pr_number: 41,
        url: 'https://github.com',
      },
      {
        type: 'pr',
        number: 41,
        title: '결제 타임아웃 방어 및 지수 백오프 적용',
        author: 'lee-pg',
        date: '2024-11-21',
        url: 'https://github.com',
      },
    ],
  },
  'src/legacy_util.py::format_old_string': {
    status: 'no_history',
    function_name: 'format_old_string',
    parent_module: 'src/legacy_util.py',
    summary: '',
    evidence_truncated: false,
    evidences: [],
  },
  'src/heavy_data.py::load_matrix': {
    status: 'no_history',
    function_name: 'load_matrix',
    parent_module: 'src/heavy_data.py',
    summary: '',
    evidence_truncated: false,
    evidences: [],
  },
};

export default function Explorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'context' | 'impact'>('context');
  const fnParam = searchParams.get('fn') || 'src/auth_service.py::verify_token';
  const currentFilePath = fnParam.includes('::') ? fnParam.split('::')[0] : fnParam;
  const currentFuncName = fnParam.includes('::') ? fnParam.split('::')[1] : '';

  const filePathRef = useRef(currentFilePath);
  filePathRef.current = currentFilePath;

  const fileData = mockFiles[currentFilePath] || mockFiles['src/auth_service.py'];

  let contextData: ContextResponse;
  if (mockContextMap[fnParam]) {
    contextData = mockContextMap[fnParam];
  } else if (currentFuncName) {
    contextData = {
      status: 'no_history',
      function_name: currentFuncName,
      parent_module: currentFilePath,
      summary: '',
      evidence_truncated: false,
      evidences: [],
    };
  } else {
    contextData = {
      status: 'ok',
      function_name: currentFilePath.split('/').pop() || 'file_root',
      summary: `${currentFilePath} 파일의 맥락입니다. 특정 함수의 상세 맥락을 보려면 코드 상의 함수를 마우스로 직접 클릭하세요.`,
      evidence_truncated: false,
      evidences: [
        {
          type: 'commit',
          sha: 'init01a',
          message: `chore: ${currentFilePath.split('/').pop()} 모듈 초기화`,
          author: 'system',
          date: '2023-01-10',
          url: 'https://github.com',
        },
      ],
    };
  }

  const handleEditorDidMount = (editor: any) => {
    editor.onMouseDown((e: any) => {
      if (!e.target || !e.target.position) return;
      const model = editor.getModel();
      if (!model) return;

      const lineNumber = e.target.position.lineNumber;
      const minLine = Math.max(1, lineNumber - 10);
      for (let line = lineNumber; line >= minLine; line--) {
        const lineContent = model.getLineContent(line);
        const match = lineContent.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
        if (match && match[1]) {
          const clickedFuncName = match[1];
          const path = filePathRef.current;
          const targetParam = `${path}::${clickedFuncName}`;

          const params = new URLSearchParams(window.location.search);
          params.set('fn', targetParam);
          setSearchParams(params);
          break;
        }
      }
    });
  };

  const handleSelectFile = (path: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('fn', path);
    setSearchParams(params);
  };

  const handleNavigateParent = (parentPath: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('fn', parentPath);
    setSearchParams(params);
  };

  return (
    <div className="explorer-container">
      {/* 파일 트리 */}
      <aside className="left-panel">
        <div className="panel-header">
          <span>파일 트리</span>
        </div>
        <div className="tree-content">
          <FileTree
            data={mockTreeData}
            selectedPath={currentFilePath}
            onSelectFile={handleSelectFile}
          />
        </div>
      </aside>

      {/* 코드 뷰어 */}
      <main className="center-panel">
        <div className="center-panel-header">
          <div className="file-info-group">
            <span className="current-file-path">
              {fileData.path.split('/').pop()}
            </span>
            <span className="file-badge">읽기 전용</span>
            <span className="file-badge">
              {fileData.language
                ? fileData.language.charAt(0).toUpperCase() + fileData.language.slice(1)
                : 'Markdown'}
            </span>
          </div>
        </div>

        {fileData.truncated && (
          <div className="truncated-banner">
            ⚠️ 대용량 파일이므로 일부 내용만 표시됩니다. (500KB 초과)
          </div>
        )}

        <div className="editor-wrapper">
          <Editor
            key={fileData.path}
            height="100%"
            language={fileData.language || 'markdown'}
            value={fileData.content}
            theme="vs-light"
            onMount={handleEditorDidMount}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden',
                verticalScrollbarSize: 0,
                horizontalScrollbarSize: 0,
              },
            }}
          />
        </div>
      </main>

      {/* 맥락/영향 범위 */}
      <aside className="right-panel">
        <div className="tab-header">
          <button
            type="button"
            className={`tab-button ${activeTab === 'context' ? 'active' : ''}`}
            onClick={() => setActiveTab('context')}
          >
            맥락
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'impact' ? 'active' : ''}`}
            onClick={() => setActiveTab('impact')}
          >
            영향 범위
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'context' && (
            <ContextTab
              data={contextData}
              functionName={
                currentFuncName
                  ? `${currentFuncName}()`
                  : (fileData.path.split('/').pop() || '')
              }
              onNavigateParent={handleNavigateParent}
            />
          )}

          {activeTab === 'impact' && (
            <div className="impact-placeholder">
              <p>영향 범위 분석 내용이 표시됩니다.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}