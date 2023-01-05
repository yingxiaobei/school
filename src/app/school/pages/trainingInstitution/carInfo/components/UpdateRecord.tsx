import { _getObdList } from '../_api';
import { useTablePro } from 'hooks';
import { CustomTable } from 'components';

interface IProps {
  carid: string;
}

export default function UpdateRecord(props: IProps) {
  const { carid } = props;
  const { tableProps } = useTablePro({
    request: _getObdList,
    extraParams: { carid },
  });

  const columns = [
    { title: '审核人', dataIndex: 'obdauditor' },
    { title: '审核时间', dataIndex: 'obdauditdate' },
  ];

  return (
    <>
      <CustomTable {...tableProps} columns={columns} rowKey="id" />
    </>
  );
}
