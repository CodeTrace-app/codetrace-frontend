import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import FileTree from '../components/FileTree';
import ContextTab from '../components/ContextTab';
import ImpactTab from '../components/ImpactTab';
import {
  fileTree as mockTreeData,
  sourceFile as mockSourceFile,
  contextOk,
  contextByPath,
  impactGraph as mockImpactGraph,
} from '../mocks/data';
import type { FunctionContext, ImpactGraph, SourceFile } from '../api/types';
import './Explorer.css';

export default function Explorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'context' | 'impact'>('context');

  const fnParam = searchParams.get('fn') || 'src/payment.py::process_payment';
  const currentFilePath = fnParam.includes('::') ? fnParam.split('::')[0] : fnParam;
  const currentFuncName = fnParam.includes('::') ? fnParam.split('::')[1] : 'process_payment';

  const filePathRef = useRef(currentFilePath);
  filePathRef.current = currentFilePath;

  // 1. 파일 내용 (src/mocks/data.ts 의 sourceFile 사용)
  const fileData: SourceFile = mockSourceFile;

  // 2. 맥락 데이터 (src/mocks/data.ts 의 contextByPath 및 contextOk 사용)
  const contextData: FunctionContext = contextByPath[currentFilePath] || {
    ...contextOk,
    function: {
      name: currentFuncName || 'process_payment',
      path: currentFilePath,
      start_line: 7,
      end_line: 22,
    },
  };

  // 3. 영향 범위 데이터 (src/mocks/data.ts 의 impactGraph 사용)
  const impactData: ImpactGraph = {
    ...mockImpactGraph,
    root: {
      ...mockImpactGraph.root,
      name: currentFuncName || mockImpactGraph.root.name,
      path: currentFilePath,
    },
  };

  // Monaco Editor 클릭 이벤트
  const handleEditorDidMount = (editor: any) => {
    editor.onMouseDown((e: any) => {
      if (!e.target || !e.target.position) return;
      const model = editor.getModel();
      if (!model) return;

      const lineNumber = e.target.position.lineNumber;
      const minLine = Math.max(1, lineNumber - 15);
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

  const handleSelectImpactNode = (filePath: string, funcName?: string) => {
    const target = funcName ? `${filePath}::${funcName}` : filePath;
    const params = new URLSearchParams(searchParams);
    params.set('fn', target);
    setSearchParams(params);
  };

  return (
    <div className="explorer-container">
      {/* 1. 좌측 파일 탐색기 */}
      <aside className="left-panel">
        <div className="panel-header">
          <span>파일 탐색기</span>
        </div>
        <div className="tree-content">
          <FileTree
            data={mockTreeData.root}
            selectedPath={currentFilePath}
            onSelectFile={handleSelectFile}
          />
        </div>
      </aside>

      {/* 2. 중앙 코드 뷰어 */}
      <main className="center-panel">
        <div className="center-panel-header">
          <div className="file-info-group">
            <span className="current-file-path">
              {currentFilePath.split('/').pop()}
            </span>
            <span className="file-badge">읽기 전용</span>
            <span className="file-badge">
              {fileData.language
                ? fileData.language.charAt(0).toUpperCase() + fileData.language.slice(1)
                : 'Python'}
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
            key={currentFilePath}
            height="100%"
            language={fileData.language || 'python'}
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

      {/* 3. 우측 패널 (맥락 / 영향 범위) */}
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
              onNavigateParent={handleNavigateParent}
            />
          )}

          {activeTab === 'impact' && (
            <ImpactTab
              data={impactData}
              onSelectNode={handleSelectImpactNode}
            />
          )}
        </div>
      </aside>
    </div>
  );
}