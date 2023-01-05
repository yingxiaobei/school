// 学时申报
import React, { useState } from 'react';
import { _getApplyResult } from './_api';
import { _getStudentInfo, _getStudentList } from 'api';
import { useTablePro, useOptions, useHash } from 'hooks';
import { Button } from 'antd';
import { Search, AuthButton, CustomTable, ButtonContainer } from 'components';
import AddOrEdit from './AddOrEdit';
import { _get, _handleIdCard } from 'utils';

export default function PhaseDeclare() {
  const {
    tableProps,
    search,
    _handleSearch,
    _refreshTable,
    currentId,
    _handleEdit,
    currentRecord,
    isAddOrEditVisible,
    _switchIsAddOrEditVisible,
    isEdit,
    _handleOk,
    _handleAdd,
  } = useTablePro({
    request: _getStudentInfo,
    extraParams: {
      traintimeApplyQueryType: 1, //查询类型
      studenttype: 1, //转入学员
    },
  });
  const traintimeApplyStatusTypeHash = useHash('traintime_apply_status_type'); // 申报状态
  const [isDetail, setIsDetail] = useState(false);
  const columns = [
    { title: '学员姓名', dataIndex: 'name' },
    {
      title: '证件号码',
      dataIndex: 'idcard',
      width: 180,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    { title: '车型', dataIndex: 'traintype' },
    { title: '申报时间', dataIndex: 'trainTimeApplyTime' },
    {
      title: '申报状态',
      dataIndex: 'trainTimeApplyStatus',
      render: (trainTimeApplyStatus: any) => traintimeApplyStatusTypeHash[trainTimeApplyStatus],
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => {
        return (
          <>
            <AuthButton
              authId="student/phaseDeclare:btn3"
              className="operation-button"
              onClick={() => {
                setIsDetail(true);
                _handleEdit(record, _get(record, 'sid', ''));
              }}
            >
              详情
            </AuthButton>
            <AuthButton
              authId="student/phaseDeclare:btn1"
              insertWhen={_get(record, 'trainTimeApplyStatus') === '1' || _get(record, 'trainTimeApplyStatus') === '3'}
              className="operation-button"
              onClick={() => {
                setIsDetail(false);
                _handleEdit(record, _get(record, 'sid', ''));
              }}
            >
              编辑
            </AuthButton>
            <AuthButton
              authId="student/phaseDeclare:btn2"
              insertWhen={_get(record, 'trainTimeApplyStatus') === '1'}
              className="operation-button"
              onClick={async () => {
                const res = await _getApplyResult({ sid: _get(record, 'sid', '') });
                if (_get(res, 'code') === 200) {
                  _refreshTable();
                }
              }}
            >
              获取申报结果
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
          currentRecord={currentRecord}
          isEdit={isEdit}
          isDetail={isDetail}
        />
      )}

      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'RangePicker',
            field: ['trainTimeApplyTimeBegin', 'trainTimeApplyTimeEnd'],
            placeholder: ['申报日期开始', '申报日期结束'],
          },
          {
            type: 'SimpleSelectOfStudent',
            field: 'sid',
          },
          {
            type: 'Select',
            field: 'trainTimeApplyStatus',
            options: [
              { label: '申报状态(全部)', value: '' },
              ...useOptions('traintime_apply_status_type', false, '-1', ['0']),
            ],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        simpleStudentRequest={_getStudentList}
        showSearchButton={false}
      />
      <ButtonContainer showSearchButton={true} refreshTable={_refreshTable} loading={tableProps.loading}>
        <Button
          type="primary"
          className="mb20"
          onClick={() => {
            setIsDetail(false);
            _handleAdd();
          }}
        >
          学时申报
        </Button>
      </ButtonContainer>

      <CustomTable {...tableProps} columns={columns} rowKey="sid" />
    </>
  );
}
