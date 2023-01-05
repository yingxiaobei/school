import { memo } from 'react';
import { ColumnsType } from 'antd/lib/table';
import { useTablePro } from 'hooks';
import { _getStudentTestInfo } from '../_api';
import { CustomTable } from 'components';

interface Props {
  sid: string;
}

export type PageList = {
  id: string;
  testSubject: string;
  appointDate: string;
  testDate: string;
  coachname: string;
  testScores: string;
  testResult: string;
  testPlace: string;
  [key: string]: any;
};

function ExamInfo({ sid }: Props) {
  const { tableProps } = useTablePro({
    request: _getStudentTestInfo,
    initialSearch: {
      sid,
      limit: 10,
      page: 1,
    },
  });

  const { pagination } = tableProps;

  const columns: ColumnsType<PageList> = [
    {
      title: '考试科目',
      dataIndex: 'testSubject',
    },
    {
      title: '预约日期',
      dataIndex: 'appointDate',
    },
    {
      title: '考试日期',
      dataIndex: 'testDate',
    },
    {
      title: '教练',
      dataIndex: 'coachname',
    },
    {
      title: '考试成绩',
      dataIndex: 'testScores',
    },
    {
      title: '考试结果',
      dataIndex: 'testResult',
    },
    {
      title: '考试场地',
      dataIndex: 'testPlace',
    },
  ];

  return (
    <>
      <CustomTable {...tableProps} columns={columns} rowKey="id" />
    </>
  );
}

export default memo(ExamInfo);
