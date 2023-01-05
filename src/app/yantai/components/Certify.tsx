import { useState } from 'react';
import { Modal, Input, Form, message, Select, Button } from 'antd';
import {
  _setPassword,
  _getUserId,
  _getStudentCer,
  _getSchoolInfo,
  _getCarList,
  _getCernNoLogin,
  _register,
  _getCode,
  _createToken,
  _getBaseInfo,
} from '../_api';
import { _get, Auth } from 'utils';
import { PORTAL_CITY_CODE } from 'constants/env';
import { useCountdown, useFetch } from 'hooks';
import { RULES } from 'constants/rules';

interface IProps {
  onCancel(): void;
  loginStatus: boolean;
}

export default function LoginModal(props: IProps) {
  const { onCancel, loginStatus } = props;
  const [schoolId, setSchoolId] = useState('');
  const [certifyTitle, setCertifyTitle] = useState('CERTIFY'); // 弹框标题
  const [sureButton, setSureButton] = useState(loginStatus ? 'CERTIFY' : 'NEXT_STEP'); // 确认按钮文字
  const [cancelButton, setCancelButton] = useState('CANCEL'); // 取消按钮文字
  const [code, setCode] = useState('');
  const [schoolOption, setSchoolOption] = useState([]);
  const [form] = Form.useForm();
  const [sid, setSid] = useState('');
  const { count, isCounting, setIsCounting } = useCountdown(60);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // 弹框标题，确认，取消文字枚举对应
  const TITLE: { [key: string]: string } = {
    CERTIFY: '认证',
    REGIST: '注册',
    CANCEL: '取消',
    LAST_STEP: '上一步',
    NEXT_STEP: '下一步',
  };

  // 驾校列表
  useFetch({
    request: _getSchoolInfo,
    query: { cityCode: PORTAL_CITY_CODE as string },
    callback: (data: any) => {
      const schoolOptions = _get(data, 'rows', []).map((item: any) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
      setSchoolOption(schoolOptions);
    },
  });

  // 车辆列表
  const { data: carList = [] } = useFetch({
    request: _getCarList,
    query: { userSchIdSelected: form.getFieldValue('schoolId') },
    depends: [form.getFieldValue('schoolId')],
  });

  const carListOptions = carList.map((x: { text: string; value: string }) => {
    return {
      label: x.text,
      value: x.value,
    };
  });

  const cancelFn = () => {
    if (cancelButton === 'LAST_STEP') {
      setCertifyTitle('CERTIFY');
      setSureButton('NEXT_STEP');
      setCancelButton('CANCEL');
    } else {
      onCancel();
    }
  };

  return (
    <Modal
      visible
      title={TITLE[certifyTitle]}
      onCancel={cancelFn}
      okText={TITLE[sureButton]}
      cancelText={TITLE[cancelButton]}
      confirmLoading={confirmLoading}
      onOk={() => {
        form.validateFields().then(async (values) => {
          if (certifyTitle === 'REGIST' && _get(values, 'password') !== _get(values, 'surePassword')) {
            message.error('密码与确认密码必须相同');
            return;
          }

          setConfirmLoading(true);
          // 判断是否登录：loginStatus 如果登录直接认证_getStudentCer。如果没有登录，先认证，认证成功在注册
          const res = loginStatus
            ? await _getStudentCer(values)
            : certifyTitle === 'CERTIFY'
            ? await _getCernNoLogin(values)
            : await _register({
                mobilePhone: _get(values, 'mobilePhone'),
                password: _get(values, 'password'),
                code,
                schid: schoolId,
                sid,
              });

          if (_get(res, 'code') === 200) {
            setSid(_get(res, 'data.sid', ''));

            if (loginStatus) {
              message.success('认证成功');
            }

            if (certifyTitle === 'REGIST') {
              message.success(_get(res, 'message'));
            }

            // 如果未登录，认证完成后注册
            if (!loginStatus && certifyTitle === 'CERTIFY') {
              setCertifyTitle('REGIST');
              setSureButton('REGIST');
              setCancelButton('LAST_STEP');
            }

            // 如果登录，或未登录且注册完成，弹性关闭
            if (loginStatus || certifyTitle === 'REGIST') {
              if (loginStatus && certifyTitle === 'CERTIFY') {
                // 使用username从用户中心获取用户信息
                const userInfoRes = await _getUserId({ username: Auth.get('username') as string });
                Auth.set('schoolId', _get(userInfoRes, 'data.companyId', ''));
                Auth.set('name', _get(userInfoRes, 'data.name', ''));
                const baseInfo = await _getBaseInfo({ userId: Auth.get('userId') as string });
                Auth.set('sid', _get(baseInfo, 'data.sid', ''));
                setSid(_get(baseInfo, 'data.sid', ''));
              }

              onCancel();
            }
          } else {
            message.error(_get(res, 'message'));
          }
          setConfirmLoading(false);
        });
      }}
    >
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} autoComplete="off">
        {certifyTitle === 'CERTIFY' && (
          <>
            <Form.Item
              label="报名驾校"
              name="schoolId"
              rules={[
                {
                  required: true,
                  message: '请选择报名驾校！',
                },
              ]}
            >
              <Select
                showSearch
                filterOption={false}
                onSearch={(name) => {
                  const query = { cityCode: PORTAL_CITY_CODE as string, name };
                  _getSchoolInfo(query).then((res: any) => {
                    setSchoolOption(
                      _get(res, 'data.rows', []).map((item: any) => {
                        return {
                          label: item.name,
                          value: item.id,
                        };
                      }),
                    );
                  });
                }}
                options={schoolOption}
                onChange={(value: string) => {
                  setSchoolId(value);
                  form.setFieldsValue({ traintype: '' });
                }}
              />
            </Form.Item>
            <Form.Item
              label="培训车型"
              name="traintype"
              rules={[
                {
                  required: true,
                  message: '请选择培训车型！',
                },
              ]}
            >
              <Select options={carListOptions} />
            </Form.Item>
            <Form.Item
              label="姓名"
              name="name"
              rules={[
                {
                  required: true,
                  message: '请输入姓名',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="证件号码"
              name="idcard"
              rules={[
                {
                  required: true,
                  message: '请输入证件号码',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </>
        )}

        {certifyTitle === 'REGIST' && (
          <>
            <Form.Item
              label="联系电话"
              name="mobilePhone"
              rules={[
                {
                  whitespace: true,
                  required: true,
                  message: '请输入联系电话',
                },
                RULES.TEL_11,
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item label="验证码" required>
              <Input
                style={{ width: 120 }}
                className="mr20"
                onChange={(e) => {
                  setCode(e.target.value);
                }}
              />
              <Button
                type="primary"
                loading={loading}
                disabled={isCounting}
                onClick={async () => {
                  const mobilePhoneValue = form.getFieldValue('mobilePhone');
                  if (!mobilePhoneValue) {
                    message.error('请输入手机号码');
                    return;
                  }
                  setLoading(true);
                  await _getCode({
                    mobilePhone: mobilePhoneValue,
                  });

                  setLoading(false);
                  setIsCounting(true);
                }}
              >
                {isCounting ? `重新获取(${count})` : '获取验证码'}
              </Button>
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[
                {
                  required: true,
                  message: '请输入密码',
                },
                RULES.PASSWORD,
              ]}
            >
              <Input type="password" autoComplete="new-password" />
            </Form.Item>

            <Form.Item
              label="确认密码"
              name="surePassword"
              rules={[
                {
                  required: true,
                  message: '请输入确认密码',
                },
                RULES.PASSWORD,
              ]}
            >
              <Input type="password" autoComplete="new-password" />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}
