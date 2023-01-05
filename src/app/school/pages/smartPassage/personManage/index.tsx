import React from 'react';
import { Tabs } from 'antd';
import Others from './others';
import Students from './students';

const { TabPane } = Tabs;

const PersonManage = () => {
  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="其它人员" key="1">
        <Others />
      </TabPane>
      <TabPane tab="学员" key="2">
        <Students />
      </TabPane>
    </Tabs>
  );
};

export default PersonManage;
