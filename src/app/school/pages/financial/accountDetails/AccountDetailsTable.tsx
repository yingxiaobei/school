// 账务明细表格

import { _getInfo } from './_api';
import { useFetch } from 'hooks';
import { generateIdForDataSource, _get } from 'utils';
import { useEffect } from 'react';
import { CustomTable } from 'components';
import { Tooltip } from 'antd';

export default function AccountDetailsTable(props: any) {
  const {
    query,
    setMoneyCallback,
    ignore,
    flowType = '',
    pagination,
    setPagination,
    tablePagination,
    setLoading,
  } = props;

  const { isLoading = false, data } = useFetch({
    request: _getInfo,
    query: query,
    depends: [ignore, pagination.current, pagination.pageSize, flowType],
    callback: async (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      if (setMoneyCallback) {
        setMoneyCallback(data);
      }
    },
  });

  useEffect(() => {
    setLoading && setLoading(isLoading);
  }, [isLoading, setLoading]);

  const columns = [
    {
      title: '交易号',
      width: 100,
      dataIndex: 'platTradeNo',
    },
    {
      title: '账户类型',
      width: 80,
      dataIndex: 'bankChannelName',
    },
    {
      title: '账务类型',
      width: 80,
      dataIndex: 'busiType',
    },
    {
      title: '对方信息',
      width: 150,
      dataIndex: 'targetAcctNo',
      render: (targetAcctNo: any, record: any) => {
        const val = _get(record, 'targetAcctName', '')
          ? targetAcctNo + '-' + _get(record, 'targetAcctName', '')
          : targetAcctNo;
        return <Tooltip title={val}>{val}</Tooltip>;
      },
    },
    {
      title: '收支/冻结/解冻 金额',
      width: 130,
      dataIndex: 'tradeAmount',
      render: (tradeAmount: any, record: any) => {
        let style = { color: 'black' };
        if (record.flowType === '支出') {
          style = { color: '#F3302B' };
        } else if (record.flowType === '收入') {
          style = { color: 'green' };
        }
        return <span style={style}>{tradeAmount}</span>;
      },
    },
    {
      title: '收支类型',
      width: 80,
      dataIndex: 'flowType',
    },
    {
      title: '账户余额',
      width: 80,
      dataIndex: 'allAmount',
      render: (allAmount: any, record: any) => {
        return allAmount || allAmount === 0 ? Number(allAmount).toFixed(2) : '';
      },
    },
    {
      title: '备注',
      width: 100,
      ellipsis: true,
      dataIndex: 'memo',
    },
    {
      title: '入账时间',
      width: 120,
      dataIndex: 'successTime',
    },
  ];

  return (
    <div>
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={generateIdForDataSource(_get(data, 'rows', []))}
        rowKey="id"
        scroll={{ y: document.body.clientHeight - 520 }}
        pagination={tablePagination}
      />
    </div>
  );
}
