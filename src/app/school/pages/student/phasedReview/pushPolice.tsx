import React, { useRef, useState } from 'react';
import { Modal, message } from 'antd';
import { Search, CustomTable, BatchProcessResult } from 'components';
import { useOptions, useHash, useTablePro, useBulkStatisticsResult, useInfo } from 'hooks';
import { _getFinalAssess, _singlepxjl } from './_api';
import styles from './index.module.css';
import { _getStudentList } from 'api';
import { _handleIdCard } from 'utils';

const PushPolice = (props: { onCancel: any }) => {
  const searchRef = useRef(null as any);
  const { onCancel } = props;
  const subjectHash = useHash('SchoolSubjectApply'); // 报审类型
  const SubjectApplyStatusHash = useHash('SubjectApplyStatus'); // 核实状态
  const PushStatusHash = useHash('pushga_status'); // 核实状态
  const [selectedRow, setSelectedRow] = useState<any>([]);
  const [_showInfo] = useInfo();
  const { tableProps, search, _refreshTable, _handleSearch } = useTablePro({
    request: _getFinalAssess,
    extraParams: {
      isapply: '2',
    },
  });

  const columns: any = [
    {
      title: '报审类型',
      dataIndex: 'subject',
      render: (subject: any) => subjectHash[subject],
      width: 100,
    },
    {
      title: '初审日期',
      dataIndex: 'createtime',
      width: 100,
    },
    {
      title: '学号',
      dataIndex: 'studentnum',
      width: 170,
    },
    {
      title: '学员姓名',
      dataIndex: 'name',
      width: 140,
    },
    {
      title: '证件号码',
      dataIndex: 'idcard',
      width: 180,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '学驾车型',
      dataIndex: 'traintype',
      width: 80,
    },
    {
      title: '教练姓名',
      dataIndex: 'coachname',
      width: 80,
    },
    {
      title: '核实状态',
      dataIndex: 'isapply',
      render: (isapply: any) => SubjectApplyStatusHash[isapply],
      width: 100,
    },
    {
      title: '提交人',
      dataIndex: 'applyname',
      width: 180,
    },
    {
      title: '提交时间',
      dataIndex: 'applytime',
      width: 180,
    },
    {
      title: '核实时间',
      dataIndex: 'resptime',
      width: 180,
    },
    {
      title: '推送时间',
      dataIndex: 'pushga_time',
      width: 180,
    },
    {
      title: '推送公安状态',
      dataIndex: 'pushga_status',
      render: (isapply: any) => PushStatusHash[isapply],
      width: 180,
    },
  ];
  const rowSelection = {
    onChange: (selectedRowkey: any, selectedRow: any) => {
      setSelectedRow(selectedRow);
    },
    selectedRow,
  };
  //批量获取审核结果
  const { loading, run } = useBulkStatisticsResult(_singlepxjl, {
    onOk: (data) => {
      const { total, errorTotal, errHashList, successList } = data;
      _showInfo({
        content: (
          <BatchProcessResult
            total={total}
            successTotal={total - errorTotal}
            errorTotal={errorTotal}
            errHashList={errHashList}
            successList={successList}
          />
        ),
      });
      setSelectedRow([]);
      onCancel();
    },
  });

  const handleOk = () => {
    if (selectedRow.length === 0) {
      message.info('请选择需要推送公安的数据');
      return;
    }
    run(selectedRow, {
      priKeyValMap: [{ key: 'id', value: 'said' }],
      otherParams: { withFeedbackAll: false },
    });
  };
  return (
    <Modal
      title="推送公安"
      visible
      onOk={handleOk}
      onCancel={onCancel}
      width={1000}
      confirmLoading={loading}
      okText="推送"
      bodyStyle={{ minHeight: 400 }}
    >
      <Search
        loading={tableProps.isLoading}
        ref={searchRef}
        filters={[
          {
            type: 'RangePicker',
            field: ['sdate', 'edate'],
            placeholder: ['初审日期起', '初审日期止'],
          },
          {
            type: 'SimpleSelectOfStudent',
            field: 'sid',
          },
          {
            type: 'Select',
            field: 'subject',
            options: [{ value: '', label: '报审类型(全部)' }, ...useOptions('SchoolSubjectApply')],
          },
          {
            type: 'Select',
            field: 'pushga_status',
            options: [{ value: '', label: '推送公安状态(全部)' }, ...useOptions('pushga_status')],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        simpleStudentRequest={_getStudentList}
        showSearchButton={true}
      />
      <div className={styles['allocated-hours-table-wrapper']}>
        <CustomTable
          columns={columns}
          rowSelection={{
            type: 'checkbox',
            ...rowSelection,
          }}
          rowKey="said"
          {...tableProps}
        />
      </div>
    </Modal>
  );
};

export default PushPolice;
