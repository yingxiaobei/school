import { useTablePro, useOptions, useHash } from 'hooks';
import { _getCarAlarmList } from './_api';
import { Popover } from 'antd';
import { CustomTable, Search } from 'components';
import { _get, _handlePhone } from 'utils';

export default function CarAlarm() {
  const { tableProps, search, _refreshTable, _handleSearch } = useTablePro({ request: _getCarAlarmList });
  const alarmTypeHash = useHash('alarm_type');

  const columns = [
    {
      title: '车牌号码',
      dataIndex: 'licnum',
    },
    {
      title: '报警类型',
      dataIndex: 'alarmType',
      render: (alarmType: string) => alarmTypeHash[alarmType],
    },
    {
      title: '报警时间',
      dataIndex: 'alarmTime',
    },
    {
      title: '教练姓名',
      dataIndex: 'coachName',
    },
    {
      title: '教练手机',
      dataIndex: 'mobile',
      render: (value: any, record: any) => _handlePhone(value),
    },
    {
      title: '带教学员',
      dataIndex: 'studentName',
    },
    {
      title: '带教学员',
      dataIndex: 'photoAddress',
      render: (photoAddress: string) => {
        return (
          photoAddress && (
            <Popover content={<img src={photoAddress} alt={''} style={{ width: 500 }} />}>
              <div style={{ color: '#f00', cursor: 'pointer' }}>查看照片</div>
            </Popover>
          )
        );
      },
    },
  ];

  return (
    <div>
      <Search
        loading={tableProps.loading}
        filters={[
          { type: 'Input', field: 'licnum', placeholder: '车牌号码' },
          { type: 'Input', field: 'coachName', placeholder: '教练姓名' },
          {
            type: 'RangePicker',
            field: ['alarmTimeBegin', 'alarmTimeEnd'],
            placeholder: ['报警日期(起)', '报警日期(止)'],
          },
          {
            type: 'Select',
            field: 'alarmType',
            options: [{ value: '', label: '报警类型(全部)' }, ...useOptions('alarm_type')],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
      />

      <CustomTable columns={columns} rowKey="id" {...tableProps} />
    </div>
  );
}
