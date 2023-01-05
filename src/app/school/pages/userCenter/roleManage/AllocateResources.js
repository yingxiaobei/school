// 配置权限

import { useState } from 'react';
import { isEmpty } from 'lodash';
import { useFetch } from 'hooks';
import { _get } from 'utils';
import { Modal, Tree, Select, Tooltip } from 'antd';
import { _getMenuTree, _getMenuElements, _getRoleResource, _putRoleResource } from './_api';
import { CustomTable } from 'components';

export default function AllocateResources(props) {
  const { title, onCancel, id } = props;
  const [selectedElementIds, setSelectedElementIds] = useState([]);
  const [selectedMenuIds, setSelectedMenuIds] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [category, setCategory] = useState('ERP');

  useFetch({
    request: _getRoleResource,
    query: { id, category },
    callback: (data) => {
      setSelectedElementIds(_get(data, 'elementIds', []));
      setSelectedMenuIds(_get(data, 'menuIds', []));
    },
    depends: [category],
  });

  useFetch({
    request: _getMenuTree,
    query: { category },
    callback: (data) => {
      setSelectedId(_get(data, '0.id'));
      const treeData = [...data];
      _formatTreeData(treeData);
      setTreeData(treeData);
    },
    depends: [category],
  });

  const { data: menuElementsData, isLoading } = useFetch({
    request: _getMenuElements,
    query: { id: selectedId },
    requiredFields: ['id'],
    depends: [selectedId],
  });

  function _formatTreeData(treeNode) {
    if (isEmpty(treeNode)) {
      return;
    }

    for (let node of treeNode) {
      node.key = node.id;
      // node.title = node.title;

      _formatTreeData(node.children);
    }
  }

  const dataSource = menuElementsData;

  const rowSelection = {
    selectedRowKeys: selectedElementIds,
    onSelect: (record, selected, selectedRows) => {
      // record当前操作的 ,selected 选中状态, selectedRows剩余选中的行
      if (selected) {
        setSelectedElementIds([...selectedElementIds, _get(record, 'id', '')]);
      } else {
        setSelectedElementIds(selectedElementIds.filter((item) => String(item) !== String(_get(record, 'id', ''))));
      }
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      // selected 选中状态, changeRows 操作的行（可能是删除的行）
      if (selected) {
        setSelectedElementIds([...selectedElementIds, ...changeRows.map((item) => _get(item, 'id', ''))]);
      } else {
        let filterArr = selectedElementIds.filter((item) => {
          return !changeRows.map((item) => _get(item, 'id', '')).includes(item);
        });
        setSelectedElementIds(filterArr);
      }
    },
  };

  function _onCheck({ checked }, item) {
    if (String(_get(item, 'node.parentId', '')) === '-1' && _get(item, 'checked', '') === false) {
      //取消勾选了父节点，立即取消勾选子节点
      let arr = _get(item, 'checkedNodes', [])
        .filter((i) => {
          return i.parentId !== _get(item, 'node.key', '');
        })
        .map((i) => i.key);
      return setSelectedMenuIds(arr);
    }
    if (!checked.includes(_get(item, 'node.parentId', ''))) {
      //分配资源的时候，勾选 子节点，自动勾选 上级节点
      return setSelectedMenuIds([...checked, _get(item, 'node.parentId', '')]);
    }
    return setSelectedMenuIds(checked);
  }

  async function _handleConfirm() {
    setConfirmLoading(true);
    const res = await _putRoleResource({
      id,
      menuIds: selectedMenuIds,
      elementIds: selectedElementIds,
      category,
    });

    if (_get(res, 'code') === 200) {
      // onCancel(); 建议操作完不要关闭窗口，继续其他操作
    }
    setConfirmLoading(false);
  }

  const columns = [
    {
      title: '资源名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '功能说明',
      dataIndex: 'description',
      width: 200,
    },
  ];

  return (
    <Modal
      width={800}
      bodyStyle={{ height: 650, overflow: 'auto' }}
      title={title}
      confirmLoading={confirmLoading}
      visible
      onCancel={onCancel}
      onOk={_handleConfirm}
    >
      <Select
        value={category}
        onChange={(value) => setCategory(value)}
        className="w200 mb20"
        options={[
          { value: 'ERP', label: '驾校ERP' },
          { value: 'EXAMTOOL', label: '考试工具' },
          { value: 'APPSCH', label: '远方驾服APP' },
        ]}
      />
      <div style={{ display: 'flex' }}>
        <div style={{ width: 280, minWidth: 280, marginRight: 10, height: 600, overflow: 'auto' }}>
          <Tree
            checkable
            checkStrictly
            checkedKeys={selectedMenuIds}
            onCheck={_onCheck}
            onSelect={(selected) => {
              _get(selected, '0') && setSelectedId(_get(selected, '0'));
            }}
            treeData={treeData}
            titleRender={(nodeData) => (
              <Tooltip placement="top" title={nodeData.description || ''}>
                {nodeData.title}
              </Tooltip>
            )}
          />
        </div>

        <div style={{ flex: 1 }}>
          <CustomTable
            pagination={false}
            loading={isLoading}
            rowSelection={rowSelection}
            style={{ width: '100%' }}
            columns={columns}
            bordered
            dataSource={dataSource}
            rowKey={(record) => record.id}
          />
        </div>
      </div>
    </Modal>
  );
}
