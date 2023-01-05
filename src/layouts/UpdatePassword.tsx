import { Modal, Button, Input, Form, message } from 'antd';
import { _setPassword, _getUserId } from './_api';
import { Auth, _get } from 'utils';
import { RULES } from 'constants/rules';

interface IProps {
  onCancel(): void;
}

export default function LoginModal(props: IProps) {
  const { onCancel } = props;

  async function _onFinish(values: any) {
    if (_get(values, 'newPassword', '') !== _get(values, 'surePassword', '')) {
      message.error('新密码不同');
    }

    const userInfo = await _getUserId({ username: Auth.get('username') as string });

    const res = await _setPassword({
      id: _get(userInfo, 'data.id'),
      newPassword: _get(values, 'newPassword', ''),
      oldPassword: _get(values, 'oldPassword', ''),
    });
    if (_get(res, 'code') === 200) {
      onCancel();
    } else {
      message.error(_get(res, 'message'));
    }
  }

  return (
    <Modal visible title={'密码修改'} onCancel={onCancel} footer={null}>
      <Form onFinish={_onFinish}>
        <Form.Item
          label="旧密码"
          name="oldPassword"
          rules={[
            {
              required: false,
              message: '请输入旧密码！',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="新密码"
          name="newPassword"
          rules={[
            {
              required: false,
              message: '请输入新密码！',
            },
            RULES.PASSWORD,
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="再次输入新密码"
          name="surePassword"
          rules={[
            {
              required: false,
              message: '再次输入新密码不能为空！',
            },
            RULES.PASSWORD,
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="full-width">
            提交
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
