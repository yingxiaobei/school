import { Tabs, Drawer } from 'antd';
import Info from './components/Info';
import TechnologyRate from './components/TechnologyRate';
import Detect from './components/Detect';
import Protect from './components/Protect';
import UpdateRecord from './components/UpdateRecord';
import InsuranceRecords from './components/InsuranceRecords';
import ChangeRecord from 'components/ChangeRecord';
import { _carPageListKeyinfoChange } from './_api';
import Log from 'components/Log';
import { _getRecordListNew } from 'app/school/pages/student/teachingJournal/_api';

const { TabPane } = Tabs;

export default function Details(props: any) {
  const { onCancel, carid, isHeNan = false } = props;

  return (
    <Drawer visible width={1300} title={'车辆详情'} maskClosable={false} onClose={onCancel} footer={null}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="车辆信息" key="1">
          <Info carid={carid} isHeNan={isHeNan} />
        </TabPane>
        <TabPane tab="车辆技术等级评定" key="2">
          <TechnologyRate carid={carid} />
        </TabPane>
        <TabPane tab="二级维护记录" key="3">
          <Protect carid={carid} />
        </TabPane>
        <TabPane tab="检测记录" key="4">
          <Detect carid={carid} />
        </TabPane>
        <TabPane tab="OBD审核记录" key="5">
          <UpdateRecord carid={carid} />
        </TabPane>
        <TabPane tab="保险记录" key="6">
          <InsuranceRecords carid={carid} />
        </TabPane>
        <TabPane tab="变更记录" key="7">
          <ChangeRecord id={carid} paramsKey={'carid'} api={_carPageListKeyinfoChange} />
        </TabPane>
        <TabPane tab="交互日志" key="8">
          <Log<{ rows: LogRes[]; total: number }> entityId={carid as string} api={_getRecordListNew} />
        </TabPane>
      </Tabs>
    </Drawer>
  );
}
