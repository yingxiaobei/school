// 考试情况同比

import { Tabs } from 'antd';
import ExamComparePanel from './ExamComparePanel';
import moment from 'moment';

function ExamResultCompare() {
  const { TabPane } = Tabs;
  const currentYear = moment().format('YYYY');
  const tabs = [];
  const statisticYear = 4; //展示近四年
  for (let i = 0; i < statisticYear; i++) {
    tabs.push({ tab: Number(currentYear) - i });
  }
  return (
    <Tabs defaultActiveKey={currentYear} size="small">
      {tabs.map((x: { tab: number }) => (
        <TabPane tab={x.tab} key={x.tab}>
          <ExamComparePanel year={x.tab} />
        </TabPane>
      ))}
    </Tabs>
  );
}

export default ExamResultCompare;
