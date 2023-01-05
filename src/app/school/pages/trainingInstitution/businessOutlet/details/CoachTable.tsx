import { CustomTable } from 'components';
import { useHash } from 'hooks';
import { _get } from 'utils';

export default function CoachTable(props: any) {
  const { dataSource } = props;
  const registeredExamFlagHash = useHash('registered_flag_type'); // 备案状态
  const employStatusHash = useHash('coa_master_status'); // 供职状态
  const coachtypeHash = useHash('coach_type'); // 教练员类型

  const columns = [
    {
      title: '姓名',
      dataIndex: 'coachname',
    },
    {
      title: '身份证号',
      dataIndex: 'idcard',
    },
    {
      title: '准教车型',
      dataIndex: 'teachpermitted',
    },
    {
      title: '教练员类型',
      dataIndex: 'coachtype',
      render: (coachtype: string) => coachtypeHash[coachtype],
    },
    {
      title: '供职状态',
      dataIndex: 'employstatus',
      render: (employstatus: string) => employStatusHash[employstatus],
    },
    {
      title: '备案状态',
      dataIndex: 'registered_Flag',
      render: (registered_Flag: string) => registeredExamFlagHash[registered_Flag],
    },
    {
      title: '统一编码',
      dataIndex: 'coachnum',
    },
  ];

  return (
    <CustomTable columns={columns} bordered dataSource={dataSource} rowKey={(record: any) => _get(record, 'cid')} />
  );
}
