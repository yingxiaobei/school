//考试情况同比
import { useState } from 'react';
import { Tabs } from 'antd';
import moment from 'moment';
import ComparePanel from './ComparePanel';
import { DownOutlined } from '@ant-design/icons';

export default function StuExamCompare() {
  const { TabPane } = Tabs;
  const currentYear = moment().format('YYYY');

  const [visible, setVisible] = useState(true);
  const tabs = [];
  const statisticYear = 5; //展示近五年
  for (let i = 0; i < statisticYear; i++) {
    tabs.push({ tab: Number(currentYear) - i });
  }

  return (
    <Tabs
      defaultActiveKey={currentYear}
      onChange={(key) => {
        setVisible(key !== '6'); //自定义
      }}
    >
      {tabs.map((x: any) => (
        <TabPane tab={x.tab} key={x.tab}>
          <ComparePanel yearArr={[x.tab, Number(x.tab) - 1]} visible={visible} setVisible={setVisible} />
        </TabPane>
      ))}
      <TabPane
        tab={
          <span>
            自定义 <DownOutlined />
          </span>
        }
        key={'6'}
      >
        <ComparePanel yearArr={[]} isCustom visible={visible} setVisible={setVisible} />
      </TabPane>
    </Tabs>
  );
}
