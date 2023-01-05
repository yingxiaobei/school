import { Button, Row, message } from 'antd';

import DRIVE from 'statics/images/portal/iconDrive.png';
import TIME from 'statics/images/portal/iconTime.png';
import { useHistory } from 'react-router-dom';
import { PUBLIC_URL, PORTAL_URL } from 'constants/env';
import { Auth } from 'utils';

export function Study() {
  const history = useHistory();

  return (
    <div style={{ height: 170, display: 'flex', justifyContent: 'space-between' }} className="mb20">
      <div
        style={{
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: 160,
          padding: 20,
        }}
        className="mr10"
      >
        <Row>
          <img src={DRIVE} style={{ width: 20, height: 20, marginTop: 5, marginRight: 5 }} alt="" />
          学驾管理
        </Row>
        <Button
          type="primary"
          className="mt10"
          onClick={() => {
            if (!Auth.isAuthenticated()) {
              message.info('请先登录');
              return;
            }
            if (!Auth.get('sid')) {
              message.info('请先完成认证');
              return;
            }
            window.open(PORTAL_URL);
          }}
        >
          网络学习
        </Button>
        <Button
          type="primary"
          className="mt10"
          onClick={() => {
            if (!Auth.isAuthenticated()) {
              message.info('请先登录');
              return;
            }
            if (!Auth.get('sid')) {
              message.info('请先完成认证');
              return;
            }
            history.push(`${PUBLIC_URL}teaching/teachingEvaluation`);
          }}
        >
          教学评价
        </Button>
      </div>
      <div
        style={{
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: 160,
          padding: 20,
        }}
      >
        <Row>
          <img src={TIME} style={{ width: 20, height: 20, marginTop: 5, marginRight: 5 }} alt="" />
          学时查询
        </Row>
        <Button
          type="primary"
          className="mt10"
          onClick={() => {
            window.open('http://103.239.155.248:3700/stuLogin');
          }}
        >
          学员查询
        </Button>
        <Button
          type="primary"
          className="mt10"
          onClick={() => {
            window.open('http://103.239.155.248:8666/');
          }}
        >
          驾训查询
        </Button>
      </div>
    </div>
  );
}
