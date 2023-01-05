import { Drawer } from 'antd';
import { _getCoachRecord } from './_api';
import { useFetch } from 'hooks';
import { _get } from 'utils';
import { CustomTable } from 'components';

interface IProps {
  onCancel(): void;
  cid: string;
}

export default function UpdateRecord(props: IProps) {
  const { onCancel, cid } = props;

  const { data } = useFetch({
    request: _getCoachRecord,
    query: {
      cid,
    },
  });

  const columns = [
    { title: '生效时间', dataIndex: 'effectiveTime' },
    { title: '教练分账比例', dataIndex: 'coaSplitRatio' },
  ];

  return (
    <>
      <Drawer destroyOnClose visible width={800} title={'修改记录'} footer={null} onClose={onCancel}>
        <>
          <div className="mb20">
            教练：{_get(data, 'coachname')}&nbsp;&nbsp;{_get(data, 'idcard')}
          </div>
          <CustomTable columns={columns} dataSource={_get(data, 'coaSplitRatioFlowEntities', [])} rowKey="id" />
        </>
      </Drawer>
    </>
  );
}
