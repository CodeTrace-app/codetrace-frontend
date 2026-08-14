import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor, { type Monaco } from '@monaco-editor/react';
import { fetchFile } from '../api/endpoints';
import type { SourceFile, FunctionRange } from '../api/types';
import './Explorer.css';

export default function Explorer() {
  const [searchParams, setSearchParams] = useSearchParams();

  const repoParam = searchParams.get('repo') || '1';
  const fnParam = searchParams.get('fn') || '';
  const tabParam = (searchParams.get('tab') as 'context' | 'impact') || 'context';

  const [fileData, setFileData] = useState<SourceFile | null>(null);
  const [activeTab, setActiveTab] = useState<'context' | 'impact'>(tabParam);
  const [selectedFunctionName, setSelectedFunctionName] = useState<string>('');

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const activeTabRef = useRef(activeTab);
  const selectedFunctionNameRef = useRef(selectedFunctionName);
  const fileDataRef = useRef<SourceFile | null>(fileData);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    selectedFunctionNameRef.current = selectedFunctionName;
  }, [selectedFunctionName]);

  useEffect(() => {
    fileDataRef.current = fileData;
  }, [fileData]);

  useEffect(() => {
    fetchFile(Number(repoParam), fnParam)
      .then((data) => {
        setFileData(data);
      })
      .catch((err) => {
        console.error('파일을 불러오는 중 에러 발생:', err);
      });
  }, [repoParam, fnParam]);

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
    const currentPath = fileDataRef.current?.path || 'src/auth_service.py';
    const fnValue = fnName ? `${currentPath}::${fnName}` : currentPath;
    setSearchParams(
      {
        repo: repoParam,
        fn: fnValue,
        tab: tab,
      },
      { replace: true }
    );
  };

  const detectFunctionInRange = (startLine: number, endLine: number): FunctionRange | null => {
    const currentData = fileDataRef.current;
    if (!currentData || !currentData.functions) return null;

    const matched = currentData.functions.filter((fn: FunctionRange) => {
      return Math.max(startLine, fn.start_line) <= Math.min(endLine, fn.end_line);
    });

    if (matched.length === 0) return null;

    return matched.reduce((prev: FunctionRange, curr: FunctionRange) => {
      const prevRange = prev.end_line - prev.start_line;
      const currRange = curr.end_line - curr.start_line;
      return currRange < prevRange ? curr : prev;
    });
  };

  const checkSelectionAndDetectFunction = (editor: any) => {
    const selection = editor.getSelection();
    if (!selection) return;

    const startLine = Math.min(selection.startLineNumber, selection.endLineNumber);
    const endLine = Math.max(selection.startLineNumber, selection.endLineNumber);

    const detectedFn = detectFunctionInRange(startLine, endLine);
    const newFnName = detectedFn ? detectedFn.name : '';

    if (newFnName !== selectedFunctionNameRef.current) {
      setSelectedFunctionName(newFnName);
      updateUrl(newFnName, activeTabRef.current);
    }
  };

  const handleEditorMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidChangeCursorPosition(() => {
      checkSelectionAndDetectFunction(editor);
    });

    editor.onDidChangeCursorSelection(() => {
      checkSelectionAndDetectFunction(editor);
    });
  };

  const handleTabChange = (tab: 'context' | 'impact') => {
    setActiveTab(tab);
    updateUrl(selectedFunctionName, tab);
  };

  return (
    <div className="explorer-container">
      {/* 파일 트리 영역 */}
      <aside className="left-panel">
        <div className="panel-header">파일 트리</div>
        <div className="panel-content">
          <p className="placeholder-text">{fileData?.path || 'src/auth_service.py'}</p>
        </div>
      </aside>

      {/* 코드 뷰어 영역 */}
      <main className="center-panel">
        <div className="file-header">
          <span className="file-title">{fileData?.path?.split('/').pop() || 'auth_service.py'}</span>
          <span className="badge">읽기 전용</span>
          {fileData?.language && <span className="badge">{fileData.language}</span>}
        </div>

        {fileData?.truncated && (
          <div className="truncated-banner">
            ⚠️ 대용량 파일이므로 일부 내용만 표시됩니다.
          </div>
        )}

        <Editor
          height="100%"
          language={fileData?.language || 'plaintext'}
          value={fileData?.content || ''}
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
      </main>

      {/* 맥락/영향 범위 영역 */}
      <aside className="right-panel">
        <div className="tab-header">
          <button
            className={`tab-button ${activeTab === 'context' ? 'active' : ''}`}
            onClick={() => handleTabChange('context')}
          >
            맥락
          </button>
          <button
            className={`tab-button ${activeTab === 'impact' ? 'active' : ''}`}
            onClick={() => handleTabChange('impact')}
          >
            영향 범위
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'context' ? (
            <div>
              <h3>{selectedFunctionName ? '함수 단위 맥락' : '파일 단위 맥락'}</h3>
              <p>선택된 함수: <strong>{selectedFunctionName || '없음'}</strong></p>
            </div>
          ) : (
            <div>
              <h3>영향 범위</h3>
              <p>선택된 함수: <strong>{selectedFunctionName || '없음'}</strong></p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}