import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor, { type OnMount } from '@monaco-editor/react';
import FileTreeComponent from '../components/FileTree';
import ContextTab from '../components/ContextTab';
import ImpactTab from '../components/ImpactTab';
import { fetchTree, fetchFile, fetchContext, fetchGraph } from '../api/endpoints';
import { splitSymbolId } from '../utils/explorerLink';
import type { FileTree, SourceFile, FunctionContext, ImpactGraph } from '../api/types';
import './Explorer.css';

export default function Explorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'context' | 'impact'>('context');

  const repoParam = searchParams.get('repo') || '1';
  const fnParam = searchParams.get('fn') || '';

  const parsed = splitSymbolId(fnParam);
  const currentFilePath = parsed?.path || (fnParam.includes('::') ? fnParam.split('::')[0] : fnParam);
  const currentFuncName = parsed?.name || (fnParam.includes('::') ? fnParam.split('::')[1] : '');

  const repoId = Number(repoParam);
  const filePathRef = useRef(currentFilePath);
  filePathRef.current = currentFilePath;

  const [selectedLine, setSelectedLine] = useState<number>(1);

  const [treeData, setTreeData] = useState<FileTree | null>(null);
  const [fileData, setFileData] = useState<SourceFile | null>(null);
  const [contextData, setContextData] = useState<FunctionContext | null>(null);
  const [impactData, setImpactData] = useState<ImpactGraph | null>(null);

  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isLoadingImpact, setIsLoadingImpact] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingTree(true);

    fetchTree(repoId)
      .then((data: FileTree) => {
        if (isMounted) {
          setTreeData(data);
          const treeRoot = Array.isArray(data)
            ? data
            : Array.isArray(data?.root)
            ? data.root
            : (data as any)?.root?.children;

          if (!currentFilePath && Array.isArray(treeRoot) && treeRoot.length > 0) {
            const findFirstFile = (nodes: any[]): any => {
              for (const node of nodes) {
                if (node.type === 'file') return node;
                if (node.children) {
                  const found = findFirstFile(node.children);
                  if (found) return found;
                }
              }
              return null;
            };

            const firstChild = findFirstFile(treeRoot);
            if (firstChild) {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('fn', firstChild.path);
                return next;
              });
            }
          }
        }
      })
      .catch((err: unknown) => {
        console.error('Failed to fetch file tree:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingTree(false);
      });

    return () => {
      isMounted = false;
    };
  }, [repoId]);

  useEffect(() => {
    if (!currentFilePath) return;

    let isMounted = true;
    setIsLoadingFile(true);

    fetchFile(repoId, currentFilePath)
      .then((data: SourceFile) => {
        if (isMounted) {
          setFileData(data);

          if (!currentFuncName && data.functions && data.functions.length > 0) {
            const firstFn = data.functions[0];
            setSelectedLine(firstFn.start_line);
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.set('fn', `${currentFilePath}::${firstFn.name}`);
              return next;
            });
          }
        }
      })
      .catch((err: unknown) => {
        console.error('Failed to fetch file:', err);
        if (isMounted) {
          setFileData({
            path: currentFilePath,
            language: 'python',
            truncated: false,
            content: `# 파일을 불러오는 중 오류가 발생했습니다: ${currentFilePath}`,
            functions: [],
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingFile(false);
      });

    return () => {
      isMounted = false;
    };
  }, [repoId, currentFilePath]);

  useEffect(() => {
    if (activeTab !== 'context' || !currentFilePath) return;

    let isMounted = true;
    setIsLoadingContext(true);

    fetchContext(repoId, currentFilePath, selectedLine)
      .then((data: FunctionContext) => {
        if (isMounted) setContextData(data);
      })
      .catch((err: unknown) => {
        console.error('Failed to fetch context:', err);
        if (isMounted) setContextData(null);
      })
      .finally(() => {
        if (isMounted) setIsLoadingContext(false);
      });

    return () => {
      isMounted = false;
    };
  }, [repoId, currentFilePath, selectedLine, activeTab]);

  useEffect(() => {
    if (activeTab !== 'impact' || !currentFilePath) return;

    const targetFunc =
      currentFuncName ||
      (fileData?.functions && fileData.functions.length > 0 ? fileData.functions[0].name : '');

    if (!targetFunc) {
      setImpactData(null);
      return;
    }

    let isMounted = true;
    setIsLoadingImpact(true);

    fetchGraph(repoId, currentFilePath, targetFunc)
      .then((data: ImpactGraph) => {
        if (isMounted) setImpactData(data);
      })
      .catch((err: unknown) => {
        console.error('Failed to fetch impact graph:', err);
        if (isMounted) setImpactData(null);
      })
      .finally(() => {
        if (isMounted) setIsLoadingImpact(false);
      });

    return () => {
      isMounted = false;
    };
  }, [repoId, currentFilePath, currentFuncName, fileData, activeTab]);

  const handleEditorDidMount: OnMount = (editor) => {
    editor.onDidChangeCursorPosition((e) => {
      const model = editor.getModel();
      if (!model) return;

      const lineNumber = e.position.lineNumber;
      setSelectedLine(lineNumber);

      const minLine = Math.max(1, lineNumber - 100);
      for (let line = lineNumber; line >= minLine; line--) {
        const lineContent = model.getLineContent(line);
        const match = lineContent.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
        if (match && match[1]) {
          const clickedFuncName = match[1];
          const path = filePathRef.current;
          const targetParam = `${path}::${clickedFuncName}`;

          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (next.get('fn') !== targetParam) {
              next.set('fn', targetParam);
              return next;
            }
            return prev;
          });
          break;
        }
      }
    });
  };

  const handleSelectFile = (path: string) => {
    setSelectedLine(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('fn', path);
      return next;
    });
  };

  const handleNavigateParent = (parentPath: string) => {
    setSelectedLine(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('fn', parentPath);
      return next;
    });
  };

  const handleSelectImpactNode = (filePath: string, funcName?: string) => {
    setSelectedLine(1);
    const target = funcName ? `${filePath}::${funcName}` : filePath;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('fn', target);
      return next;
    });
  };

  return (
    <div className="explorer-container">
      {/* 파일 트리 */}
      <aside className="left-panel">
        <div className="panel-header">
          <span>파일 트리</span>
        </div>
        <div className="tree-content">
          {isLoadingTree ? (
            <div style={{ padding: '16px', color: '#656d76', fontSize: '13px' }}>
              트리 불러오는 중...
            </div>
          ) : treeData?.root ? (
            <FileTreeComponent
              data={treeData.root}
              selectedPath={currentFilePath}
              onSelectFile={handleSelectFile}
            />
          ) : (
            <div style={{ padding: '16px', color: '#656d76', fontSize: '13px' }}>
              파일 목록이 없습니다.
            </div>
          )}
        </div>
      </aside>

      {/* 코드 뷰어 */}
      <main className="center-panel">
        <div className="center-panel-header">
          <div className="file-info-group">
            <span className="current-file-path">
              {currentFilePath ? currentFilePath.split('/').pop() : '파일을 선택하세요'}
            </span>
            <span className="file-badge">읽기 전용</span>
            <span className="file-badge">
              {fileData?.language
                ? fileData.language.charAt(0).toUpperCase() + fileData.language.slice(1)
                : 'Python'}
            </span>
          </div>
        </div>

        {fileData?.truncated && (
          <div className="truncated-banner">
            ⚠️ 대용량 파일이므로 일부 내용만 표시됩니다. (500KB 초과)
          </div>
        )}

        <div className="editor-wrapper">
          {isLoadingFile ? (
            <div style={{ padding: '24px', color: '#656d76' }}>코드를 불러오는 중...</div>
          ) : (
            <Editor
              key={currentFilePath}
              height="100%"
              language={fileData?.language || 'python'}
              value={fileData?.content || ''}
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
          )}
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
          {activeTab === 'context' &&
            (isLoadingContext ? (
              <div style={{ padding: '20px', color: '#656d76', fontSize: '13px' }}>
                맥락 데이터 분석 중...
              </div>
            ) : contextData ? (
              <ContextTab data={contextData} onNavigateParent={handleNavigateParent} />
            ) : (
              <div style={{ padding: '20px', color: '#656d76', fontSize: '13px' }}>
                맥락 정보가 없습니다.
              </div>
            ))}

          {activeTab === 'impact' &&
            (isLoadingImpact ? (
              <div style={{ padding: '20px', color: '#656d76', fontSize: '13px' }}>
                영향 범위 계산 중...
              </div>
            ) : impactData ? (
              <ImpactTab data={impactData} onSelectNode={handleSelectImpactNode} />
            ) : (
              <div style={{ padding: '20px', color: '#656d76', fontSize: '13px' }}>
                영향 범위 정보가 없습니다.
              </div>
            ))}
        </div>
      </aside>
    </div>
  );
}