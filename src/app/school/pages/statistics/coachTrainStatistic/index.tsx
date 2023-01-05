// 带教学时统计

import { Tabs, DatePicker } from 'antd';
import { useState } from 'react';
import CoachTrainPanel from './CoachTrainPanel';
import moment from 'moment';
const { RangePicker } = DatePicker;

export default function CoachTrainStatistic() {
  const { TabPane } = Tabs;
  const [autoTime, setAutoTime] = useState(['', '']);
  const tabs = [
    { tab: '近一周', statisticType: 0 },
    { tab: '近一月', statisticType: 1 },
    { tab: '近三月', statisticType: 2 },
    { tab: '近一年', statisticType: 3 },
    {
      tab: (
        <RangePicker
          onChange={(date: any, dateString: any) => setAutoTime(dateString)}
          value={[
            autoTime[0] ? moment(autoTime[0], 'YYYY-MM-DD') : null,
            autoTime[1] ? moment(autoTime[1], 'YYYY-MM-DD') : null,
          ]}
        />
      ),
      statisticType: autoTime,
    },
  ];

  return (
    <Tabs
      size="small"
      defaultActiveKey="0"
      onChange={(val: string) => {
        !isNaN(Number(val)) && setAutoTime(['', '']);
      }}
    >
      {tabs.map((x: any) => (
        <TabPane tab={x.tab} key={x.statisticType}>
          <CoachTrainPanel statisticType={x.statisticType} />
        </TabPane>
      ))}
    </Tabs>
  );
}
