import { useTablePro, useVisible } from 'hooks';
import { _getList } from './_api';
import { _getStudentList } from 'api';
import { AuthButton, CustomTable, Search } from 'components';
import Details from 'app/school/pages/student/studentInfo/StudentInfoDetail';
import { _get, _handleIdCard } from 'utils';
import { useRef } from 'react';

export default function PeriodManagement() {
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const { tableProps, search, _refreshTable, _handleSearch, setCurrentRecord, currentRecord } = useTablePro({
    request: _getList,
  });
  const searchRef = useRef(null as any);
  const columns = [
    { title: '学员姓名', dataIndex: 'name' },
    {
      title: '证件号',
      dataIndex: 'idcard',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    { title: '入学年份', dataIndex: 'periodYear' },
    { title: '期数', dataIndex: 'periodId' },
    { title: '期数学号', dataIndex: 'periodNum' },
    {
      title: '操作',
      dataIndex: '—',
      render: (_: void, record: any) => (
        <>
          <AuthButton
            authId="student/periodManagement:btn1"
            onClick={() => {
              _switchDetailsVisible();
              setCurrentRecord(record);
            }}
            className="operation-button"
          >
            详情
          </AuthButton>
        </>
      ),
    },
  ];
  return (
    <div>
      {detailsVisible && (
        <Details onCancel={_switchDetailsVisible} currentRecord={currentRecord} sid={_get(currentRecord, 'sid', '')} />
      )}
      <Search
        loading={tableProps.loading}
        ref={searchRef}
        filters={[
          {
            type: 'SimpleSelectOfStudent',
            field: 'sid',
          },
          { type: 'Input', field: 'periodYear', placeholder: '入学年份' },
          { type: 'Input', field: 'periodId', placeholder: '期数' },
          { type: 'Input', field: 'periodNum', placeholder: '期数学号' },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          _refreshTable();
        }}
        simpleStudentRequest={_getStudentList}
      />
      <CustomTable {...tableProps} columns={columns} rowKey="sid" scroll={{ y: document.body.clientHeight - 300 }} />
    </div>
  );
}
