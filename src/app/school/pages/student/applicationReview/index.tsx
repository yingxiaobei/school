import { _getStudentList } from 'api';
import { AuthButton, CustomTable, Search } from 'components';
import { useHash, useOptions, useTablePro } from 'hooks';
import { useState } from 'react';
import { _getPageList } from './_api';
import AddOrEdit from './AddOrEdit';
import { ColumnType } from 'antd/lib/table';
import { _handleIdCard } from 'utils';

export type Review = {
  applyUser: string; // 申报人
  applydate: string; // 报名时间
  applyTime: string;
  auditTime: string; //
  auditUser: string; //
  db: string;
  id: string;
  idcard: string; // 身份证号
  name: string; // 学员姓名
  recordStatus: string; // 申报补录状态
  remark: string; // 备注
  schoolid: string; // 学员所在驾校编号
  status: string; // 培训状态
  stuid: string; // 学员编号
  stunum: string; // 统一编码
  traintype: string; // 培训车型
};

export type Middle = {
  applyDateBegin: string;
  applyDateEnd: string;
  limit: string;
  page: string;
  status: string;
  stunum: string;
};

export type Query = Pick<Review, 'idcard' | 'name' | 'schoolid' | 'recordStatus' | 'db'> & Middle;

export default function ApplicationReview() {
  const [isDetail, setIsDetail] = useState(false);
  const {
    search,
    _handleSearch,
    tableProps,
    _refreshTable,
    currentId,
    setCurrentId,
    currentRecord,
    setCurrentRecord,
    isAddOrEditVisible,
    isEdit,
    _handleAdd,
    _handleEdit,
    _handleOk,
    _switchIsAddOrEditVisible,
  } = useTablePro({
    request: _getPageList,
  });

  // @ts-ignore
  const recordAuditHash = useHash('record_audit_status');

  const columns: ColumnType<Review>[] = [
    {
      title: '学员姓名',
      width: 80,
      dataIndex: 'name',
    },
    {
      title: '证件号码',
      dataIndex: 'idcard',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '车型',
      width: 50,
      dataIndex: 'traintype',
    },
    {
      title: '申报时间',
      dataIndex: 'applyTime',
      width: 130,
    },
    {
      title: '报审补录审核状态',
      width: 80,
      ellipsis: false,
      dataIndex: 'recordStatus',
      render(text: string) {
        // @ts-ignore
        return <div>{recordAuditHash[text]}</div>;
      },
    },
    {
      title: '备注',
      width: 80,
      dataIndex: 'remark',
    },
    {
      title: '操作',
      fixed: 'right',
      width: '200px',
      render: (text: string, record) => {
        // console.log(record['recordStatus'] === '0');
        return (
          <div>
            <AuthButton
              insertWhen={record['recordStatus'] != null}
              authId="student/applicationReview:btn1"
              onClick={() => {
                _handleEdit(record, record?.id);
                setIsDetail(true);
              }}
              className="operation-button"
            >
              详情
            </AuthButton>
            {/* 编辑 待审核和审核未通过状态显示该按钮 */}
            <AuthButton
              insertWhen={record['recordStatus'] != null && record['recordStatus'] !== '1'}
              authId="student/applicationReview:btn2"
              onClick={() => {
                _handleEdit(record, record?.id);
                setIsDetail(false);
              }}
              className="operation-button"
            >
              编辑
            </AuthButton>

            {/* (报审补录)新增 待审核和审核未通过状态显示该按钮 */}
            <AuthButton
              insertWhen={
                record['recordStatus'] == null || record['recordStatus'] === '2' || record['recordStatus'] === '0'
              }
              authId="student/applicationReview:btn3"
              onClick={() => {
                _handleAdd();
                setCurrentRecord(record);
                setIsDetail(false);
              }}
              className="operation-button"
            >
              报审补录
            </AuthButton>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Search
        loading={tableProps.isLoading}
        filters={[
          {
            type: 'RangePicker',
            field: ['applyTimeBegin', 'applyTimeEnd'],
            placeholder: ['申报日期起', '申报日期止'],
          },
          {
            type: 'SimpleSelectOfStudent',
            field: 'stuid',
          },
          {
            type: 'MultipleSelect',
            field: 'recordStatus',
            options: [
              // @ts-ignore
              { value: '', label: '报审补录审核状态(全部)' },
              //@ts-ignore
              ...useOptions('record_audit_status'),
            ], // TODO:字典树
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        simpleStudentRequest={_getStudentList}
      />

      {isAddOrEditVisible && (
        <AddOrEdit
          visible={isAddOrEditVisible}
          onCancel={_switchIsAddOrEditVisible}
          currentRecord={currentRecord}
          currentId={currentId}
          isEdit={isEdit}
          isDetail={isDetail}
          handleOk={_handleOk}
          setCurrentId={setCurrentId}
          setCurrentRecord={setCurrentRecord}
        />
      )}

      <CustomTable
        columns={columns}
        {...tableProps}
        rowKey="stuid"
        scroll={{ x: '1200', y: document.body?.clientHeight - 320 }}
      />
    </div>
  );
}
