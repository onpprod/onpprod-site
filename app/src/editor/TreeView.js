const TreeView = ({ treeData, expandedIds, selectedId, onSelect, onToggle }) => {
  const renderNode = (node, depth = 0) => {
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedId === node.id;

    return (
      <li key={node.id} className="tree-item">
        <div
          className={`tree-row${isSelected ? ' selected' : ''}`}
          role="treeitem"
          aria-selected={isSelected}
          aria-expanded={hasChildren ? isExpanded : undefined}
          tabIndex={0}
          style={{ paddingLeft: `${12 + depth * 18}px` }}
          onClick={() => onSelect(node.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onSelect(node.id);
            }
          }}
        >
          <button
            className={`tree-caret${hasChildren ? '' : ' empty'}`}
            type="button"
            aria-label={hasChildren ? 'Toggle children' : 'Leaf node'}
            onClick={(event) => {
              event.stopPropagation();
              if (hasChildren) {
                onToggle(node.id);
              }
            }}
          >
            {hasChildren ? (isExpanded ? '▾' : '▸') : '·'}
          </button>
          {node.tag ? <span className="tree-tag">{node.tag}</span> : null}
          <span className="tree-label">{node.label}</span>
        </div>
        {hasChildren && isExpanded ? (
          <ul role="group" className="tree-group">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </ul>
        ) : null}
      </li>
    );
  };

  return <ul className="tree-list">{treeData.map((node) => renderNode(node))}</ul>;
};

export default TreeView;
