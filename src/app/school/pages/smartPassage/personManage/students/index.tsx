import React from 'react';
import { useOptions, useTablePro, useVisible, useHash, useConfirm } from 'hooks';
import AddOrEdit from './AddOrEdit';
import { AuthButton, Search, CustomTable } from 'components';
import { _getList, _updatePerson } from '../_api';
import { _get } from 'utils';
const Students = () => {
  const [visible, _switchVisible] = useVisible();

  const { tableProps, search, _refreshTable, _handleSearch, currentRecord, setCurrentRecord } = useTablePro({
    request: _getList,
    extraParams: { personType: '2' }, //personType:人员类型 1：其他人员  2：学员
  });
  const [_showConfirm] = useConfirm();

  const personStatusHash = useHash('person_manage_type');
  const columns = [
    {
      title: '姓名',
      width: 100,
      dataIndex: 'personName',
    },
    {
      title: '身份证号',
      width: 120,
      dataIndex: 'idCard',
    },
    {
      title: '创建时间',
      width: 120,
      dataIndex: 'createTime',
    },
    {
      title: '更新时间',
      width: 120,
      dataIndex: 'updateTime',
    },
    {
      title: '状态',
      width: 60,
      dataIndex: 'personStatus',
      render: (text: any) => personStatusHash[text],
    },
    {
      title: '操作',
      width: 180,
      dataIndex: 'operate',
      render: (_: void, record: any) => {
        return (
          <>
            <AuthButton
              authId="smartPassage/personManage:btn5"
              onClick={() => {
                _switchVisible();
                setCurrentRecord(record);
              }}
              className="operation-button"
            >
              编辑
            </AuthButton>

            <AuthButton
              authId="smartPassage/personManage:btn6"
              onClick={() => {
                _showConfirm({
                  title: '确定要修改这条数据状态吗？',
                  handleOk: async () => {
                    const res: any = await _updatePerson({
                      personType: 2,
                      personStatus: Number(!Number(record.personStatus)),
                      sid: _get(record, 'sid', undefined),
                      id: _get(record, 'id', undefined),
                      personName: record.personName,
                    });
                    res.code === 200 && _refreshTable();
                  },
                });
              }}
              className="operation-button"
            >
              {personStatusHash[Number(!Number(record.personStatus))]}
            </AuthButton>
          </>
        );
      },
    },
  ];

  return (
    <div>
      {visible && (
        <AddOrEdit
          onCancel={_switchVisible}
          onOk={() => {
            _switchVisible();
            _refreshTable();
          }}
          currentRecord={currentRecord as any}
          title="编辑学员"
          visible={visible}
        />
      )}
      <Search
        loading={tableProps.loading}
        filters={[
          { type: 'Input', field: 'personName', placeholder: '姓名' },
          { type: 'Input', field: 'idCard', placeholder: '身份证号' },
          {
            type: 'Select',
            field: 'personStatus',
            options: [{ value: '', label: '状态(全部)' }, ...useOptions('person_manage_type')],
          }, //备案状态
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          _refreshTable();
        }}
      />
      <CustomTable columns={columns} {...tableProps} rowKey="sid" />
    </div>
  );
};
export default Students;
