import { Tabs, Drawer } from 'antd';
import BaseInfo from './BaseInfo';
import PhotoRecord from './PhotoRecord';

const { TabPane } = Tabs;

export default function Detail(props: any) {
  const { onCancel, currentRecord, visible, carHash, address = '' } = props;

  return (
    <Drawer width={800} destroyOnClose visible={visible} title={'详情'} onClose={onCancel} footer={null}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="基本信息" key="1">
          <BaseInfo currentRecord={currentRecord} carHash={carHash} address={address} />
        </TabPane>
        <TabPane tab="拍照记录" key="2">
          <PhotoRecord currentRecord={currentRecord} />
        </TabPane>
      </Tabs>
    </Drawer>
  );
}
