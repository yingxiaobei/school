import { Button, Drawer, message } from 'antd';
import { CustomTable, Search } from 'components';
import moment from 'moment';
import { useFetch, useForceUpdate, useHash, useSearch, useTablePagination, useVisible } from 'hooks';
import { useState } from 'react';
import { formatTime, get30DaysAgoNotCrossYear, _get } from 'utils';
import { _queryApplicationRecharge } from './_api';
import RechargeRecordDetail from './RechargeRecordDetail';

export default function RechargeRecord(props: any) {
  const { onCancel, subAccountType } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const startTime = get30DaysAgoNotCrossYear();
  const [search, _handleSearch] = useSearch({
    startTime: formatTime(startTime, 'DATE'),
    endTime: formatTime(moment(), 'DATE'),
  });
  const [ignore, forceUpdate] = useForceUpdate();
  const [detailVisible, _switchDetailsVisible] = useVisible();
  const [currentRecord, setCurrentRecord] = useState();

  const payWayHash = useHash('pay_way_type');
  const payStatusHash = useHash('pay_status_type');

  const { data, isLoading } = useFetch({
    request: _queryApplicationRecharge,
    depends: [ignore, pagination.current, pagination.pageSize],
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      rechargeNumber: _get(search, 'rechargeNumber'),
      subAccountType,
      startTime: formatTime(_get(search, 'startTime'), 'DATE'),
      endTime: formatTime(_get(search, 'endTime'), 'DATE'),
    },
    callback(data) {
      if (!_get(search, 'startTime') || !_get(search, 'endTime')) {
        return message.error('创建时间不能为空');
      }
      setPagination({ ...pagination, total: _get(data, 'totalCount', 0) });
    },
  });

  const columns = [
    { title: '创建时间', dataIndex: 'queryTime', width: 120 },
    { title: '充值单号', dataIndex: 'rechargeNumber', width: 100 },
    { title: '充值数', dataIndex: 'rechargeNumApply', width: 40 },
    {
      title: '订单金额',
      dataIndex: 'orderAmount',
      width: 80,
      render: (orderAmount: any, record: any) => {
        return orderAmount || orderAmount === 0 ? Number(orderAmount).toFixed(2) : '';
      },
    },
    { title: '支付方式', width: 80, dataIndex: 'payWay', render: (payWay: any) => payWayHash[payWay] },
    { title: '状态', width: 80, dataIndex: 'payStatus', render: (payStatus: any) => payStatusHash[payStatus] },
    {
      title: '操作',
      width: 80,
      dataIndex: '_record',
      render: (_: any, record: any) => (
        <Button
          // authId="publicServicePlatform/schoolSearch:btn1"
          onClick={() => {
            setCurrentRecord(record);
            _switchDetailsVisible();
          }}
          className="operation-button"
          type="primary"
          ghost
          size="small"
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <Drawer destroyOnClose visible width={1000} title={'充值记录'} onClose={onCancel}>
      <Search
        loading={isLoading}
        filters={[
          {
            type: 'RangePicker',
            field: ['startTime', 'endTime'],
            placeholder: ['创建时间(起)', '创建时间(止)'],
            otherProps: {
              allowClear: false,
              defaultValue: [startTime, moment()],
            },
          },
          { type: 'Input', field: 'rechargeNumber', placeholder: '单号' },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          if (!_get(search, 'startTime') || !_get(search, 'endTime')) {
            return message.error('创建时间不能为空');
          }
          setPagination({ ...pagination, current: 1, total: _get(data, 'totalCount', 0) });
          forceUpdate();
        }}
      />
      {detailVisible && (
        <RechargeRecordDetail
          currentRecord={currentRecord}
          onCancel={_switchDetailsVisible}
          onOk={() => {
            _switchDetailsVisible();
            forceUpdate();
          }}
        />
      )}
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rechargeApplyInfos', [])}
        pagination={tablePagination}
        rowKey={() => Math.random()}
      />
    </Drawer>
  );
}
