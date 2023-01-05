import { useState } from 'react';
import { _get } from 'utils';
import { usePagination, useForceUpdate, useVisible } from 'hooks';
import AddOrEditOrg from './Add';
import LinkUser from './LinkUser';
import TreeOrg from './TreeOrg';

export default function OrganizationManage(props) {
  const [isEdit, setIsEdit] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [visible, _switchVisible] = useVisible();
  const [linkUserVisible, _switchLinkUserVisible] = useVisible();
  const [ignore, forceUpdate] = useForceUpdate();
  const [ignore2, forceUpdateTable] = useForceUpdate();
  const [pagination, setPagination] = usePagination();
  const [treeData, setTreeData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  function _handleLinkUserOk() {
    _switchLinkUserVisible();
    forceUpdateTable();
    setPagination({ ...pagination, current: 1 });
  }

  return (
    <>
      {visible && (
        <AddOrEditOrg
          currentRecord={currentRecord}
          selectedId={selectedId}
          onCancel={_switchVisible}
          onOk={_handleOk}
          visible={visible}
          isEdit={isEdit}
          title={isEdit ? '编辑' : '新增子组织'}
        />
      )}

      {linkUserVisible && (
        <LinkUser
          currentRecord={currentRecord}
          onCancel={_switchLinkUserVisible}
          onOk={_handleLinkUserOk}
          visible={visible}
          isEdit={isEdit}
          title="关联用户"
        />
      )}

      <div style={{ width: 'calc(100% - 470px)' }}>
        <div style={{ width: 460, minWidth: 460, marginRight: 10 }}>
          <TreeOrg
            showOperationBar
            onSelect={(selected) => {
              setSelectedId(_get(selected, '0'));
            }}
            treeData={treeData}
            currentRecord={currentRecord}
            setCurrentRecord={setCurrentRecord}
            setSelectedId={setSelectedId}
            selectedId={selectedId}
            setTreeData={setTreeData}
            setIsEdit={setIsEdit}
            _switchVisible={_switchVisible}
            ignore={ignore}
            forceUpdate={forceUpdate}
          />
        </div>
      </div>
    </>
  );
}
