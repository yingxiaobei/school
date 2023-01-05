// 操作日志
import { useState } from 'react';
import { useSearch, useTablePagination, useFetch, useForceUpdate } from 'hooks';
import { _getLogs } from './_api';
import { CustomTable, Search } from 'components';
import { formatTime, generateIdForDataSource, _get } from 'utils';

export default function OperateLog() {
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [dates, setDates] = useState<any>([]);

  const columns = [
    { title: '模块名称', dataIndex: 'menuName', width: 80 },
    { title: '操作类型', dataIndex: 'elementName', width: 60 },
    { title: '结果', dataIndex: 'resultMsg', width: 60 },
    { title: '内容', dataIndex: 'respContent', width: 150 },
    { title: '用户名', dataIndex: 'userName', width: 100 },
    { title: 'IP', dataIndex: 'clientIp', width: 100 },
    { title: '操作时间', dataIndex: 'logTime', width: 150 },
  ];

  // FIXME:wy
  const { isLoading, data } = useFetch<any>({
    request: _getLogs,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      menuName: _get(search, 'menuName'),
      elementName: _get(search, 'elementName'),
      userName: _get(search, 'userName'),
      operationDateStart: formatTime(_get(search, 'operationDateStart'), 'BEGIN'),
      operationDateEnd: formatTime(_get(search, 'operationDateEnd'), 'END'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  const dataSource = generateIdForDataSource(_get(data, 'rows', []));

  return (
    <>
      <Search
        loading={isLoading}
        filters={[
          {
            type: 'RangePicker',
            field: ['operationDateStart', 'operationDateEnd'],
            placeholder: ['开始日期', '结束日期'],
            otherProps: {
              disabledDate: (current: any) => {
                if (!dates || dates.length === 0) {
                  return false;
                }
                const tooLate = dates[0] && current.diff(dates[0], 'days') > 61;
                const tooEarly = dates[1] && dates[1].diff(current, 'days') > 61;
                return tooEarly || tooLate;
              },
              onCalendarChange: (val: any) => setDates(val),
            },
          },
          { type: 'Input', field: 'menuName', placeholder: '模块名称' },
          { type: 'Input', field: 'elementName', placeholder: '操作类型' },
          { type: 'Input', field: 'userName', placeholder: '用户名' },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
      />

      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={dataSource}
        rowKey="id"
        pagination={tablePagination}
      />
    </>
  );
}
