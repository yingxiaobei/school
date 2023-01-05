import { Tabs } from 'antd';
import CarTypeStatistic from './CarTypeStatistic';

export default function CarTypePanel() {
  const { TabPane } = Tabs;
  const tabs = [
    { tab: '近一周', period: 'week' },
    { tab: '近一月', period: 'month' },
    { tab: '近三月', period: 'trimonth' },
    { tab: '近一年', period: 'year' },
  ];
  return (
    <Tabs defaultActiveKey="week" size="small">
      {tabs.map((x: { tab: string; period: string }) => (
        <TabPane tab={x.tab} key={x.period}>
          <CarTypeStatistic period={x.period} />
        </TabPane>
      ))}
    </Tabs>
  );
}
