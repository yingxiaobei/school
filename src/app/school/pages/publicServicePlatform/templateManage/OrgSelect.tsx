import { useState } from 'react';
import { TreeSelect } from 'antd';
import { isEmpty } from 'lodash';
import { _getTreeData } from './_api';
import { useFetch } from 'hooks';

export default function OrgSelect(props: any) {
  const { callbackFun, onChange, value } = props;

  const [treeData, setTreeData] = useState([]);
  function _formatTreeData(treeNode: any) {
    if (isEmpty(treeNode)) {
      return [];
    }

    for (let node of treeNode) {
      node.key = node.id;
      node.title = node.name;
      node.value = node.id;

      _formatTreeData(node.children);
    }
  }

  useFetch({
    request: _getTreeData,
    callback: (data: []) => {
      const treeData = [...data];
      _formatTreeData(treeData);
      setTreeData(treeData);
      callbackFun(treeData);
    },
  });

  return (
    <TreeSelect
      showSearch
      treeData={treeData}
      onChange={onChange}
      treeNodeFilterProp={'name'}
      // treeCheckable={true}
      // treeCheckStrictly={true}
      placeholder="请选择上级栏目"
      value={value}
      allowClear
      treeDefaultExpandAll
      labelInValue
    />
  );
}
