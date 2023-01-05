import { CustomTable } from 'components';
import { useHash } from 'hooks';

import { _get } from 'utils';

export function TransactionInfo(props: any) {
  const { currentRecord } = props;

  const payWayHash = useHash('pay_way_type');

  const columns = [
    { title: '付款时间', dataIndex: 'payTime', width: 120 },
    { title: '充值单号', dataIndex: 'rechargeNumber', width: 120 },
    { title: '付款方式', dataIndex: 'payWay', width: 80, render: (payWay: any) => payWayHash[payWay] },
    { title: '交易编号/凭证号', dataIndex: 'tradingFlowNumber', width: 80 },
    { title: '收款账户', dataIndex: 'bankName', width: 80 },
    {
      title: '订单金额',
      width: 80,
      dataIndex: 'orderAmount',
      render: (orderAmount: any) => {
        return orderAmount || orderAmount === 0 ? Number(orderAmount).toFixed(2) : '';
      },
    },
    {
      title: '信息服务费',
      width: 80,
      dataIndex: 'serviceFee',
      render: (serviceFee: any) => {
        return serviceFee || serviceFee === 0 ? '￥' + Number(serviceFee).toFixed(2) : '';
      },
    },
    {
      title: '应付金额',
      width: 80,
      dataIndex: 'payAmount',
      render: (payAmount: any) => {
        return payAmount || payAmount === 0 ? '￥' + Number(payAmount).toFixed(2) : '';
      },
    },
  ];

  return (
    <CustomTable
      columns={columns}
      bordered
      dataSource={[currentRecord]}
      rowKey={() => Math.random()}
      pagination={false}
    />
  );
}
