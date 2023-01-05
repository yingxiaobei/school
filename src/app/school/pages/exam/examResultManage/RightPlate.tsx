import React, { useState } from 'react';
import { AuthButton, CustomTable } from 'components';
import { _getExamList, _exportExam } from './_api';
import { downloadFile, _get, _handleIdCard } from 'utils';
import { useTablePro, useVisible } from 'hooks';
import { DownloadOutlined } from '@ant-design/icons';
import AddOrEdit from '../examList/AddOrEdit';
import * as AddRecord from '../examResult/AddOrEdit';
import { useEffect } from 'react';

const RightPlate = (props: any) => {
  const { query } = props;
  const { tableProps, _refreshTable, _switchIsAddOrEditVisible, isAddOrEditVisible } = useTablePro({
    request: _getExamList,
    extraParams: { ...query },
  });

  const [visible, _switchVisible] = useVisible();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => _refreshTable(), [query]);
  const columns = [
    { title: '姓名', dataIndex: 'studentName', width: 80 },
    {
      title: '证件号',
      dataIndex: 'idNumber',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    { title: '教练', dataIndex: 'coaName', width: 80 },
    { title: '训练车号', dataIndex: 'trainCarCode', width: 80 },
    { title: '考试车型', dataIndex: 'testCarModel', width: 80 },
    { title: '报名日期', dataIndex: 'applyDate', width: 110 },
    { title: '考试科目', dataIndex: 'testSubject', width: 80 },
    { title: '预约日期', dataIndex: 'appointDate', width: 110 },
    { title: '考试日期', dataIndex: 'testDate', width: 110 },
    { title: '考试成绩', dataIndex: 'testScores', width: 80 },
    { title: '考试结果', dataIndex: 'testResult', width: 80 },
    { title: '考试场地', dataIndex: 'testPlace', width: 90 },
    { title: '考试场次', dataIndex: 'testEtc', width: 160 },
  ];

  return (
    <>
      {isAddOrEditVisible && (
        <AddOrEdit
          onCancel={_switchIsAddOrEditVisible}
          onOk={() => {
            _switchIsAddOrEditVisible();
            _refreshTable();
          }}
        />
      )}

      {visible && (
        // eslint-disable-next-line react/jsx-pascal-case
        <AddRecord.default
          onCancel={_switchVisible}
          onOk={() => {
            _switchVisible();
            _refreshTable();
          }}
        />
      )}

      <AuthButton
        authId="exam/examResultManage:btn1"
        type="primary"
        onClick={_switchIsAddOrEditVisible}
        className="mr20 mb20"
      >
        新增
      </AuthButton>

      <AuthButton authId="exam/examResultManage:btn2" type="primary" onClick={_switchVisible} className="mr20 mb20">
        成绩补录
      </AuthButton>

      <AuthButton
        authId="exam/examResultManage:btn3"
        type="primary"
        onClick={() => {
          _exportExam({
            limit: _get(tableProps, 'pagination.pageSize'),
            page: _get(tableProps, 'pagination.current'),
            ...query,
          }).then((res) => {
            downloadFile(res, '考试成绩管理', 'application/vnd.ms-excel', 'xlsx');
          });
        }}
        className="mr20 mb20"
        icon={<DownloadOutlined />}
      >
        导出
      </AuthButton>
      {/* <AuthButton
        authId=""
        type="primary"
        onClick={() => {
          printInfo(tableProps.dataSource, 'my');
        }}
        className="mr20 mb20"
      >
        打印
      </AuthButton> */}

      <CustomTable {...tableProps} columns={columns} rowKey="id" id="my" scroll={{ y: 'calc(100vh - 300px)' }} />
    </>
  );
};

export default RightPlate;
