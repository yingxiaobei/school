import { Drawer, message } from 'antd';
import { CustomTable, Search } from 'components';
import { useFetch, useForceUpdate, useSearch, useTablePagination } from 'hooks';
import moment from 'moment';

import { formatTime, get30DaysAgoNotCrossYear, _get } from 'utils';
import { _queryJfDetailInfo } from './_api';

export function PointsDetails(props: any) {
  const { onCancel } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const startTime = get30DaysAgoNotCrossYear();
  const [ignore, forceUpdate] = useForceUpdate();
  const [search, _handleSearch] = useSearch({
    startTime: formatTime(startTime, 'DATE'),
    endTime: formatTime(moment(), 'DATE'),
  });
  const { data, isLoading } = useFetch({
    request: _queryJfDetailInfo,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      startTime: formatTime(_get(search, 'startTime'), 'DATE'),
      endTime: formatTime(_get(search, 'endTime'), 'DATE'),
    },
    depends: [pagination.current, pagination.pageSize, ignore],
    callback(data: any) {
      if (!_get(search, 'startTime') || !_get(search, 'endTime')) {
        return message.error('时间不能为空');
      }
      setPagination({ ...pagination, total: _get(data, 'totalCount', 0) });
    },
  });

  const columns = [
    { title: '时间', dataIndex: 'operateTime', width: 130 },
    { title: '类型', dataIndex: 'operateType', width: 80 },
    {
      title: '数量',
      width: 80,
      dataIndex: 'transactionAmount',
      render: (transactionAmount: any, record: any) => {
        if (!transactionAmount) return;
        if (_get(record, 'operateType') === '支出') {
          return <span style={{ color: '#008000' }}>-{Number(transactionAmount).toFixed(2)}</span>;
        }
        return <span className="color-primary">+{Number(transactionAmount).toFixed(2)}</span>;
      },
    },
    {
      title: '剩余',
      width: 100,
      dataIndex: 'accountBalance',
      render: (accountBalance: any) => {
        if (!accountBalance) return;
        return Number(accountBalance).toFixed(2);
      },
    },
    { title: '备注', dataIndex: 'memo', width: 100 },
  ];
  return (
    <Drawer destroyOnClose visible width={800} title={'收支明细'} onClose={onCancel}>
      <Search
        loading={isLoading}
        filters={[
          {
            type: 'RangePicker',
            field: ['startTime', 'endTime'],
            placeholder: ['开始时间(起)', '结束时间(止)'],
            otherProps: {
              allowClear: false,
              defaultValue: [startTime, moment()],
            },
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          if (!_get(search, 'startTime') || !_get(search, 'endTime')) {
            return message.error('时间不能为空');
          }
          setPagination({ ...pagination, current: 1, total: _get(data, 'totalCount', 0) });
          forceUpdate();
        }}
      />
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'jfDetailInfos', [])}
        pagination={tablePagination}
        rowKey={() => Math.random()}
      />
    </Drawer>
  );
}
