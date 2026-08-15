import React, { useState } from 'react';
import type { RepoTreeResponse, TreeNode } from '../api/types';
import './FileTree.css';

interface FileTreeProps {
  data: RepoTreeResponse | TreeNode[] | any;
  selectedPath?: string;
  onSelectFile?: (path: string) => void;
}

function TreeNodeItem({
  node,
  selectedPath,
  onSelectFile,
  level = 0,
}: {
  node: TreeNode;
  selectedPath?: string;
  onSelectFile?: (path: string) => void;
  level: number;
}) {
  const isDirectory = node.type === 'directory' || Boolean(node.children && node.children.length > 0);
  const [isOpen, setIsOpen] = useState(true);

  const isSelected = !isDirectory && node.path === selectedPath;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDirectory) {
      setIsOpen(!isOpen);
    } else if (node.path && onSelectFile) {
      onSelectFile(node.path);
    }
  };

  return (
    <div className="filetree-node-wrapper">
      <div
        className={`filetree-row ${isSelected ? 'is-selected' : ''} ${isDirectory ? 'is-dir' : 'is-file'}`}
        style={{ paddingLeft: `${level * 14 + 10}px` }}
        onClick={handleClick}
      >
        <span className={`filetree-icon ${isDirectory ? 'triangle-icon' : 'dot-icon'}`}>
          {isDirectory ? (isOpen ? '▼' : '▶') : '●'}
        </span>
        <span className="filetree-name">{node.name}</span>
      </div>

      {isDirectory && isOpen && node.children && (
        <div className="filetree-children-list">
          {node.children.map((child, idx) => (
            <TreeNodeItem
              key={child.path || `${child.name}-${idx}`}
              node={child}
              selectedPath={selectedPath}
              onSelectFile={onSelectFile}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ data, selectedPath, onSelectFile }: FileTreeProps) {
  let items: TreeNode[] = [];

  if (Array.isArray(data)) {
    items = data;
  } else if (data && Array.isArray(data.root)) {
    items = data.root;
  } else if (data && typeof data === 'object' && data.name) {
    items = [data];
  }

  if (items.length === 0) {
    items = [
      {
        name: 'src',
        type: 'directory',
        children: [
          { name: 'auth_service.py', type: 'file', path: 'src/auth_service.py' },
          { name: 'legacy_util.py', type: 'file', path: 'src/legacy_util.py' },
          { name: 'heavy_data.py', type: 'file', path: 'src/heavy_data.py' },
        ],
      },
      { name: 'README.md', type: 'file', path: 'README.md' },
    ];
  }

  return (
    <div className="filetree-container">
      {items.map((node, idx) => (
        <TreeNodeItem
          key={node.path || `${node.name}-${idx}`}
          node={node}
          selectedPath={selectedPath}
          onSelectFile={onSelectFile}
          level={0}
        />
      ))}
    </div>
  );
}