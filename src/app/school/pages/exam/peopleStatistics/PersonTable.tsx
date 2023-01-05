import { useTablePro } from 'hooks';
import { _get } from 'utils';
import { mergeCells } from '../examPassRate/utils';
import { AxiosResponse } from 'axios';
import { CustomTable } from 'components';

interface IProps {
  request: (
    query: IPaginationParams & { period: 'week' | 'month' | 'trimonth' | 'year' },
  ) => Promise<AxiosResponse | void | undefined>;
  period: string;
  personType: string;
}

export default function PersonTable(props: IProps) {
  const { request, period, personType } = props;

  const { tableProps, _data } = useTablePro({
    request,
    extraParams: {
      period,
    },
  });

  const data = _get(tableProps, 'dataSource', []);

  // 科目-合格情况-公用
  function percentColumns(subject1_pass: string, subject1_fail: string, subject1_pass_rate: string) {
    return [
      { title: '合格', dataIndex: subject1_pass },
      { title: '不合格', dataIndex: subject1_fail },
      {
        title: '合格率',
        dataIndex: subject1_pass_rate,
        render: (subject1_pass_rate: number) =>
          subject1_pass_rate || subject1_pass_rate === 0 ? subject1_pass_rate + '%' : '-',
      },
    ];
  }

  // Columns-公用部分
  const columns = [
    { title: '新注册', dataIndex: 'stu_register' },
    {
      title: '科目一',
      dataIndex: '',
      children: percentColumns('subject1_stu_pass', 'subject1_stu_fail', 'subject1_pass_rate'),
    },
    {
      title: '科目二',
      dataIndex: '',
      children: percentColumns('subject2_stu_pass', 'subject2_stu_fail', 'subject2_pass_rate'),
    },
    {
      title: '科目三',
      dataIndex: '',
      children: percentColumns('subject3_stu_pass', 'subject3_stu_fail', 'subject3_pass_rate'),
    },
    {
      title: '科目四',
      dataIndex: '',
      children: percentColumns('subject4_stu_pass', 'subject4_stu_fail', 'subject4_pass_rate'),
    },
    { title: '退学', dataIndex: 'stu_retire' },
    { title: '注销', dataIndex: 'stu_cancel' },
    { title: '毕业', dataIndex: 'stu_graduate' },
  ];

  // Columns-不同部分(根据人员类型)
  let tabColumns: object[] = [];

  // 车型
  if (personType === 'car') {
    tabColumns = [
      {
        title: '月份',
        dataIndex: 'yearmonth',
        render: (yearmonth: string, _: void, index: number) => {
          const obj: { children: string; props: { [key: string]: any } } = {
            children: yearmonth,
            props: {},
          };
          obj.props.rowSpan = mergeCells(yearmonth, data, 'yearmonth', index);
          return obj;
        },
      },
      {
        title: '车型',
        dataIndex: 'car_type',
      },
    ];
  }

  // 教练
  if (personType === 'coach') {
    tabColumns = [
      {
        title: '教练员',
        dataIndex: 'coaname',
      },
      {
        title: '车型',
        dataIndex: 'car_type',
      },
    ];
  }

  // 年龄
  // 年龄对应表
  const AgeHash: { [key: string]: string } = {
    '1': '20以下',
    '2': '20-29',
    '3': '30-39',
    '4': '40-49',
    '5': '50及以上',
  };
  if (personType === 'age') {
    tabColumns = [
      {
        title: '月份',
        dataIndex: 'yearmonth',
        render: (yearmonth: string, _: void, index: number) => {
          const obj: { children: string; props: { [key: string]: any } } = {
            children: yearmonth,
            props: {},
          };
          obj.props.rowSpan = mergeCells(yearmonth, data, 'yearmonth', index);
          return obj;
        },
      },
      {
        title: '年龄',
        dataIndex: 'title',
        render: (title: string) => AgeHash[title],
      },
    ];
  }

  return (
    <>
      <div>统计日期：{_get(_data, 'startDate', '') + '-' + _get(_data, 'endDate', '')}</div>

      <CustomTable
        style={{ margin: '20px 0' }}
        columns={[{ render: () => '合计' }, ...columns]}
        dataSource={[_get(_data, 'summary', {})]}
        pagination={false}
        bordered
        rowKey={() => Math.random()}
      />

      <CustomTable
        columns={[...tabColumns, ...columns]}
        scroll={{ x: 1000, y: document?.body?.clientHeight - 560 }}
        rowKey={() => Math.random()}
        {...tableProps}
      />
    </>
  );
}
