import { Drawer, Tabs } from 'antd';
import AreaInfo from './components/AreaInfo';
import ChangeRecord from 'components/ChangeRecord';
import { _regionPageListKeyinfoChange } from './_api';
const { TabPane } = Tabs;

interface AreaDetailProps {
  onCancel: () => void;
  currentId: string | null;
}

export default function AreaDetail({ onCancel, currentId }: AreaDetailProps) {
  return (
    <Drawer
      visible
      width={1100}
      title={'教学区域详情'}
      maskClosable={false}
      onClose={onCancel}
      className="detailModal"
      footer={null}
    >
      <Tabs defaultActiveKey="areaInfo">
        <TabPane tab="车辆信息" key="areaInfo">
          <AreaInfo currentId={currentId} />
        </TabPane>
        <TabPane tab="变更记录" key="changeRecord">
          <ChangeRecord id={currentId} paramsKey={'rid'} api={_regionPageListKeyinfoChange} />
        </TabPane>
      </Tabs>
    </Drawer>
  );
}
