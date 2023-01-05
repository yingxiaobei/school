// 员工管理
import { useState, useEffect } from 'react';
import { _get } from 'utils';
import { Button, Input } from 'antd';
import { useFetch, usePagination, useForceUpdate, useConfirm, useVisible, useRequest } from 'hooks';
import { _getUserList, _deleteUser, _getTreeByLoginUser } from './_api';
import { PlusOutlined } from '@ant-design/icons';
import Add from './Add';
import Invite from './Invite';
import { AuthButton } from 'components';
import TreeOrg from '../organizationManage/TreeOrg';
import AddOrEditOrg from '../organizationManage/Add';
import BindUser from './BindUser';
import SetReviewer from './SetReviewer';
import { CustomTable } from 'components';
import { _getAuditUser } from './_api.js';
import { _handlePhone } from 'utils';

export default function UserManage() {
  const [isEdit, setIsEdit] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [pagination, setPagination] = usePagination();
  const [visible, _switchVisible] = useVisible();
  const [inviteVisible, _switchInviteVisible] = useVisible();
  const [ignore, forceUpdate] = useForceUpdate();
  const [_showDeleteConfirm] = useConfirm();
  const [name, setName] = useState('');
  const [username, setUserName] = useState('');
  const [treeData, setTreeData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [addOrgVisible, _setAddOrgVisible] = useVisible();
  const [isOrgEdit, setIsOrgEdit] = useState(false);
  const [bindUserVisible, _setBindUserVisible] = useVisible();
  const [reviewVisible, _setReviewVisible] = useVisible();
  const [currentUserName, setCurrentUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initReviewId, setInitReviewId] = useState('');
  const [_showConfirm] = useConfirm();

  useEffect(() => {
    (async () => {
      const res = await _getAuditUser();
      setInitReviewId(_get(res, 'data.id', ''));
    })();
  }, [ignore]);

  const { loading: deleteLoading, run } = useRequest(_deleteUser, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });
  function _handleDelete(record) {
    _showDeleteConfirm({
      handleOk: async () => {
        setCurrentRecord(record);
        run({ id: record.id });
      },
    });
  }

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  function _handleInviteOk() {
    _switchInviteVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  function _handleReviewUserOk() {
    _setReviewVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  function _handleCancel() {
    _switchVisible();
  }

  function _handleEdit(record) {
    const handleEdit = () => {
      setCurrentRecord(record);
      setIsEdit(true);
      _switchVisible();
    };
    if (record.id === initReviewId) {
      _showConfirm({
        title: '编辑可能会影响审核员设置，确定编辑吗？',
        handleOk: handleEdit,
      });
      return;
    }
    handleEdit();
  }

  function _handleAdd() {
    setIsEdit(false);
    setCurrentRecord(null);
    _switchVisible();
  }

  function _changeName(e) {
    setName(e.target.value);
    setPagination({ ...pagination, current: 1 });
  }

  function _changeUserName(e) {
    setUserName(e.target.value);
    setPagination({ ...pagination, current: 1 });
  }

  function _handleAddOrgOk() {
    _setAddOrgVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }
  function _handleBindUserOk() {
    _setBindUserVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }
  const { data, isLoading } = useFetch({
    request: _getUserList,
    query: {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      name,
      username,
      orgId: selectedId,
    },
    depends: [selectedId, ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 1) });
      setLoading(false);
    },
  });

  useFetch({ request: _getTreeByLoginUser });

  const dataSource = _get(data, 'rows', []);
  const columns = [
    {
      title: '用户名',
      width: 50,
      dataIndex: 'username',
    },
    {
      title: '姓名',
      width: 50,
      dataIndex: 'name',
    },
    {
      title: '手机号',
      width: 100,
      dataIndex: 'mobilePhone',
      render: (value) => _handlePhone(value),
    },
    {
      title: '信用分',
      width: 60,
      dataIndex: 'xyf',
      render: (xyf) => {
        return xyf || '100';
      },
    },
    {
      title: '操作',
      width: 100,
      dataIndex: 'operate',
      render: (_, record) => (
        <div>
          <AuthButton
            authId="userCenter/userManage:btn3"
            className="operation-button"
            onClick={() => _handleEdit(record)}
            style={{ marginRight: 8, marginBottom: 4, fontSize: 12 }}
            type="primary"
            ghost
            size="small"
          >
            编辑
          </AuthButton>
          <AuthButton
            loading={_get(currentRecord, 'id') === _get(record, 'id') && deleteLoading}
            authId="userCenter/userManage:btn4"
            className="operation-button"
            onClick={() => _handleDelete(record)}
            style={{ marginRight: 8, marginBottom: 4, fontSize: 12 }}
            type="primary"
            ghost
            size="small"
          >
            删除
          </AuthButton>
        </div>
      ),
    },
  ];

  return (
    <>
      {visible && (
        <Add
          currentRecord={currentRecord}
          onCancel={_handleCancel}
          onOk={_handleOk}
          visible={visible}
          isEdit={isEdit}
          title={isEdit ? '编辑用户信息' : '新增用户信息'}
          _setBindUserVisible={_setBindUserVisible}
          setCurrentUserName={setCurrentUserName}
        />
      )}

      {inviteVisible && (
        <Invite
          currentRecord={currentRecord}
          onCancel={_switchInviteVisible}
          onOk={_handleInviteOk}
          title={'添加其他企业用户'}
        />
      )}
      {addOrgVisible && (
        <AddOrEditOrg
          currentRecord={currentRecord}
          selectedId={selectedId}
          onCancel={_setAddOrgVisible}
          onOk={_handleAddOrgOk}
          visible={addOrgVisible}
          isEdit={isOrgEdit}
          title={isOrgEdit ? '编辑' : '新增子组织'}
        />
      )}
      {bindUserVisible && (
        <BindUser
          onOk={_handleBindUserOk}
          visible={bindUserVisible}
          onCancel={_setBindUserVisible}
          currentUserName={currentUserName}
        />
      )}

      {reviewVisible && (
        <SetReviewer onOk={_handleReviewUserOk} onCancel={_setReviewVisible} initReviewId={initReviewId} />
      )}

      <div style={{ display: 'flex' }}>
        <div style={{ width: 300, minWidth: 300, marginRight: 10 }}>
          <TreeOrg
            onSelect={(selected) => {
              _get(selected, '0') && setSelectedId(_get(selected, '0'));
            }}
            treeData={treeData}
            currentRecord={currentRecord}
            setCurrentRecord={setCurrentRecord}
            setSelectedId={setSelectedId}
            setTreeData={setTreeData}
            setIsEdit={setIsOrgEdit}
            _switchVisible={_setAddOrgVisible}
            ignore={ignore}
            forceUpdate={forceUpdate}
          />
        </div>
        <div style={{ width: 'calc(100% - 310px)' }}>
          <div>
            <Input
              onChange={_changeUserName}
              value={username}
              placeholder="用户名"
              style={{ margin: '0 20px 20px 0' }}
            />
            <Input onChange={_changeName} value={name} placeholder="姓名" style={{ margin: '0 20px 20px 0' }} />
            <Button
              type="primary"
              loading={loading && isLoading}
              onClick={() => {
                setLoading(true);
                forceUpdate();
                setPagination({ ...pagination, total: _get(data, 'total', 1) });
              }}
            >
              查询
            </Button>
          </div>
          <div style={{ display: 'flex' }}>
            <AuthButton
              authId="userCenter/userManage:btn1"
              className="mb20"
              type="primary"
              icon={<PlusOutlined />}
              onClick={_handleAdd}
            >
              新增用户
            </AuthButton>
            <AuthButton
              authId="userCenter/userManage:btn5"
              className="mb20 ml10"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                _setBindUserVisible();
                setCurrentUserName();
              }}
            >
              关联已有用户
            </AuthButton>
            <AuthButton
              authId="userCenter/userManage:btn6"
              className="mb20 ml10"
              type="primary"
              onClick={_setReviewVisible}
            >
              审核员设置
            </AuthButton>
          </div>
          <CustomTable
            columns={columns}
            bordered
            dataSource={dataSource}
            loading={isLoading}
            rowKey="id"
            scroll={{ y: document.body.clientHeight - 360 }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              ...pagination,
              onShowSizeChange: (_, pageSize) => {
                setPagination({ ...pagination, current: 1, pageSize });
              },
              onChange: (page) => {
                setPagination((pagination) => ({ ...pagination, current: page }));
              },
            }}
          />
        </div>
      </div>
    </>
  );
}
