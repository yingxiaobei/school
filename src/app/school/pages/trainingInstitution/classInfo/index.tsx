// 班级信息管理
import { useState } from 'react';
import { _get } from 'utils';
import { message, Switch } from 'antd';
import { useOptions, useRequest, useHash, useConfirm, useTablePro, useVisible } from 'hooks';
import {
  _getClassList,
  _updateStatusCD,
  _deleteClass,
  _registerClass,
  _createAllClassByOneButton,
  DataType,
} from './_api';
import { Search, AuthButton, CustomTable, ButtonContainer } from 'components';
import AddOrEdit from './AddOrEdit';
import DefaultWallet from './DefaultWallet';
import { ColumnsType } from 'antd/lib/table';

export default function ClassInfo() {
  const [_showConfirm] = useConfirm();
  const registerHash = useHash('stu_record_status_type');
  const studentTypeHash = useHash('student_type');
  const studentTypeOptions = useOptions('student_type');

  const [defaultWalletVisible, setDefaultWalletVisible] = useVisible();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<DataType[]>([]);

  const {
    isEdit,
    search,
    currentId,
    tableProps,
    currentRecord,
    isAddOrEditVisible,
    _refreshTable,
    _handleAdd,
    _handleEdit,
    _handleOk,
    _handleSearch,
    setCurrentRecord,
    _switchIsAddOrEditVisible,
  } = useTablePro({
    request: _getClassList,
    cb() {
      setSelectedRowKeys([]);
      setSelectedRows([]);
    },
  });

  const { loading, run } = useRequest(_updateStatusCD, {
    onSuccess: () => {
      _refreshTable();
    },
  });

  // 注销
  const { loading: deleteLoading, run: deleteRun } = useRequest(_deleteClass, {
    onSuccess: () => {
      _refreshTable();
    },
  });

  // 备案
  const { loading: recordLoading, run: recordRun } = useRequest(_registerClass, {
    onSuccess: () => {
      _refreshTable();
    },
  });

  // 班级初始化
  const { loading: classLoading, run: classRun } = useRequest(_createAllClassByOneButton, {
    onSuccess: () => {
      _refreshTable();
    },
  });

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys: string[], selectedRows: DataType[]) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record: DataType) => ({
      disabled: record.train_price_online === 0, // Column configuration not to be checked
    }),
  };

  function setDefaultWallet() {
    if (!selectedRowKeys.length) {
      return message.error('请选择至少一个班级');
    }
    setDefaultWalletVisible();
  }

  const columns: ColumnsType<DataType> = [
    {
      title: '班级名称',
      dataIndex: 'packlabel',
      width: 200,
    },
    {
      title: '培训车型',
      dataIndex: 'traintype',
      width: 70,
    },
    {
      title: '班级分类',
      dataIndex: 'studenttype',
      width: 80,
      render: (studenttype: any) => studentTypeHash[studenttype],
    },
    {
      title: '班费',
      dataIndex: 'train_price',
      width: 70,
    },
    {
      title: '在线缴费金额',
      dataIndex: 'train_price_online',
      width: 90,
    },
    {
      title: '默认收款钱包',
      dataIndex: 'bankChannelName', // 驼峰还是 下划线分割
      width: 100,
    },
    {
      title: '备注',
      dataIndex: 'note',
      width: 80,
    },
    {
      // 1: 未启用；2: 启用；
      title: '启用状态',
      dataIndex: 'status_cd',
      width: 80,
      render: (status_cd: string, record) => (
        <Switch
          loading={_get(currentRecord, 'packid') === _get(record, 'packid') && loading}
          checked={status_cd === '2'}
          onChange={(checked) => {
            // TODO: bankChannelId 默认钱包
            if (_get(record, 'train_price_online', 0) > 0 && checked && !_get(record, 'bankChannelId', '')) {
              return message.error('请先设置默认收款钱包');
            }
            setCurrentRecord(record);
            run({ packid: _get(record, 'packid'), status_cd: checked ? '2' : '1' });
          }}
        />
      ),
    },
    {
      title: '备案状态',
      width: 80,
      dataIndex: 'registered_flag',
      render: (registered_flag: any) => registerHash[registered_flag],
    },
    {
      title: '操作',
      width: 170,
      dataIndex: 'operate',
      render: (_: void, record) => {
        return (
          <>
            <AuthButton
              authId="trainingInstitution/classInfo:btn3"
              className="operation-button"
              onClick={() => {
                _handleEdit(record, _get(record, 'packid'));
              }}
            >
              编辑
            </AuthButton>
            <AuthButton
              loading={_get(currentRecord, 'packid') === _get(record, 'packid') && deleteLoading}
              authId="trainingInstitution/classInfo:btn2"
              onClick={() =>
                _showConfirm({
                  title: '确定要注销这条数据吗',
                  handleOk: async () => {
                    setCurrentRecord(record);
                    deleteRun({ id: _get(record, 'packid') });
                  },
                })
              }
              className="operation-button"
            >
              注销
            </AuthButton>
            <AuthButton
              insertWhen={_get(record, 'registered_flag') !== '1'}
              loading={_get(currentRecord, 'packid') === _get(record, 'packid') && recordLoading}
              authId="trainingInstitution/classInfo:btn4"
              className="operation-button"
              onClick={() => {
                recordRun({ id: _get(record, 'packid') });
              }}
            >
              备案
            </AuthButton>
          </>
        );
      },
    },
  ];

  return (
    <>
      {isAddOrEditVisible && (
        <AddOrEdit
          onCancel={_switchIsAddOrEditVisible}
          onOk={_handleOk}
          currentId={currentId}
          isEdit={isEdit}
          title={isEdit ? '编辑班级信息' : '新增班级信息'}
        />
      )}

      {defaultWalletVisible && (
        <DefaultWallet
          selectedRowKeys={selectedRowKeys}
          setDefaultWalletVisible={setDefaultWalletVisible}
          _handleOk={_refreshTable}
        />
      )}

      <Search
        loading={tableProps.loading || classLoading}
        filters={[
          { type: 'Input', field: 'packlabel', placeholder: '班级名称' },
          {
            type: 'Select',
            field: 'traintype',
            options: [
              { value: '', label: '培训车型(全部)' },
              ...useOptions('business_scope', false, '-1', [], {
                forceUpdate: true,
              }),
            ],
          },
          {
            type: 'Select',
            field: 'studenttype',
            options: [{ value: '', label: '班级分类(全部)' }, ...studentTypeOptions],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        showSearchButton={false}
      />
      <ButtonContainer
        showSearchButton={true}
        refreshTable={_refreshTable}
        loading={tableProps.loading || classLoading}
      >
        <AuthButton authId="trainingInstitution/classInfo:btn1" type="primary" onClick={_handleAdd} className="mb20">
          新增
        </AuthButton>
        <AuthButton authId="trainingInstitution/classInfo:btn5" type="primary" onClick={classRun} className="mb20 ml20">
          班级初始化
        </AuthButton>
        <AuthButton
          className="mb20 ml20"
          authId="trainingInstitution/classInfo:btn6"
          type="primary"
          onClick={setDefaultWallet}
        >
          默认收款钱包
        </AuthButton>
      </ButtonContainer>
      <CustomTable
        {...tableProps}
        columns={columns}
        rowKey={(record: any) => _get(record, 'packid')}
        rowSelection={{
          type: 'Checkbox',
          ...rowSelection,
        }}
      />
    </>
  );
}
