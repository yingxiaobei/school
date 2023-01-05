import { Drawer, message } from 'antd';
import { CustomTable, Search } from 'components';
import moment from 'moment';
import { useFetch, useForceUpdate, useHash, useSearch, useTablePagination } from 'hooks';

import { formatTime, _get } from 'utils';
import { _queryJfRechargeApplyInfo } from './_api';

export function ExchangeRecord(props: any) {
  const { onCancel } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const startTime = moment().subtract(30, 'day');
  const [search, _handleSearch] = useSearch({
    startTime: formatTime(startTime, 'DATE'),
    endTime: formatTime(moment(), 'DATE'),
  });
  const [ignore, forceUpdate] = useForceUpdate();
  const accountTypeHash = useHash('sub_account_name_type'); // 兑换账户类型
  const statusHash = useHash('acc_confirm_status_type'); // 兑换状态
  const { data, isLoading } = useFetch({
    request: _queryJfRechargeApplyInfo,
    depends: [ignore, pagination.current, pagination.pageSize],
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      startTime: formatTime(_get(search, 'startTime'), 'DATE'),
      endTime: formatTime(_get(search, 'endTime'), 'DATE'),
      rechargeNumber: _get(search, 'rechargeNumber'),
    },
    callback(data: any) {
      setPagination({ ...pagination, total: _get(data, 'totalCount', 0) });
    },
  });

  const columns = [
    { title: '创建时间', dataIndex: 'createTime', width: 100 },
    { title: '兑换单号', dataIndex: 'rechargeNumber', width: 100 },
    { title: '消耗数', dataIndex: 'integrateNum', width: 80 },
    {
      title: '兑换账户类型',
      dataIndex: 'subAccountType',
      width: 80,
      render: (subAccountType: any) => {
        return accountTypeHash[subAccountType];
      },
    },
    { title: '兑换数', dataIndex: 'rechargeNumApply', width: 80 },
    {
      title: '状态',
      dataIndex: 'accConfirmStatus',
      width: 80,
      render: (accConfirmStatus: any) => {
        return statusHash[accConfirmStatus];
      },
    },
  ];
  return (
    <Drawer destroyOnClose visible width={800} title={'兑换记录'} onClose={onCancel}>
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
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'jfRechargeApplyInfos', [])}
        pagination={tablePagination}
        rowKey={() => Math.random()}
      />
    </Drawer>
  );
}
