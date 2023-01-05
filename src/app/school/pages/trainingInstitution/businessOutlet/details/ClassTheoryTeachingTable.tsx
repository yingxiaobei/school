import { CustomTable } from 'components';
import { useHash } from 'hooks';
import { _get, _handlePhone } from 'utils';

export default function ClassTheoryTeachingTable(props: any) {
  const { dataSource } = props;
  const registeredExamFlagHash = useHash('registered_flag_type'); // 备案状态
  const companyBusiStatusHash: any = useHash('company_busi_status'); // 营业状态
  const authStatusHash: any = useHash('common_status_type'); // 授权状态
  const initStatusHash: any = useHash('company_init_status'); // 初始化状态

  const columns = [
    {
      title: '驾校全称',
      dataIndex: 'name',
    },
    {
      title: '驾校简称',
      dataIndex: 'shortName',
    },
    {
      title: '备案状态',
      dataIndex: 'status', //备案状态 0：未备案 1：已备案2：备案中3：备案失败
      render: (status: string) => registeredExamFlagHash[status],
    },
    {
      title: '初始化状态',
      dataIndex: 'initStatus', //初始化状态：0：未初始化1：已初始化
      render: (initStatus: string) => initStatusHash[initStatus],
    },
    {
      title: '联系电话',
      dataIndex: 'leaderPhone',
      render: (value: any, record: any) => _handlePhone(value),
    },
    {
      title: '营业状态',
      dataIndex: 'busiStatus', //营业状态0：营业1：停业2：整改3：停业整顿4：歇业5：注销9：其他
      render: (busiStatus: string) => companyBusiStatusHash[busiStatus],
    },
    {
      title: '经营范围',
      dataIndex: 'busiScope',
    },
    {
      title: '授权状态',
      dataIndex: 'authStatus', //授权状态1：启用2：停用
      render: (authStatus: string) => authStatusHash[authStatus],
    },
  ];

  return (
    <CustomTable columns={columns} bordered dataSource={dataSource} rowKey={(record: any) => _get(record, 'id')} />
  );
}
