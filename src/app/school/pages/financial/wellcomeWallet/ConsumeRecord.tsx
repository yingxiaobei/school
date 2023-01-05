import { Drawer } from 'antd';
import { CustomTable, Search } from 'components';
import moment from 'moment';
import { useTablePro, useFetch, useHash } from 'hooks';
import { formatTime, _handleIdCard } from 'utils';
import { _consumeRecord, _getTrainType } from './_api';
import { _getStudentList } from 'api';

export function ConsumeRecord(props: any) {
  const { onCancel, subAccountType } = props;

  // 业务类型
  const { data } = useFetch({
    request: _getTrainType,
  });
  const busiTypeHash = {};
  (data || []).forEach((x: any) => {
    busiTypeHash[x.value] = x.text;
  });
  const trainTypeHash = useHash('stu_train_code');

  const startTime = moment().subtract(30, 'day');
  const { search, _handleSearch, tableProps, _refreshTable } = useTablePro({
    request: _consumeRecord,
    initialSearch: {
      operateTimeStart: formatTime(startTime, 'DATE'),
      operateTimeEnd: formatTime(moment().subtract(1, 'day'), 'DATE'),
      accountType: subAccountType,
    },
  });

  const columns = [
    {
      title: '学员姓名',
      dataIndex: 'stuName',
      render: (text: string, record: any) => (
        <p>
          {record?.isBackCard === '1' ? (
            <span style={{ color: 'red', border: ' 1px red solid', padding: ' 2px' }}>退</span>
          ) : (
            ''
          )}
          {text}
        </p>
      ),
      width: '80px',
    },
    {
      title: '学员证件号',
      width: '200px',
      dataIndex: 'stuIdcard',
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    { title: '消费环节', width: '120px', dataIndex: 'consumePoint' },
    { title: '学驾车型', width: '120px', dataIndex: 'stuCarType' },
    {
      title: '业务类型',
      width: '120px',
      dataIndex: 'stuBussType',
      render: (stuBussType: string) => busiTypeHash[stuBussType],
    },
    { title: '培训类型', width: '120px', dataIndex: 'trainCode', render: (text: string) => trainTypeHash[text] },
    { title: '消费时间', width: '160px', dataIndex: 'operationTime' },
  ];

  return (
    <Drawer destroyOnClose visible width={1100} title={'消费记录'} onClose={onCancel}>
      <Search
        filters={[
          {
            type: 'RangePicker',
            field: ['operateTimeStart', 'operateTimeEnd'],
            placeholder: ['操作日期(起)', '操作日期(止)'],
            otherProps: {
              // allowClear: false,
              defaultValue: [startTime, moment().subtract(1, 'day')],
            },
          },
          {
            type: 'SimpleSelectOfStudent',
            field: 'sid',
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        simpleStudentRequest={_getStudentList}
        refreshTable={_refreshTable}
      />

      <CustomTable {...tableProps} columns={columns} rowKey={() => Math.random()} />
    </Drawer>
  );
}
