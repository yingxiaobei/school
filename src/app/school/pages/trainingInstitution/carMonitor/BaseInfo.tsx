import { useState } from 'react';
import { Col, Row, List } from 'antd';
import { _get } from 'utils';
import { useHash } from 'hooks';

// FIXME: 需要重构

export default function BaseInfo(props: any) {
  const { currentRecord, carHash, address } = props;
  // address和currentRecord信息都依赖列表更新后 传参
  console.log(currentRecord, 'cur');
  const carOnlineStateHash = useHash('car_online_state'); // 在线带教状态

  return (
    <Row>
      <Col span={12}>
        <List>
          <List.Item style={{ justifyContent: 'flex-start' }}>
            <span className="w80 text-right">车牌号：</span>
            <span>{carHash[_get(currentRecord, 'carid', '')]}</span>
          </List.Item>
          <List.Item style={{ justifyContent: 'flex-start' }}>
            <span className="w80 text-right">速度：</span>
            <span>{_get(currentRecord, 'gps_speed', '')}</span>
          </List.Item>
          <List.Item style={{ justifyContent: 'flex-start' }}>
            <span className="w80 text-right">定位时间：</span>
            <span>{_get(currentRecord, 'gpstime', '')}</span>
          </List.Item>
          <List.Item style={{ justifyContent: 'flex-start' }}>
            <span className="w80 text-right">地址：</span>
            <span>{address}</span>
          </List.Item>
        </List>
      </Col>
      <Col span={12}>
        <List>
          <List.Item style={{ justifyContent: 'flex-start' }}>
            <span className="w80 text-right">车辆状态：</span>
            <span>{carOnlineStateHash[_get(currentRecord, 'activeState', '')]}</span>
          </List.Item>
          <List.Item style={{ justifyContent: 'flex-start' }}>
            <span className="w80 text-right">教练姓名：</span>
            <span>{_get(currentRecord, 'coaname', '')}</span>
          </List.Item>
          <List.Item style={{ justifyContent: 'flex-start' }}>
            <span className="w80 text-right">学员姓名：</span>
            <span>{_get(currentRecord, 'stuname', '')}</span>
          </List.Item>
          <List.Item style={{ justifyContent: 'flex-start' }}>
            <span className="w80 text-right">培训科目：</span>
            <span>{_get(currentRecord, 'examname', '')}</span>
          </List.Item>
        </List>
      </Col>
    </Row>
  );
}
