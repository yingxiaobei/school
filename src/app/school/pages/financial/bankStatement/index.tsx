// 银行对账单

import { message, Space } from 'antd';
import { useTablePagination, useSearch, useForceUpdate, useFetch } from 'hooks';
import { _getInfo, _getDownLoadAddress } from './_api';
import { AuthButton, CustomTable, Search } from 'components';
import { formatTime, _get, downloadURL } from 'utils';
import moment from 'moment';

function BankStatement() {
  const [search, _handleSearch] = useSearch({ begin: moment().startOf('month'), end: moment().add(-1, 'd') });
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();

  const columns = [
    { title: '日期', dataIndex: 'time' },
    {
      title: '操作',
      dataIndex: 'schStatementRecordVOS',
      render: (_: void, record: any) => (
        <div>
          {_get(record, 'schStatementRecordVOS', [])?.map((item: any, index: any) => (
            <AuthButton
              authId="financial/bankStatement:btn1"
              type="primary"
              ghost
              key={index}
              size="small"
              className="operation-button"
              onClick={() => {
                downloadURL({ url: item.fileUrl, filename: '' });
              }}
            >
              【{item.bindCardBankName}】下载
            </AuthButton>
          ))}
        </div>
      ),
    },
  ];

  const { isLoading, data } = useFetch({
    request: _getInfo,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      startDate: formatTime(_get(search, 'begin'), 'BEGIN'),
      endDate: formatTime(_get(search, 'end'), 'END'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: async (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  return (
    <>
      <Search
        loading={isLoading}
        filters={[
          {
            type: 'RangePicker',
            field: ['begin', 'end'],
            placeholder: ['日期起', '日期止'],
            otherProps: {
              allowClear: false,
              defaultValue: [_get(search, 'begin', ''), _get(search, 'end', '')],
            },
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
      ></Search>
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record: any) => _get(record, 'time')}
        pagination={tablePagination}
      />
    </>
  );
}

export default BankStatement;
