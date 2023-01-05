import { Drawer } from 'antd';
import { CustomTable } from 'components';
import { useFetch, useHash } from 'hooks';
import { _get, _handleIdCard } from 'utils';
import { _selectByKey, _getTrainType } from './_api';

export default function CardReturnDetail(props: any) {
  const { onCancel, currentRecord } = props;

  // 业务类型

  const busiTypeHash = useHash('businessType');
  const { data, isLoading } = useFetch({
    request: _selectByKey,
    query: {
      id: currentRecord.id,
    },
  });

  const columns = [
    { title: '学员姓名', dataIndex: 'studentName', width: 100 },
    {
      title: '学员证件号',
      dataIndex: 'idcard',
      width: 140,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '消费环节',
      dataIndex: 'consumePoint',
      width: 80,
    },
    { title: '学驾车型', width: 80, dataIndex: 'trainType' },
    { title: '业务类型', width: 80, dataIndex: 'busiType', render: (payStatus: any) => busiTypeHash[payStatus] },
    { title: '消费时间', dataIndex: 'consumeTime', width: 120 },
  ];

  return (
    <Drawer destroyOnClose visible width={1000} title={'退卡明细'} onClose={onCancel}>
      <CustomTable
        columns={columns}
        rowKey={(record: any) => _get(record, 'sid')}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'stuReturnCardApplyDetailList')}
        pagination={false}
      />
    </Drawer>
  );
}
