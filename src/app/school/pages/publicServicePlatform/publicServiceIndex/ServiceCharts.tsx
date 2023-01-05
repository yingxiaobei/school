import { XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from 'recharts';
import { _queryStatisticCityStudentDay } from './_api';
import { useFetch } from 'hooks';
import { _get } from 'utils';

interface IProps {
  timeLine: string;
}

export default function ServiceCharts(props: IProps) {
  const { timeLine } = props;
  const { data = [] } = useFetch({
    request: _queryStatisticCityStudentDay,
    query: {
      queryDate: timeLine,
      stuStatus: '00', //00-报名
    },
  });

  const studentData = data.map((item: { statisticDate: string; stuNum: number }) => {
    return {
      statisticDate: item.statisticDate,
      stuNum: item.stuNum / 1000,
    };
  });

  const CustomTooltip: any = ({
    active,
    payload,
  }: {
    active: boolean;
    payload: { value: number }[];
  }): React.ReactNode => {
    if (active && _get(payload, 'length', 0) > 0) {
      return (
        <div className="tooltipBox">
          <div>{_get(payload, '0.value')}</div>
          <div>学员数量</div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <AreaChart width={1200} height={400} data={studentData} margin={{ top: 40, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="statisticDate" />
        <YAxis label={{ value: '单位：千', position: 'insideTop', offset: -30 }} />
        <Tooltip content={<CustomTooltip />} offset={-80} />
        <linearGradient x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
        </linearGradient>
        <Area type="monotone" dataKey="stuNum" stroke="#fefefe" fill="#f9dcdc" activeDot={{ fill: '#F3302B', r: 10 }} />
      </AreaChart>
    </>
  );
}
