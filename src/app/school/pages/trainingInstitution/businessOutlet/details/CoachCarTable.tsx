import { CustomTable } from 'components';
import { useHash } from 'hooks';
import { _get } from 'utils';

export default function CoachCarTable(props: any) {
  const { dataSource } = props;
  const registeredExamFlagHash = useHash('registered_flag_type'); // 备案状态
  const platecolorHash = useHash('platecolor_type'); // 车辆颜色

  const columns = [
    {
      title: '车牌号码',
      dataIndex: 'licnum',
    },
    {
      title: '车牌颜色',
      dataIndex: 'platecolor',
      render: (platecolor: string) => platecolorHash[platecolor],
    },
    {
      title: '车辆品牌',
      dataIndex: 'brand',
    },
    {
      title: '车架号',
      dataIndex: 'franum',
    },
    {
      title: '统一编码',
      dataIndex: 'carnum',
    },
    {
      title: '备案状态',
      dataIndex: 'registered_Flag',
      render: (registered_Flag: string) => registeredExamFlagHash[registered_Flag],
    },
  ];

  return (
    <CustomTable columns={columns} bordered dataSource={dataSource} rowKey={(record: any) => _get(record, 'carid')} />
  );
}
