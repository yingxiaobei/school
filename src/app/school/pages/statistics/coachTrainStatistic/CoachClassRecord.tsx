import { Modal } from 'antd';
import { _getCoachClassRecord } from './_api';
import { useTablePro, useHash } from 'hooks';
import { CustomTable, Search } from 'components';
import { formatTime, generateIdForDataSource, _get } from 'utils';
import { _getStudentList } from 'api';

interface IProps {
  onCancel(): void;
  currentRecord: any;
}

export default function CoachClassRecord(props: IProps) {
  const { onCancel, currentRecord } = props;
  const subjectcodeHash = useHash('trans_part_type'); // 培训部分
  const { tableProps, search, _refreshTable, _handleSearch } = useTablePro({
    request: _getCoachClassRecord,
    extraParams: {
      cid: _get(currentRecord, 'cid', ''),
      opraStartDay: formatTime(_get(currentRecord, 'statisticStartTime', ''), 'YYYYMMDD'),
      opraEndDay: formatTime(_get(currentRecord, 'statisticEndTime', ''), 'YYYYMMDD'),
    },
    dataSourceFormatter: (dataSource: any[]) => generateIdForDataSource(dataSource),
  });
  const columns = [
    { title: '学员姓名', dataIndex: 'stuname' },
    { title: '科目', dataIndex: 'subjectcode', render: (subjectcode: any) => subjectcodeHash[subjectcode] },
    { title: '开始时间', dataIndex: 'starttime' },
    { title: '结束时间', dataIndex: 'endtime' },
    { title: '培训时长', dataIndex: 'duration' },
    { title: '培训里程', dataIndex: 'mileage' },
    { title: '有效时长', dataIndex: 'validtime' },
    { title: '有效里程', dataIndex: 'validmileage' },
  ];

  return (
    <Modal visible width={800} title={'明细'} maskClosable={false} onCancel={onCancel} footer={null}>
      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'SimpleSelectOfStudent',
            field: 'sid',
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        simpleStudentRequest={_getStudentList}
      />
      <CustomTable {...tableProps} columns={columns} rowKey="id" scroll={{ y: undefined }} />
    </Modal>
  );
}
