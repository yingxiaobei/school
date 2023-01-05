// 商品信息

import { _querySkuBy } from './_api';
import { _get } from 'utils';
import { useFetch } from 'hooks';
import { CustomTable } from 'components';

export default function CommodityInformation(props: any) {
  const { orderitemids } = props;
  const { data, isLoading } = useFetch({
    query: {
      orderitemids: orderitemids,
    },
    request: _querySkuBy,
  });
  const columns = [
    {
      title: '商品',
      dataIndex: 'productName',
    },
    {
      title: '规格属性',
      dataIndex: 'subject',
    },
    {
      title: '数量',
      dataIndex: 'productNum',
    },
    {
      title: '价格',
      dataIndex: 'price',
    },
  ];

  return (
    <div>
      <CustomTable
        columns={columns}
        bordered
        dataSource={data}
        loading={isLoading}
        rowKey={(record: any) => _get(record, 'productId')}
        pagination={false}
      />
    </div>
  );
}
