import { useState } from 'react';
import { Modal, Button, Input, Form, message } from 'antd';
import { _getLogin, _forgetPassword } from '../_api';
import { _get } from 'utils';
import { PORTAL_TEMPLATE_CODE, PORTAL_SIGN_NAME, PORTAL_APP_CODE } from 'constants/env';
import { AxiosResponse } from 'axios';
import { useCountdown } from 'hooks';
import { RULES } from 'constants/rules';
import { _getCode } from 'app/yantai/_api';

interface IProps {
  onCancel(): void;
}

export default function LoginModal(props: IProps) {
  const { onCancel } = props;
  const [form] = Form.useForm();
  const { count, isCounting, setIsCounting } = useCountdown(60);
  const [loading, setLoading] = useState(false);

  interface IProps {
    mobilePhone: string;
    code: string;
    password: string;
  }

  return (
    <Modal
      visible
      title={'找回密码'}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then(
          async (values: IProps): Promise<AxiosResponse | undefined | void> => {
            if (_get(values, 'password') !== _get(values, 'surePassword')) {
              message.error('密码与再次输入密码必须相同');
              return;
            }

            const res = await _forgetPassword({
              userName: _get(values, 'mobilePhone', ''),
              mobilePhone: _get(values, 'mobilePhone', ''),
              code: _get(values, 'code', ''),
              password: _get(values, 'password', ''),
            });
            if (_get(res, 'code') === 200) {
              onCancel();
            }
          },
        );
      }}
    >
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item
          name="mobilePhone"
          label={'手机号'}
          rules={[
            {
              whitespace: true,
              required: true,
              message: '请输入手机号！',
            },
            RULES.TEL_11,
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="code"
          label={'验证码'}
          rules={[
            {
              required: true,
              message: '请输入验证码！',
            },
          ]}
        >
          <div className="flex">
            <Input autoComplete="new-password" className="mr10" style={{ width: 128 }} />
            <Button
              type="primary"
              loading={loading}
              disabled={isCounting}
              onClick={() => {
                if (!form.getFieldValue('mobilePhone')) {
                  message.error('请输入手机号');
                  return;
                }
                setLoading(true);
                _getCode({
                  mobilePhone: form.getFieldValue('mobilePhone'),
                });

                setLoading(false);
                setIsCounting(true);
              }}
            >
              {isCounting ? `重新获取(${count})` : '获取验证码'}
            </Button>
          </div>
        </Form.Item>
        <Form.Item
          name="password"
          label={'密码'}
          rules={[
            {
              required: true,
              message: '请输入密码！',
            },
            RULES.PASSWORD,
          ]}
        >
          <Input type="password" autoComplete="new-password" />
        </Form.Item>

        <Form.Item
          name="surePassword"
          label={'再次输入密码'}
          rules={[
            {
              required: true,
              message: '请再次输入密码！',
            },
            RULES.PASSWORD,
          ]}
        >
          <Input type="password" autoComplete="new-password" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
