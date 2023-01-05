import { CustomTable } from 'components';
import { generateIdForDataSource, _get } from 'utils';
import { Tooltip } from 'antd';

interface IProps {
  record: any;
  title?: string;
}

export default function ChargingStandardTable(props: IProps) {
  const { record = [], title = '提现' } = props;
  function getDesStr(num: number) {
    return num < 10000 ? num + '元' : num / 10000 + '万元';
  }
  function compare(obj1: any, obj2: any) {
    var val1 = _get(obj1, 'withdrawFeeMin', 0);
    var val2 = _get(obj2, 'withdrawFeeMin', 0);
    if (val1 < val2) {
      return -1;
    } else if (val1 > val2) {
      return 1;
    } else {
      return 0;
    }
  }

  const columns = [
    {
      title: `${title}金额`,
      dataIndex: 'withdrawFeeMin',
      width: 80,
      render: (withdrawFeeMin: number, record: any) => {
        const withdrawFeeMax = _get(record, 'withdrawFeeMax', 0) || 0;
        if (withdrawFeeMin === null && _get(record, 'withdrawFeeMax') === undefined) {
          return '';
        }
        if ((withdrawFeeMin === null || withdrawFeeMin === 0) && withdrawFeeMax) {
          return getDesStr(withdrawFeeMax) + '以下';
        } else if (_get(record, 'withdrawFeeMax') === undefined && withdrawFeeMin) {
          return getDesStr(withdrawFeeMin) + '以上';
        }
        return getDesStr(withdrawFeeMin) + '-' + getDesStr(withdrawFeeMax);
      },
    },
    {
      title: '信息服务费',
      dataIndex: 'fee',
      width: 120,
      render: (fee: any, record: any) => {
        const feePer = _get(record, 'feePer');
        const content = feePer ? `${feePer * 100}%，最高不超过${fee ? fee : 0}元/笔` : `${fee ? fee : 0}元/笔`;
        return <Tooltip title={content}>{content}</Tooltip>;
      },
    },
  ];
  return (
    <div style={{ width: 400 }}>
      <CustomTable
        columns={columns}
        bordered
        dataSource={generateIdForDataSource(record.sort(compare))}
        rowKey="id"
        pagination={false}
      />
    </div>
  );
}
