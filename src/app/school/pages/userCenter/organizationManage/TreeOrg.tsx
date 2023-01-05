import { useState } from 'react';
import { _get } from 'utils';
import { Tree, Input } from 'antd';
import { useFetch, useConfirm } from 'hooks';

import { _getOrganizationTree, _deleteOrganization } from './_api';
import { Loading } from 'components';
const dataList: any = [];

export default function TreeOrg(props: any) {
  const {
    onSelect,
    currentRecord,
    setCurrentRecord,
    setSelectedId,
    setIsEdit,
    _switchVisible,
    ignore,
    forceUpdate,
    showOperationBar,
  } = props;

  const [_showDeleteConfirm] = useConfirm();
  const [expandedKeys, setExpandedKeys] = useState([]);

  const [autoExpandParent, setAutoExpandParent] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  function _handleEdit(record: any) {
    setCurrentRecord({ ...currentRecord, ...record });
    setIsEdit(true);
    _switchVisible();
  }

  function _handleAdd(record: any) {
    setIsEdit(false);
    setCurrentRecord({ parentId: record.id });
    setSelectedId(record.id);
    _switchVisible();
  }

  function _handleDelete(record: any) {
    _showDeleteConfirm({
      handleOk: async () => {
        const res = await _deleteOrganization({ id: record.id });
        if (_get(res, 'code') === 200) {
          forceUpdate();
        }
      },
    });
  }

  const { data: dataTree = [], isLoading } = useFetch({
    request: _getOrganizationTree,
    depends: [ignore],
    callback: (data) => {
      setCurrentRecord(_get(data, '0'));
      setSelectedId(_get(data, '0.id'));
      generateList(data);
    },
  });

  const generateList = (data: any) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      dataList.push({ key: node.id, label: node.label });
      if (node.children) {
        generateList(node.children);
      }
    }
  };

  const onExpand = (expandedKeys: any) => {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };
  const onChange = (e: any) => {
    const { value } = e.target;
    const expandedKeys = dataList
      .map((item: any) => {
        if (_get(item, 'label', '').indexOf(value) > -1) {
          return getParentKey(item.key, dataTree);
        }
        return null;
      })
      .filter((item: any, i: any, self: any) => item && self.indexOf(item) === i);
    setSearchValue(value);
    setAutoExpandParent(true);
    setExpandedKeys(expandedKeys);
  };

  const getParentKey = (key: any, tree: any): any => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some((item: any) => item.id === key)) {
          parentKey = node.id;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };
  const loop = (data: any) =>
    data.map((item: any) => {
      const index = item.label.indexOf(searchValue);
      const beforeStr = item.label.substr(0, index);
      const afterStr = item.label.substr(index + searchValue.length);
      const title = (
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
            {index > -1 && searchValue ? (
              <span title={beforeStr + searchValue + afterStr}>
                {beforeStr}
                <span style={{ color: '#F3302B' }}>{searchValue}</span>
                {afterStr}
              </span>
            ) : (
              <span title={item.label}>{item.label}</span>
            )}
          </div>
          {showOperationBar && (
            <div>
              <span
                className="mr10"
                onClick={() => {
                  _handleEdit(item);
                }}
              >
                编辑
              </span>
              <span className="mr10" onClick={() => _handleAdd(item)}>
                添加子组织
              </span>
              {!item.isSuper && item.parentId !== '-1' && (
                <span className="mr10" onClick={() => _handleDelete(item)}>
                  删除
                </span>
              )}
            </div>
          )}
        </div>
      );

      if (item.children) {
        return { title, key: item.id, children: loop(item.children) };
      }

      return {
        title,
        key: item.id,
      };
    });

  return (
    <>
      <>
        {<Input style={{ marginBottom: 8, width: '80%' }} placeholder="请输入关键字" onChange={onChange} />}
        {isLoading && <Loading />}
        {!isLoading && (
          <Tree
            onSelect={onSelect}
            onExpand={onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            treeData={loop(dataTree)}
            defaultExpandAll={true}
          />
        )}
      </>
    </>
  );
}
