import { Modal, Input, Form, message } from 'antd';
import { _setPassword, _getUserId } from '../_api';
import { Auth, _get } from 'utils';
import { RULES } from 'constants/rules';

interface IProps {
  onCancel(): void;
}

export default function LoginModal(props: IProps) {
  const { onCancel } = props;
  const [form] = Form.useForm();

  return (
    <Modal
      visible
      title={'密码修改'}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then(async (values) => {
          if (_get(values, 'newPassword', '') !== _get(values, 'surePassword', '')) {
            message.error('新密码不同');
            return;
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
        });
      }}
    >
      <Form form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <Form.Item
          label="旧密码"
          name="oldPassword"
          rules={[
            {
              required: true,
              message: '请输入旧密码！',
            },
          ]}
        >
          <Input type="password" />
        </Form.Item>

        <Form.Item
          label="新密码"
          name="newPassword"
          rules={[
            {
              required: true,
              message: '请输入新密码！',
            },
            RULES.PASSWORD,
          ]}
        >
          <Input type="password" />
        </Form.Item>

        <Form.Item
          label="再次输入新密码"
          name="surePassword"
          rules={[
            {
              required: true,
              message: '再次输入新密码不能为空！',
            },
            RULES.PASSWORD,
          ]}
        >
          <Input type="password" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
