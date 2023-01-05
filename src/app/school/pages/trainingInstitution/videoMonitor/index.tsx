import React from 'react';
import { Tabs } from 'antd';
import { useAuth } from 'hooks';
import VideoPlayback from './VideoPlayback';
import VideoMonitor from './VideoMonitor';
const { TabPane } = Tabs;

const Index = () => {
  const isShowPlayBack = useAuth('videoMonitor/videoMonitor:VideoPlayBack');
  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="视频监控" key="1">
        <VideoMonitor />
      </TabPane>
      {isShowPlayBack && (
        <TabPane tab="视频回放" key="2">
          <VideoPlayback />
        </TabPane>
      )}
    </Tabs>
  );
};

export default Index;
