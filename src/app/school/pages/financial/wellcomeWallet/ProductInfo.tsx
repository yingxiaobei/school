import { Table } from 'antd';
import { CustomTable } from 'components';

import { _get } from 'utils';

export default function ProductInfo(props: any) {
  const { currentRecord } = props;
  const columns = [
    { title: '商品', dataIndex: 'subAccountName' },
    { title: '数量', dataIndex: 'rechargeNumApply' },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      render: (unitPrice: any) => {
        return unitPrice || unitPrice === 0 ? '￥' + Number(unitPrice).toFixed(2) : '';
      },
    },
    {
      title: '价格',
      dataIndex: 'orderAmount',
      render: (orderAmount: any) => {
        return orderAmount || orderAmount === 0 ? '￥' + Number(orderAmount).toFixed(2) : '';
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
      summary={() => (
        <Table.Summary.Row className="text-center">
          <Table.Summary.Cell index={0}>合计</Table.Summary.Cell>
          <Table.Summary.Cell index={3} colSpan={4}>
            ￥{Number(_get(currentRecord, 'orderAmount', 0)).toFixed(2)}
          </Table.Summary.Cell>
        </Table.Summary.Row>
      )}
    />
  );
}
