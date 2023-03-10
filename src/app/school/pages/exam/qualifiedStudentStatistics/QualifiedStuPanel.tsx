import { Tabs } from 'antd';
import TestResultList from './TestResultList';
import TestResultStatistics from './TestResultStatistics';

interface IProps {
  period: string;
  handleExport(pageDate: any): void;
}

export default function QualifiedStuPanel(props: IProps) {
  const { period, handleExport } = props;
  const { TabPane } = Tabs;
  return (
    <>
      <Tabs type="card" size="small">
        <TabPane tab="ๅ่กจ" key="1">
          <TestResultList period={period} handleExport={handleExport} />
        </TabPane>
        <TabPane tab="ๅๆ" key="2">
          <TestResultStatistics period={period} />
        </TabPane>
      </Tabs>
    </>
  );
}
