import { useRef, useState } from 'react';
import { _getExamList, _getCoachList, _exportExam } from './_api';
import { _getStudentList } from 'api';
import { useTablePro, useOptions, useVisible } from 'hooks';
import { Search, ImportFile, AuthButton, CustomTable, ButtonContainer } from 'components';
import AddOrEdit from './AddOrEdit';
import moment from 'moment';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { EXAM_PREFIX } from 'constants/env';
import { downloadFile, generateIdForDataSource, getTableMaxHeightRef, _get, _handleIdCard } from 'utils';

export default function ExamResult() {
  const searchRef = useRef(null as any);
  const { tableProps, search, _refreshTable, _handleSearch } = useTablePro({
    request: _getExamList,
    dataSourceFormatter: (dataSource: object[]) => generateIdForDataSource(dataSource),
    initialSearch: {
      startDate: moment().subtract(30, 'day').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
    },
  });
  const [visible, _switchVisible] = useVisible();
  const [fileVisible, _switchFileVisible] = useVisible();
  const [coachData, setOptionCoachData] = useState<IOption[]>([]); // 教练下拉数据

  const columns = [
    { title: '姓名', dataIndex: 'name', width: 80 },
    {
      title: '证件号',
      dataIndex: 'idCard',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    { title: '教练', dataIndex: 'coaName', width: 80 },
    { title: '考试车型', dataIndex: 'testCarModel', width: 80 },
    { title: '报名日期', dataIndex: 'applyDateTime', width: 120 },
    { title: '考试科目', dataIndex: 'testSubject', width: 80 },
    { title: '考试日期', dataIndex: 'testDate', width: 120 },
    { title: '考试成绩', dataIndex: 'testScores', width: 80 },
    { title: '考试结果', dataIndex: 'testResult', width: 80 },
    { title: '考试场地', dataIndex: 'testPlace', width: 80 },
    { title: '考试场次', dataIndex: 'testEtc', width: 80 },
    { title: '更新时间', dataIndex: 'insertTime', width: 150 },
  ];

  return (
    <>
      {visible && (
        <AddOrEdit
          onCancel={_switchVisible}
          onOk={() => {
            _switchVisible();
            _refreshTable();
          }}
        />
      )}

      {fileVisible && (
        <ImportFile onCancel={_switchFileVisible} fileUrl={`${EXAM_PREFIX}/v1/statistic/crawler/testResult/import`} />
      )}

      <Search
        loading={tableProps.loading}
        ref={searchRef}
        filters={[
          {
            type: 'SimpleSelectOfStudent',
            field: 'sid',
          },
          {
            type: 'Select',
            field: 'cid',
            options: [{ label: '教练(全部)', value: '' }, ...coachData],
            otherProps: {
              showSearch: true,
              filterOption: false,
              allowClear: true,
              onSearch: async (value: string) => {
                const res = await _getCoachList({ coachname: value });
                const carData = _get(res, 'data', []).map((x: { coachname: string; cid: string }) => {
                  return {
                    label: x.coachname,
                    value: x.cid,
                  };
                });
                setOptionCoachData(carData);
              },
            },
          },
          {
            type: 'Select',
            field: 'testCarModel',
            options: [{ label: '考试车型(全部)', value: '' }, ...useOptions('business_scope')],
          },
          {
            type: 'Select',
            field: 'testSubject',
            options: [{ label: '考试科目(全部)', value: '' }, ...useOptions('statistic_subject')],
          },
          {
            type: 'RangePicker',
            field: ['startDate', 'endDate'],
            placeholder: ['开始考试日期', '结束考试日期'],
            otherProps: {
              allowClear: false,
              defaultValue: [moment(_get(search, 'startDate')), moment(_get(search, 'endDate'))],
            },
          },
          {
            type: 'Select',
            field: 'testResult',
            options: [{ label: '考试结果(全部)', value: '' }, ...useOptions('statistic_exam_result')],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        simpleStudentRequest={_getStudentList}
        showSearchButton={false}
      />
      <ButtonContainer
        searchRef={searchRef}
        loading={tableProps.loading}
        showSearchButton={true}
        refreshTable={_refreshTable}
      >
        <AuthButton authId="exam/examResult:btn1" type="primary" onClick={_switchVisible} className="mr20 mb20">
          成绩补录
        </AuthButton>

        <AuthButton
          authId="exam/examResult:btn2"
          type="primary"
          onClick={_switchFileVisible}
          className="mr20 mb20"
          icon={<UploadOutlined />}
        >
          导入
        </AuthButton>

        <AuthButton
          authId="exam/examResult:btn3"
          type="primary"
          onClick={() => {
            _exportExam({
              limit: _get(tableProps, 'pagination.pageSize'),
              page: _get(tableProps, 'pagination.current'),
              cid: _get(search, 'cid'),
              sid: _get(search, 'sid'),
              startDate: _get(search, 'startDate'),
              endDate: _get(search, 'endDate'),
              testCarModel: _get(search, 'testCarModel'),
              testResult: _get(search, 'testResult'),
              testSubject: _get(search, 'testSubject'),
            }).then((res) => {
              downloadFile(res, '考试成绩', 'application/vnd.ms-excel', 'xlsx');
            });
          }}
          className="mr20 mb20"
          icon={<DownloadOutlined />}
        >
          导出
        </AuthButton>
      </ButtonContainer>

      <CustomTable {...tableProps} columns={columns} rowKey="id" scroll={{ y: getTableMaxHeightRef(searchRef) }} />
    </>
  );
}
