import { message, Input, Form, Modal, Row, Button, Col } from 'antd';
import { Auth, _get } from 'utils';
import { _updatePassword } from './_api';
import { RULES } from 'constants/rules';
import { useCountdown } from 'hooks';
import { useState, useEffect, useContext } from 'react';
import { sendSMS2 } from 'api';
import _, { reject } from 'lodash';
import { _updatePasswordNew } from './_api';
import GlobalContext from 'globalContext';

export default function Edit(props) {
  const [form] = Form.useForm();
  const { title, onOk, onCancel, isPwdExpire = false } = props;
  const { count, isCounting, setIsCounting } = useCountdown(60);
  const [loading, setLoading] = useState(false); //验证码
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const { $pwdExpire } = useContext(GlobalContext);
  const [inputDisabled, setInputDisabled] = useState(true);

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };
  useEffect(() => {
    const phone = Auth.get('mobilePhone');
    if (phone && RULES.TEL_11.pattern.test(String(phone))) {
      form.setFieldsValue({ mobile: Auth.get('mobilePhone') });
      setDisabled(true);
    }
  }, []);

  useEffect(() => {
    const target = document.querySelector('#schoolRoot');
    const observe = new MutationObserver((mutations, observe) => {
      if ($pwdExpire) {
        target.style.pointerEvents = 'none';
      }
    });
    target && observe.observe(target, { attributes: true });
  }, [$pwdExpire]);

  return (
    <Modal
      maskClosable={false}
      keyboard={false} //禁用ESC关闭弹窗
      title={title}
      visible
      footer={
        <Row justify="end">
          {!isPwdExpire && <Button onClick={onCancel}>取消</Button>}
          <Button
            type="primary"
            loading={confirmLoading}
            onClick={() => {
              form.validateFields().then(async (values) => {
                if (values.newPassword === values.confirmPassword) {
                  setConfirmLoading(true);
                  const res = await _updatePasswordNew({
                    id: Auth.get('userId'),
                    code: _get(values, 'code'),
                    mobile: _get(values, 'mobile'),
                    newPassword: _get(values, 'newPassword'),
                    // oldPassword: _get(values, 'oldPassword'),
                  });
                  setConfirmLoading(false);
                  if (_get(res, 'code') === 200) {
                    onOk();
                  } else {
                    message.error(_get(res, 'message'));
                  }
                } else {
                  message.error('新密码与确认新密码必须保持一致');
                }
              });
            }}
          >
            确定
          </Button>
        </Row>
      }
      onCancel={onCancel}
      closable={!isPwdExpire}
    >
      <Form form={form} {...layout} autoComplete="off">
        <Row justify="center" className="mb10">
          为保证您的账号安全，请定期更新密码
        </Row>
        <Form.Item
          label="手机号码"
          name="mobile"
          rules={[{ whitespace: true, required: true, message: '请输入手机号码' }]}
        >
          <Input placeholder="请输入手机号" disabled={disabled} style={{ width: '100%' }} />
        </Form.Item>

        <Row justify="space-between">
          <Col span={16}>
            <Form.Item
              label="验证码"
              name="code"
              rules={[{ whitespace: true, required: true, message: '请输入验证码' }, RULES.CODE_NUMBER_4_6]}
              wrapperCol={{ span: 10 }}
              labelCol={{ span: 9 }}
              autoComplete="new-text"
            >
              <Input
                style={{ width: '240px' }}
                type="text"
                autoComplete="new-text"
                onFocus={() => {
                  setInputDisabled(false); //解决浏览器默认填入用户名密码
                }}
                readOnly={inputDisabled}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Button
              type="primary"
              loading={loading}
              disabled={isCounting}
              className="ml10"
              onClick={async (e) => {
                form.validateFields(['mobile']).then(async (res) => {
                  setLoading(true);
                  const resp = await sendSMS2({
                    mobilePhone: _get(res, 'mobile'),
                  });
                  if (_get(resp, 'code') !== 200) {
                    message.error(_get(resp, 'message'));
                    setIsCounting(false);
                    setLoading(false);
                    return reject('');
                  }
                  setLoading(false);
                  setIsCounting(true);
                });
              }}
            >
              {isCounting ? `重新获取(${count})` : '获取验证码'}
            </Button>
          </Col>
        </Row>
        {/* <Form.Item
          label="原密码"
          name="oldPassword"
          rules={[
            {
              required: true,
              whitespace: true,
              message: '请输入原密码!',
            },
          ]}
        >
          <Input.Password />
        </Form.Item> */}
        <Form.Item
          label="新密码"
          name="newPassword"
          autoComplete="n-password"
          rules={[
            {
              required: true,
              whitespace: true,
              message: '请输入新密码!',
            },
            RULES.CHANGE_PASSWORD,
          ]}
        >
          <Input.Password
            onFocus={() => {
              setInputDisabled(false); //解决浏览器默认填入用户名密码
            }}
            readOnly={inputDisabled}
          />
        </Form.Item>
        <Form.Item
          label="确认密码"
          name="confirmPassword"
          autoComplete="n-password"
          rules={[
            {
              required: true,
              whitespace: true,
              message: '请输入确认密码!',
            },
          ]}
        >
          <Input.Password
            onFocus={() => {
              setInputDisabled(false); //解决浏览器默认填入用户名密码
            }}
            readOnly={inputDisabled}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
