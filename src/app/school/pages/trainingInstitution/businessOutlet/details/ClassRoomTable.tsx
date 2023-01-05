import { CustomTable } from 'components';
import { useHash } from 'hooks';
import { _get } from 'utils';

export default function ClassRoomTable(props: any) {
  const { dataSource } = props;
  const traincodeClassHash = useHash('traincode_type'); // 培训类型

  const columns = [
    {
      title: '教室号',
      dataIndex: 'classroom',
    },
    {
      title: '座位数',
      dataIndex: 'seatnum',
    },
    {
      title: '可培训类型',
      dataIndex: 'traincode',
      render: (traincode: any) =>
        traincode
          .split(',')
          .map((x: any) => traincodeClassHash[x])
          .join(),
    },
    {
      title: '备注',
      dataIndex: 'remark',
    },
  ];

  return (
    <CustomTable columns={columns} bordered dataSource={dataSource} rowKey={(record: any) => _get(record, 'classid')} />
  );
}
