import { Modal, Button, Input, Form, message } from 'antd';
import { _forgetPassword } from './_api';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { _get } from 'utils';
import { _getCode } from 'app/yantai/_api';

interface IProps {
  onCancel(): void;
}

export default function LoginModal(props: IProps) {
  const { onCancel } = props;
  const [form] = Form.useForm();

  async function _onFinish(values: any) {
    const res = await _forgetPassword({
      userName: _get(values, 'mobilePhone'),
      ...values,
    });
    if (_get(res, 'code') === 200) {
      onCancel();
    } else {
      message.error(_get(res, 'message'));
    }
  }

  return (
    <Modal visible title={'登录'} onCancel={onCancel} footer={null}>
      <Form form={form} onFinish={_onFinish}>
        <Form.Item
          name="mobilePhone"
          rules={[
            {
              required: false,
              message: '请输入手机号！',
            },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="手机号" />
        </Form.Item>
        <Form.Item>
          <Form.Item
            name="code"
            rules={[
              {
                required: false,
                message: '请输入验证码！',
              },
            ]}
          >
            <Input prefix={<LockOutlined />} placeholder="验证码" />
          </Form.Item>
          <Button
            onClick={async () => {
              await _getCode({
                mobilePhone: form.getFieldValue('mobilePhone'),
              });
            }}
          >
            获取验证码
          </Button>
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: false,
              message: '请输入密码！',
            },
          ]}
        >
          <Input prefix={<LockOutlined />} placeholder="密码" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="full-width">
            找回密码
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
