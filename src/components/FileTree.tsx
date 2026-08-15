import { useState } from 'react';
import type { TreeNode } from '../api/types';
import './FileTree.css';

interface FileTreeProps {
  data: TreeNode[];
  selectedPath: string;
  onSelectFile: (path: string) => void;
}

interface TreeNodeItemProps {
  node: TreeNode;
  selectedPath: string;
  onSelectFile: (path: string) => void;
}

function TreeNodeItem({ node, selectedPath, onSelectFile }: TreeNodeItemProps) {
  const [isOpen, setIsOpen] = useState(true);

  const isDir = node.type === 'dir';
  const isSelected = !isDir && node.path === selectedPath;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDir) {
      setIsOpen((prev) => !prev);
    } else {
      if (node.path) {
        onSelectFile(node.path);
      }
    }
  };

  return (
    <div className="tree-node-wrapper">
      <div
        className={`tree-node-item ${isSelected ? 'selected' : ''}`}
        onClick={handleClick}
      >
        <span className="tree-node-icon">
          {isDir ? (isOpen ? '▼' : '▶') : '•'}
        </span>
        <span className="tree-node-name">{node.name}</span>
      </div>

      {isDir && isOpen && node.children && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.path}
              node={child}
              selectedPath={selectedPath}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ data, selectedPath, onSelectFile }: FileTreeProps) {
  if (!data) return null;

  const treeArray = Array.isArray(data) 
    ? data 
    : (data as any).children || (data as any).tree || [];

  return (
    <div className="file-tree-container">
      {treeArray.map((node: TreeNode) => (
        <TreeNodeItem
          key={node.path}
          node={node}
          selectedPath={selectedPath}
          onSelectFile={onSelectFile}
        />
      ))}
    </div>
  );
}