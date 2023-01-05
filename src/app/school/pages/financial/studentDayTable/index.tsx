import React, { useState } from 'react';
import { useTablePro, useFetch, useForceUpdate } from 'hooks';
import { _getList, _getBankType, _getTotal, _export } from './_api';
import { AuthButton, CustomTable, Search } from 'components';
import { _get, downloadFile, _handleIdCard } from 'utils';
import moment from 'moment';
import { message } from 'antd';
import { _getStudentList } from 'api';

export default function StudentDayTable() {
  const [bankType, setBankType] = useState([]);
  const [ignore, forceUpdate] = useForceUpdate();
  const { search, _handleSearch, tableProps, _refreshTable } = useTablePro({
    request: _getList,
    initPageSize: 100,
    initialSearch: {
      startDate: moment().startOf('month').format('YYYY-MM-DD'),
      endDate: moment().subtract(1, 'days').format('YYYY-MM-DD'),
    },
    cb: () => {
      forceUpdate();
    },
  });

  const { data } = useFetch({
    request: _getBankType,
    callback: (data) => {
      const bankTypeOptions = (data || []).map((item: any) => {
        return { label: item.bankName, value: item.bankchannelid };
      });
      setBankType(bankTypeOptions);
    },
  });

  const { data: total } = useFetch({
    request: _getTotal,
    query: search,
    depends: [ignore],
  });

  const bankTypeHash: any = {};
  (data || []).forEach((item: any, index: number) => {
    bankTypeHash[data[index].bankchannelid] = item.bankName;
  });

  const columns: any[] = [
    {
      title: '学员名称',
      dataIndex: 'userName',
    },
    {
      title: '学员证件号',
      dataIndex: 'userIdNum',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '钱包名称',
      dataIndex: 'bankChannelName',
    },
    {
      title: '结算日期',
      dataIndex: 'billDate',
    },
    {
      title: '日结算金额',
      dataIndex: 'amount',
      render: (data: any) => (data || data === 0 ? Number(data).toFixed(2) : ''),
    },
  ];

  return (
    <>
      <Search
        filters={[
          {
            type: 'RangePicker',
            field: ['startDate', 'endDate'],
            placeholder: ['结算日期起', '结算日期止'],
            otherProps: {
              allowClear: false,
              defaultValue: [moment(_get(search, 'startDate')), moment(_get(search, 'endDate'))],
            },
          },
          {
            type: 'SimpleSelectOfStudent',
            field: 'userFlag',
          },
          {
            type: 'Select',
            field: 'bankChannelId',
            options: [{ value: '', label: '钱包类型(全部)' }, ...bankType],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        simpleStudentRequest={_getStudentList}
        refreshTable={() => {
          if (moment(_get(search, 'startDate')).year() !== moment(_get(search, 'endDate')).year()) {
            message.error('选择日期不能跨年');
            return;
          }

          if (moment(_get(search, 'endDate')).startOf('day') > moment().subtract('days', 1).startOf('day')) {
            message.error('不能查询当天及以后的数据');
            return;
          }
          _refreshTable();
        }}
      ></Search>

      <div className="border-all flex mb20">
        <div className="flex1 mt10 mb10 ml10 mr10">
          <div>收入</div>
          <div className="fz24 green">{total || 0}元</div>
        </div>
      </div>

      <AuthButton
        type="primary"
        className="mb20"
        onClick={() => {
          _export({
            page: _get(tableProps, 'pagination.current', ''),
            limit: _get(tableProps, 'pagination.pageSize', ''),
            ...search,
          }).then((res: any) => {
            downloadFile(res, '学员日结算报表', 'application/vnd.ms-excel', 'xlsx');
          });
        }}
        authId="financial/studentDayTable:btn1"
      >
        导出当页
      </AuthButton>

      <CustomTable {...tableProps} columns={columns} rowKey={() => Math.random()} />
    </>
  );
}
