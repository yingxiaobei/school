import { useOptions, useTablePro } from 'hooks';
import { _get, _handleIdCard } from 'utils';
import { _getTestResultList } from './_api';
import { CustomTable, Search } from 'components';
import { _getCoachList } from 'api';
import { useEffect } from 'react';
interface IProps {
  period: string;
  handleExport(pageDate: any): void;
}

export default function TestResultList(props: IProps) {
  const { period, handleExport } = props;
  const { tableProps, search, _refreshTable, _handleSearch, _data } = useTablePro({
    request: _getTestResultList,
    extraParams:
      typeof period === 'string'
        ? {
            period: period,
          }
        : { startDate: period[0], endDate: period[1] },
  });

  const columns = [
    { title: '账号', dataIndex: 'phone', width: 120 },
    { title: '姓名', dataIndex: 'studentName', width: 80 },
    {
      title: '证件号',
      dataIndex: 'idNumber',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    { title: '性别', dataIndex: 'sex', width: 80 },
    { title: '车型', dataIndex: 'testCarModel', width: 80 },
    { title: '报名日期', dataIndex: 'applyDateTime', width: 80 },
    { title: '班级', dataIndex: 'package_NAME', width: 100 },
    { title: '教练', dataIndex: 'coaName', width: 80 },
    { title: '考试科目', dataIndex: 'testSubject', width: 80 },
    { title: '考出日期', dataIndex: 'testDateTime', width: 140 },
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => handleExport(tableProps?.pagination), [
    tableProps?.pagination?.pageSize,
    tableProps?.pagination?.current,
  ]);

  return (
    <>
      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'Select',
            field: 'testSubject',
            options: [{ label: '科目(全部)', value: '' }, ...useOptions('trans_part_type')],
          },
          {
            type: 'SimpleSelectOfCoach',
            field: 'cid',
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        simpleCoachRequest={_getCoachList}
      />

      <div style={{ marginBottom: 10, fontSize: 16 }}>
        {'日期区间：' + _get(_data, 'startDate', '') + ' - ' + _get(_data, 'endDate', '')}
      </div>
      <CustomTable
        {...tableProps}
        columns={columns}
        rowKey={() => Math.random()}
        scroll={{ y: document.body.clientHeight - 460 }}
      />
    </>
  );
}
