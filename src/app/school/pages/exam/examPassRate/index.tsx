// 考试成绩

import { Tabs } from 'antd';
import CoachPanel from './CoachPanel';
import CarTypePanel from './CarTypePanel';
import AgePanel from './AgePanel';

function ExamPassRate() {
  const { TabPane } = Tabs;

  return (
    <Tabs defaultActiveKey="0" size={'small'}>
      <TabPane tab="按教练" key="0">
        <CoachPanel />
      </TabPane>
      <TabPane tab="按车型" key="1">
        <CarTypePanel />
      </TabPane>
      <TabPane tab="按年龄" key="2">
        <AgePanel />
      </TabPane>
    </Tabs>
  );
}

export default ExamPassRate;
