import { useState } from 'react';
import { _testResultCompare } from './_api';
import { useFetch } from 'hooks';
import { BarChart, XAxis, YAxis, Tooltip, Legend, Bar, Label } from 'recharts';
import { Title } from 'components';
import { _get } from 'utils';

interface IProps {
  year: number;
}

export default function ExamCompareChart(props: IProps) {
  const { year } = props;
  const [dataSource, setDataSource] = useState([]);

  useFetch({
    request: _testResultCompare,
    query: {
      year: String(year),
    },
    callback: (data) => {
      // TODO: TS
      // eslint-disable-next-line array-callback-return
      data.map((item: any) => {
        item.compares = _get(item, 'compares', []).filter((i: any) => {
          return _get(i, 'month', '') !== '13'; //month=13代表合计的数据，在图表中需要去除
        });
      });
      setDataSource(data);
    },
  });

  return (
    <div style={{ height: document.body.clientHeight - 270, overflow: 'auto' }}>
      {/* TODO: TS */}
      {dataSource.map((item: any, index: number) => {
        return (
          <div key={index}>
            <Title>{_get(item, 'subject', '') === '02' ? '科目二考试通过率' : '科目三考试通过率'}</Title>
            <BarChart width={730} height={250} data={item.compares}>
              <XAxis dataKey="month">
                <Label value="月份" offset={0} position="insideBottom" />
              </XAxis>
              <YAxis label={{ value: '通过率%', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend verticalAlign="top" />
              <Bar dataKey="passRatePrev" fill="#ff0000" name={Number(year) - 1} />
              <Bar dataKey="passRate" fill="#00ff00" name={year} />
            </BarChart>
          </div>
        );
      })}
    </div>
  );
}
