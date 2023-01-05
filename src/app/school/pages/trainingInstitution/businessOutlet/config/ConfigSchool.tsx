import { Modal, Tabs } from 'antd';
import CourseTeach from './CourseTeach';
import SimulateTeach from './SimulateTeach';
const { TabPane } = Tabs;

export default function ConfigSchool(props: any) {
  const { onCancel, currentId, title, onOk, classroomTheory, simulation } = props;

  return (
    <Modal width={1300} visible title={title} maskClosable={false} onCancel={onCancel} footer={null}>
      <Tabs defaultActiveKey="y1">
        {classroomTheory && (
          <TabPane tab="课堂理论教学" key="1">
            <CourseTeach currentId={currentId} onCancel={onCancel} onOk={onOk} />
          </TabPane>
        )}
        {simulation && (
          <TabPane tab="模拟教学" key="2">
            <SimulateTeach currentId={currentId} onCancel={onCancel} onOk={onOk} />
          </TabPane>
        )}
      </Tabs>
    </Modal>
  );
}
