import { useState } from 'react';
import { _testResultCompare } from './_api';
import { useFetch } from 'hooks';
import { _get } from 'utils';
import { CustomTable, Loading } from 'components';
interface IProps {
  year: number;
}

export default function ExamCompareTable(props: IProps) {
  const { year } = props;
  const [data, setData] = useState<object[]>([]);
  const month = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
    '合计',
  ];
  const { isLoading } = useFetch({
    request: _testResultCompare,
    query: {
      year: String(year),
    },
    // TODO: TS 不清楚业务
    callback: (data: any) => {
      let subject2Arr: any = [];
      let subject3Arr: any = [];
      data.forEach((element: any) => {
        if (element.subject === '02') {
          subject2Arr = element.compares;
        }
        if (element.subject === '03') {
          subject3Arr = element.compares;
        }
      });
      // eslint-disable-next-line array-callback-return
      subject3Arr.map((item: any, index: number) => {
        subject2Arr[index]['passSubject3'] = _get(item, 'pass', '');
        subject2Arr[index]['passPrevSubject3'] = _get(item, 'passPrev', '');
        subject2Arr[index]['passRateSubject3'] = _get(item, 'passRate', '');
        subject2Arr[index]['passRatePrevSubject3'] = _get(item, 'passRatePrev', '');
        subject2Arr[index]['rateGrowthSubject3'] = _get(item, 'rateGrowth', '');
        subject2Arr[index]['totalSubject3'] = _get(item, 'total', '');
        subject2Arr[index]['totalPrevSubject3'] = _get(item, 'totalPrev', '');
        subject2Arr[index]['monthLabel'] = month[index];
      });
      setData(subject2Arr);
    },
  });

  function commonFormat(val: string | null) {
    return val != null && val !== '' ? val + '%' : '';
  }

  const columns = [
    { title: '月份', dataIndex: 'monthLabel' },
    {
      title: '科二考试',
      children: [
        {
          title: Number(year) - 1,
          children: [
            { title: '参考人数', dataIndex: 'totalPrev' },
            { title: '合格', dataIndex: 'passPrev' },
            {
              title: '合格率',
              dataIndex: 'passRatePrev',
              render: commonFormat,
            },
          ],
        },
        {
          title: year,
          children: [
            { title: '参考人数', dataIndex: 'total' },
            { title: '合格', dataIndex: 'pass' },
            { title: '合格率', dataIndex: 'passRate', render: commonFormat },
          ],
        },
        { title: '', children: [{ title: '合格率同比增长', dataIndex: 'rateGrowth', render: commonFormat }] },
      ],
    },
    {
      title: '科三考试',
      children: [
        {
          title: Number(year) - 1,
          children: [
            { title: '参考人数', dataIndex: 'totalPrevSubject3' },
            { title: '合格', dataIndex: 'passPrevSubject3' },
            { title: '合格率', dataIndex: 'passRatePrevSubject3', render: commonFormat },
          ],
        },
        {
          title: year,
          children: [
            { title: '参考人数', dataIndex: 'totalSubject3' },
            { title: '合格', dataIndex: 'passSubject3' },
            { title: '合格率', dataIndex: 'passRateSubject3', render: commonFormat },
          ],
        },
        { title: '', children: [{ title: '合格率同比增长', dataIndex: 'rateGrowthSubject3', render: commonFormat }] },
      ],
    },
  ];
  return (
    <div>
      <div className="mb10">统计对比年份：{year + ' : ' + (Number(year) - 1)}</div>

      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={data}
        rowKey="month"
        pagination={false}
        scroll={{ x: 1200, y: document.body.clientHeight - 450 }}
      />
    </div>
  );
}
