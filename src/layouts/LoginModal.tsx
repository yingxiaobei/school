import { useContext } from 'react';
import { Modal, Button, Input, Form, message } from 'antd';
import { _getImgUrl, _getCertify } from './_api';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Auth, _get } from 'utils';
import GlobalContext from 'globalContext';
import { useVisible } from 'hooks';
import FindPassword from './FindPassword';
import UpdatePassword from './UpdatePassword';
import Certify from './Certify';
import { _getLogin } from 'app/yantai/_api';

interface IProps {
  onCancel(): void;
}

export default function LoginModal(props: IProps) {
  const { onCancel } = props;
  const { $setToken } = useContext(GlobalContext);
  const [visible, _switchVisible] = useVisible();
  const [updateVisible, _switchUpdateVisible] = useVisible();
  const [certifyVisible, _setCerTifyVisible] = useVisible();

  async function _onFinish(values: any) {
    const res = await _getLogin(values);
    if (res?.access_token) {
      const token: string = _get(res, 'access_token');
      Auth.set('token', token);
      Auth.set('username', _get(values, 'username', ''));
      $setToken(token);
      // onCancel();
      // 认证
      _getCertify().then((certyfyData: any) => {
        console.log(certyfyData);
        if (_get(certyfyData, 'data.companyId')) {
          _setCerTifyVisible();
        }
      });
    } else {
      message.error('用户名密码不正确');
    }
  }

  return <Certify onCancel={_setCerTifyVisible} />;

  return (
    <>
      {visible && <FindPassword onCancel={_switchVisible} />}

      {updateVisible && <UpdatePassword onCancel={_switchUpdateVisible} />}

      {certifyVisible && <Certify onCancel={_setCerTifyVisible} />}

      <Modal visible title={'登录'} onCancel={onCancel} footer={null}>
        <Form onFinish={_onFinish}>
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: '请输入用户名！',
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: '请输入密码！',
              },
            ]}
          >
            <Input prefix={<LockOutlined />} type="password" placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="full-width">
              登录
            </Button>
          </Form.Item>

          <Form.Item>
            <Button type="primary" style={{ margin: 20 }} onClick={_switchVisible}>
              忘记密码
            </Button>

            <Button type="primary" style={{ margin: 20 }} onClick={_switchUpdateVisible}>
              密码修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
