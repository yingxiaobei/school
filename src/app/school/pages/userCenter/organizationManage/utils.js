import { isEmpty } from 'lodash';

export function _formatTreeData(...rest) {
  const [treeNode, _handleEdit, _handleAdd, _handleDelete, showOperationBar] = rest;
  if (isEmpty(treeNode)) {
    return;
  }

  for (let node of treeNode) {
    node.key = node.id;
    node.title = (
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <div
          style={{
            maxWidth: 180,
            marginRight: 30,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {node.label}
        </div>
        {showOperationBar && (
          <div>
            <span
              className="mr10"
              onClick={() => {
                _handleEdit(node);
              }}
            >
              编辑
            </span>
            <span className="mr10" onClick={() => _handleAdd(node)}>
              添加子组织
            </span>
            {!node.isSuper && (
              <span className="mr10" onClick={() => _handleDelete(node)}>
                删除
              </span>
            )}
          </div>
        )}
      </div>
    );

    _formatTreeData(node.children, _handleEdit, _handleAdd, _handleDelete, showOperationBar);
  }
}
