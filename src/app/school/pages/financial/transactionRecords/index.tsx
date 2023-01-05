// 交易记录
import { useState, useEffect } from 'react';
import { formatTime, _get } from 'utils';
import { useTablePagination, useSearch, useForceUpdate, useOptions, useFetch } from 'hooks';
import { Search } from 'components';
import TransactionRecordsTable from './TransactionRecordsTable';
import moment from 'moment';
import { message } from 'antd';
import { _getWallet } from 'api';
import { useHistory } from 'react-router-dom';

function TransactionRecords() {
  const [search, _handleSearch] = useSearch({
    startDate: formatTime(moment().subtract(30, 'day'), 'DATE'),
    endDate: formatTime(moment(), 'DATE'),
  });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [walletOptions, setWalletOptions] = useState([]);
  const history = useHistory();
  const bankChannelId = _get(history, 'location.state.bankChannelId', '');

  useEffect(() => {
    bankChannelId && _handleSearch('payFactory', bankChannelId); //从钱包管理跳转交易明细，默认搜索当前的钱包
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFetch({
    request: _getWallet,
    callback(data: any) {
      setWalletOptions(
        data.map((x: any) => {
          return { label: x.bankName, value: x.bankchannelid };
        }),
      );
    },
  });
  const query = {
    page: pagination.current,
    limit: pagination.pageSize,
    payFlowId: _get(search, 'payFlowId'),
    orderId: _get(search, 'orderId'),
    status: _get(search, 'status'),
    transType: _get(search, 'transType'),
    startDate: _get(search, 'startDate'),
    endDate: _get(search, 'endDate'),
    payFactory: _get(search, 'payFactory'),
    startSuccessDate: formatTime(_get(search, 'startSuccessDate'), 'BEGIN'),
    endSuccessDate: formatTime(_get(search, 'endSuccessDate'), 'END'),
  };

  return (
    <div>
      {
        <Search
          loading={loading}
          filters={[
            { type: 'Input', field: 'payFlowId', placeholder: '交易号' },
            { type: 'Input', field: 'orderId', placeholder: '订单号' },
            {
              type: 'Select',
              field: 'status',
              // placeholder: '交易状态',
              options: [{ label: '交易状态(全部)', value: '' }, ...useOptions('trade_list_page_trade_status')],
            },
            {
              type: 'Select',
              field: 'transType',
              placeholder: '交易类型',
              options: [{ label: '交易类型(全部)', value: '' }, ...useOptions('transaction_type')],
            },
            {
              type: 'RangePicker',
              field: ['startDate', 'endDate'],
              placeholder: ['创建日期起', '创建日期止'],
              otherProps: {
                allowClear: false,
                defaultValue: [moment().subtract(30, 'day'), moment()],
              },
            },
            {
              type: 'RangePicker',
              field: ['startSuccessDate', 'endSuccessDate'],
              placeholder: ['完成日期起', '完成日期止'],
              otherProps: {
                allowClear: true,
              },
            },
            {
              type: 'Select',
              field: 'payFactory',
              options: [{ label: '钱包(全部)', value: '' }, ...walletOptions],
            },
          ]}
          search={search}
          _handleSearch={_handleSearch}
          refreshTable={() => {
            if (
              _get(search, 'startDate') &&
              _get(search, 'endDate') &&
              moment(_get(search, 'startDate')).year() !== moment(_get(search, 'endDate')).year()
            ) {
              message.error('选择日期不能跨年');
            } else {
              forceUpdate();
              setPagination({ ...pagination, current: 1 });
            }
          }}
        />
      }
      <TransactionRecordsTable
        query={query}
        ignore={ignore}
        forceUpdate={forceUpdate}
        pagination={pagination}
        setPagination={setPagination}
        tablePagination={tablePagination}
        setLoading={setLoading}
      ></TransactionRecordsTable>
    </div>
  );
}

export default TransactionRecords;
