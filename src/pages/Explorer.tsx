import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor, { type Monaco } from '@monaco-editor/react';
import './Explorer.css';

interface FunctionItem {
  name: string;
  start_line: number;
  end_line: number;
}

interface FileData {
  path: string;
  language?: string;
  code: string;
  truncated: boolean;
  functions: FunctionItem[];
}

const MOCK_FILE_DATA: FileData = {
  path: 'auth_service.py',
  language: 'python',
  truncated: false,
  code: `class AuthService:

    def __init__(self, user_repo):
        self.user_repo = user_repo

    def create_access_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE
        )
        return jwt.encode(to_encode, SECRET_KEY)

    def verify_token(self, token: str) -> dict:
        payload = jwt.decode(
            token, settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload

    def authenticate_user(self, email, password):
        user = self.user_repo.find_by_email(email)
        if not verify_password(password, user.hash):
            raise InvalidCredentialsError()
        return user`,
  functions: [
    { name: '__init__', start_line: 3, end_line: 4 },
    { name: 'create_access_token', start_line: 6, end_line: 12 },
    { name: 'verify_token', start_line: 14, end_line: 19 },
    { name: 'authenticate_user', start_line: 21, end_line: 26 },
  ]
};

export default function Explorer() {
  const [searchParams, setSearchParams] = useSearchParams();

  const repoParam = searchParams.get('repo') || '1';
  const fnParam = searchParams.get('fn') || '';
  const tabParam = (searchParams.get('tab') as 'context' | 'impact') || 'context';

  const [activeTab, setActiveTab] = useState<'context' | 'impact'>(tabParam);
  const [selectedFunctionName, setSelectedFunctionName] = useState<string>('');

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  useEffect(() => {
    if (fnParam.includes('::')) {
      const [, fnName] = fnParam.split('::');
      setSelectedFunctionName(fnName);
    } else {
      setSelectedFunctionName('');
    }

    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab') as 'context' | 'impact');
    }
  }, [fnParam, searchParams]);

  const updateUrl = (fnName: string, tab: 'context' | 'impact') => {
    const fnValue = fnName ? `${MOCK_FILE_DATA.path}::${fnName}` : MOCK_FILE_DATA.path;
    setSearchParams({
      repo: repoParam,
      fn: fnValue,
      tab: tab
    });
  };

  const handleTabChange = (tab: 'context' | 'impact') => {
    setActiveTab(tab);
    updateUrl(selectedFunctionName, tab);
  };

  const detectFunctionAtLine = (line: number): FunctionItem | null => {
    const matched = MOCK_FILE_DATA.functions.filter(
      (fn) => line >= fn.start_line && line <= fn.end_line
    );

    if (matched.length === 0) return null;

    return matched.reduce((prev, curr) => {
      const prevRange = prev.end_line - prev.start_line;
      const currRange = curr.end_line - curr.start_line;
      return currRange < prevRange ? curr : prev;
    });
  };

  const handleEditorMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidChangeCursorPosition((e: any) => {
      const line = e.position.lineNumber;
      const detectedFn = detectFunctionAtLine(line);
      const newFnName = detectedFn ? detectedFn.name : '';

      if (newFnName !== selectedFunctionName) {
        setSelectedFunctionName(newFnName);
        updateUrl(newFnName, activeTab);
      }
    });
  };

  return (
    <div className="explorer-container">
      {/* 파일 트리 영역 */}
      <aside className="explorer-tree">
        <div className="explorer-header">
          <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)' }}>
            파일 트리
          </span>
        </div>
        <div className="explorer-scroll-content">
          <div className="explorer-tree-item active">
            📄 {MOCK_FILE_DATA.path}
          </div>
          <div className="explorer-tree-item">📄 user_service.py</div>
          <div className="explorer-tree-item">📄 payment_service.py</div>
        </div>
      </aside>

      {/* 코드 뷰어 영역 */}
      <section className="explorer-code">
        <div className="explorer-header">
          <span className="explorer-file-name">{MOCK_FILE_DATA.path}</span>
          <span className="explorer-badge">읽기 전용</span>
          <span className="explorer-badge">{MOCK_FILE_DATA.language || 'plaintext'}</span>
        </div>

        {MOCK_FILE_DATA.truncated && (
          <div className="explorer-truncated-banner">
            파일이 커서 일부만 표시됩니다.
          </div>
        )}

        <div className="explorer-code-content">
          <Editor
            height="100%"
            language={MOCK_FILE_DATA.language || 'plaintext'}
            value={MOCK_FILE_DATA.code}
            onMount={handleEditorMount}
            options={{
              readOnly: true,
              domReadOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </section>

      {/* 맥락/영향범위 영역 */}
      <aside className="explorer-panel">
        <div className="explorer-tab-bar">
          <button
            className={`explorer-tab-button ${activeTab === 'context' ? 'active' : ''}`}
            onClick={() => handleTabChange('context')}
          >
            맥락
          </button>
          <button
            className={`explorer-tab-button ${activeTab === 'impact' ? 'active' : ''}`}
            onClick={() => handleTabChange('impact')}
          >
            영향 범위
          </button>
        </div>

        <div className="explorer-scroll-content">
          {activeTab === 'context' ? (
            <div>
              <h3 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-2)' }}>
                {selectedFunctionName ? `${selectedFunctionName}()` : '파일 단위 맥락'}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                {selectedFunctionName
                  ? `선택된 함수: ${selectedFunctionName}`
                  : '함수 밖(모듈 레벨)이 선택되어 파일 단위 맥락으로 처리됨'}
              </p>
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-2)' }}>
                영향 범위
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                이후 이슈에서 그래프/카드 목록이 얹혀질 영역
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}