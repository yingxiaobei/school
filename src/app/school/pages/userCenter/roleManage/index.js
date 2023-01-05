// 角色管理
import { useState } from 'react';
import { _get, downloadFile, Auth } from 'utils';
import { Button, Input, message, Modal } from 'antd';
import { useFetch, usePagination, useForceUpdate, useConfirm, useVisible, useRequest } from 'hooks';
import { _getRoleList, _deleteRole, _exportRole, _exportRoleBefore } from './_api';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Add from './Add';
import User from './User';
import BindUser from './BindUser';
import AllocateResources from './AllocateResources';
import { AuthButton, ImportFile } from 'components';
import TreeOrg from '../organizationManage/TreeOrg';
import LinkUser from '../organizationManage/LinkUser';
import AddOrEditOrg from '../organizationManage/Add';
import { CustomTable } from 'components';

export default function RoleManage() {
  const [isEdit, setIsEdit] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [pagination, setPagination] = usePagination();
  const [visible, _switchVisible] = useVisible();
  const [userVisible, _switchUserVisible] = useVisible();
  const [bindUserVisible, _switchBindUserVisible] = useVisible();
  const [allocateResourcesVisible, _switchAllocateResourceVisible] = useVisible();
  const [ignore, forceUpdate] = useForceUpdate();
  const [ignore2, forceUpdateTable] = useForceUpdate();
  const [_showDeleteConfirm] = useConfirm();
  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState(null);
  const [treeData, setTreeData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [linkUserVisible, _switchLinkUserVisible] = useVisible();
  const [addOrgVisible, _setAddOrgVisible] = useVisible();
  const [isOrgEdit, setIsOrgEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadVisible, _setUploadVisible] = useVisible(); // 导入权限
  const [exportId, setExportId] = useState(null); //导入id

  const { loading: deleteLoading, run } = useRequest(_deleteRole, {
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

  function _handleQueryUser(id) {
    setRoleId(id);
    _switchUserVisible();
  }

  function _handleBindUser(id) {
    setRoleId(id);
    _switchBindUserVisible();
  }

  function _handleAllocateResources(id) {
    setRoleId(id);
    _switchAllocateResourceVisible();
  }

  function _handleEdit(record) {
    setCurrentRecord(record);
    setIsEdit(true);
    _switchVisible();
  }

  function _handleAdd() {
    setIsEdit(false);
    setCurrentRecord(null);
    _switchVisible();
  }
  function _handleLinkUserOk() {
    _switchLinkUserVisible();
    forceUpdateTable();
    setPagination({ ...pagination, current: 1 });
  }
  function _changeName(e) {
    setName(e.target.value);
    setPagination({ ...pagination, current: 1 });
  }
  function _handleAddOrgOk() {
    _setAddOrgVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  const { data, isLoading } = useFetch({
    request: _getRoleList,
    query: {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      name,
      orgId: selectedId,
    },
    depends: [selectedId, ignore, pagination.current, pagination.pageSize, ignore2],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 1) });
      setLoading(false);
    },
  });

  const dataSource = _get(data, 'rows', []);
  const columns = [
    {
      title: '名称',
      width: 50,
      dataIndex: 'name',
    },
    {
      title: '描述',
      width: 70,
      dataIndex: 'description',
    },
    {
      title: '操作',
      width: 220,
      dataIndex: 'operate',
      render: (_, record) => (
        <div>
          {!_get(record, 'isSuper', false) && (
            <AuthButton //超管不可以分配资源、编辑、删除
              authId="userCenter/roleManage:btn2"
              className="operation-button"
              type="primary"
              ghost
              style={{ marginRight: 8, marginBottom: 4, fontSize: 12 }}
              size="small"
              onClick={() => _handleAllocateResources(_get(record, 'id'))}
            >
              权限设置
            </AuthButton>
          )}

          <AuthButton
            authId="userCenter/roleManage:btn3"
            className="operation-button"
            type="primary"
            ghost
            style={{ marginRight: 8, marginBottom: 4, fontSize: 12 }}
            size="small"
            onClick={() => _handleBindUser(_get(record, 'id'))}
          >
            关联用户
          </AuthButton>
          <AuthButton
            authId="userCenter/roleManage:btn4"
            className="operation-button"
            type="primary"
            ghost
            style={{ marginRight: 8, marginBottom: 4, fontSize: 12 }}
            size="small"
            onClick={() => _handleQueryUser(_get(record, 'id'))}
          >
            查看用户
          </AuthButton>
          {!_get(record, 'isSuper', false) && ( //超管不可以分配资源、编辑、删除
            <AuthButton
              authId="userCenter/roleManage:btn5"
              className="operation-button"
              type="primary"
              ghost
              style={{ marginRight: 8, marginBottom: 4, fontSize: 12 }}
              size="small"
              onClick={() => _handleEdit(record)}
            >
              编辑
            </AuthButton>
          )}
          {!_get(record, 'isSuper', false) && ( //超管不可以分配资源、编辑、删除
            <AuthButton
              loading={_get(currentRecord, 'id') === _get(record, 'id') && deleteLoading}
              authId="userCenter/roleManage:btn6"
              className="operation-button"
              type="primary"
              ghost
              style={{ marginRight: 8, marginBottom: 4, fontSize: 12 }}
              size="small"
              onClick={() => _handleDelete(record)}
            >
              删除
            </AuthButton>
          )}
          <AuthButton
            authId="userCenter/roleManage:btn7"
            type="primary"
            className="operation-button"
            ghost
            insertWhen={record.code !== 'r00'} //超级管理员不能导入导出
            style={{ marginRight: 8, marginBottom: 4, fontSize: 12 }}
            size="small"
            onClick={async () => {
              const resp = await _exportRoleBefore({ id: record.id });
              if (resp.code === 200) {
                _exportRole({ id: record.id }).then((res) => {
                  downloadFile(res, Auth.get('schoolName') + '_' + record.name, 'text/plain', 'txt');
                });
              } else {
                message.error(resp.message);
              }
            }}
          >
            导出权限
          </AuthButton>
          <AuthButton
            authId="userCenter/roleManage:btn8"
            type="primary"
            className="operation-button"
            insertWhen={record.code !== 'r00'} //超级管理员不能导入导出
            ghost
            style={{ marginRight: 8, marginBottom: 4, fontSize: 12 }}
            size="small"
            onClick={() => {
              Modal.confirm({
                content: '',
                icon: <ExclamationCircleOutlined />,
                title: '若驾校已分配过权限，导入会清空原有权限，请确认是否需要为该角色导入当前权限？',
                okText: '确认',
                cancelText: '取消',
                onOk: () => {
                  _setUploadVisible();
                  setExportId(record.id);
                },
              });
            }}
          >
            导入权限
          </AuthButton>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* 上传合同 */}
      {uploadVisible && (
        <ImportFile
          onCancel={_setUploadVisible}
          fileUrl={`/api/usercenter/role/${exportId}/importRole`}
          accept="text/plain"
          typeLimit={'txt'}
          callback={_setUploadVisible}
        />
      )}
      {visible && (
        <Add
          currentRecord={currentRecord}
          onCancel={_switchVisible}
          onOk={_handleOk}
          isEdit={isEdit}
          title={isEdit ? '编辑角色信息' : '新增角色信息'}
        />
      )}

      {allocateResourcesVisible && (
        <AllocateResources id={roleId} title="配置权限" onCancel={_switchAllocateResourceVisible} />
      )}

      {userVisible && <User onCancel={_switchUserVisible} id={roleId} title="查看用户" />}

      {bindUserVisible && <BindUser onCancel={_switchBindUserVisible} id={roleId} title="关联用户" />}
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
          <AuthButton
            authId="userCenter/roleManage:btn1"
            className="mb20"
            type="primary"
            icon={<PlusOutlined />}
            onClick={_handleAdd}
          >
            新增
          </AuthButton>
          <div>
            <Input onChange={_changeName} value={name} placeholder="角色名称" style={{ margin: '0 20px 20px 0' }} />
            <Button
              type="primary"
              loading={loading && isLoading}
              onClick={() => {
                forceUpdate();
                setPagination({ ...pagination, total: _get(data, 'total', 1) });
                setLoading(true);
              }}
            >
              查询
            </Button>
          </div>

          <CustomTable
            columns={columns}
            bordered
            dataSource={dataSource}
            loading={isLoading}
            rowKey="id"
            scroll={{ y: document.body.clientHeight - 360, x: 900 }}
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
