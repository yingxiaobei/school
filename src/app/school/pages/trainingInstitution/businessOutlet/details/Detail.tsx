import { Modal, Row, Tabs } from 'antd';
import { useFetch } from 'hooks';
import { _details } from '../_api';
import { _get } from 'utils';
import { ItemCol, Loading, Title } from 'components';
import ClassRoomTable from './ClassRoomTable';
import CoachTable from './CoachTable';
import CoachCarTable from './CoachCarTable';
import ClassTheoryTeachingTable from './ClassTheoryTeachingTable';

const { TabPane } = Tabs;
export default function Details(props: any) {
  const { onCancel, currentRecord } = props;

  const { data, isLoading } = useFetch({
    query: {
      id: _get(currentRecord, 'sbnid'),
    },
    request: _details,
  });

  return (
    <Modal visible width={1100} title={'营业网点详情'} maskClosable={false} onCancel={onCancel} footer={null}>
      {isLoading && <Loading />}
      {!isLoading && (
        <Tabs defaultActiveKey="1">
          <TabPane tab="基本信息" key="1">
            <Title>基本信息</Title>
            <Row>
              <ItemCol span={8} label="网点名称">
                {_get(currentRecord, 'branchname')}
              </ItemCol>
              <ItemCol span={8} label="网点简称">
                {_get(currentRecord, 'shortname')}
              </ItemCol>
              <ItemCol span={8} label="网点地址">
                {_get(currentRecord, 'address')}
              </ItemCol>
            </Row>

            <Title>联系方式</Title>
            <Row>
              <ItemCol span={8} label="联系人">
                {_get(currentRecord, 'contact')}
              </ItemCol>
              <ItemCol span={8} label="联系电话">
                {_get(currentRecord, 'phone')}
              </ItemCol>
            </Row>

            <Title>权限管理</Title>
            <Row>
              <ItemCol span={8} label="使用权限部门">
                {_get(data, 'orgNames')}
              </ItemCol>
            </Row>
          </TabPane>

          <TabPane tab="教室" key="2">
            <ClassRoomTable dataSource={_get(data, 'schClassroomDtos', [])} />
          </TabPane>

          <TabPane tab="教练员" key="3">
            <CoachTable dataSource={_get(data, 'schNetworkCoaCoachDtos', [])} />
          </TabPane>

          <TabPane tab="教练车" key="4">
            <CoachCarTable dataSource={_get(data, 'schNetworkCarDtos', [])} />
          </TabPane>

          <TabPane tab="课堂理论教学" key="5">
            <ClassTheoryTeachingTable dataSource={_get(data, 'schNetworkLilunSchoolDtos', [])} />
          </TabPane>

          <TabPane tab="模拟教学" key="6">
            <ClassTheoryTeachingTable dataSource={_get(data, 'schNetworkMoniSchoolDtos', [])} />
          </TabPane>
        </Tabs>
      )}
    </Modal>
  );
}
