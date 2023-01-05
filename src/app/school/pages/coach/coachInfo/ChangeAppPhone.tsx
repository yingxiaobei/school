import { useState, useEffect } from 'react';
import { Modal, Row, Form, Button, Input, Col, message } from 'antd';
import { RULES } from 'constants/rules';
import { useCountdown } from 'hooks';
import { _get } from 'utils';
import { sendSMS, getPhone, updatePhone, _getAppLoginPhone, _updateLoginPhone } from './_api';
import { IF, Loading } from 'components';

import _, { reject } from 'lodash';

interface IProps {
  visible: boolean;
  handleCancel: Function;
  recordId: any;
  type?: string; //student:学员 coach:教练
}

export default function BindIdCard(props: IProps) {
  const { visible, handleCancel, recordId, type = 'coach' } = props;
  const { count, isCounting, setIsCounting } = useCountdown(60);
  const [loading, setLoading] = useState(false); //验证码
  const [form] = Form.useForm();
  const [accNu, setAccNu] = useState('');
  const [load, setLoad] = useState(false); //页面
  const [sumbitLoad, setSumbitLoad] = useState(false);
  const getMobilePhone = () => {
    setLoad(true);
    type === 'student'
      ? _getAppLoginPhone({ sid: recordId })
          .then((res: any) => {
            console.log('first', res);
            setAccNu(_get(res, 'data'));
            setLoad(false);
          })
          .catch((res: any) => {
            setLoad(false);
          })
      : getPhone({ cid: recordId })
          .then((res) => {
            setAccNu(_get(res, 'data'));
            setLoad(false);
          })
          .catch((res) => {
            setLoad(false);
          });
  };

  useEffect(() => {
    recordId && getMobilePhone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId]);

  async function onCancel() {
    form.resetFields();
    setIsCounting(false);
    setLoad(false);
    setSumbitLoad(false);
    setAccNu('');
    handleCancel();
  }

  const handleOk = () => {
    setSumbitLoad(true);
    form
      .validateFields()
      .then(async (res: any) => {
        const resp = await (type === 'student'
          ? _updateLoginPhone({ ...res, sid: recordId })
          : updatePhone({ ...res, cid: recordId }));
        setSumbitLoad(false);
        if (_get(resp, 'code') === 200) {
          onCancel();
        }
      })
      .catch((res) => {
        setSumbitLoad(false);
        setLoad(false);
      });
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  return (
    <Modal
      visible={visible}
      title={<p style={{ textAlign: 'center', marginBottom: 0 }}>修改驾服APP登录手机号</p>}
      onCancel={onCancel}
      footer={[
        <Button key="submit" type="primary" onClick={handleOk} loading={sumbitLoad}>
          提交
        </Button>,
        <Button onClick={onCancel}>取消</Button>,
      ]}
    >
      {load ? (
        <Loading />
      ) : (
        <IF
          condition={!!accNu || type === 'student'}
          then={
            <Form form={form} {...layout}>
              <Form.Item label="原登录手机号">{accNu}</Form.Item>

              <Form.Item
                label="修改后的登录手机号"
                name="mobilePhone"
                rules={[{ whitespace: true, required: true, message: '请输入手机号码' }, RULES.TEL_11]}
              >
                <Input placeholder="请输入修改后的手机号" />
              </Form.Item>
              <Row>
                <Col span={16}>
                  <Form.Item
                    label="验证码"
                    name="code"
                    rules={[{ whitespace: true, required: true, message: '请输入验证码' }, RULES.CODE_NUMBER_4_6]}
                    wrapperCol={{ span: 10 }}
                    labelCol={{ span: 12 }}
                  >
                    <Input style={{ width: '160px' }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Button
                    type="primary"
                    loading={loading}
                    disabled={isCounting}
                    className="ml10"
                    onClick={async (e: any) => {
                      form.validateFields(['mobilePhone']).then(async (res: any) => {
                        setLoading(true);
                        const resp = await sendSMS({
                          mobilePhone: _get(res, 'mobilePhone'),
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
            </Form>
          }
          else={<h3 style={{ textAlign: 'center' }}>请前往编辑里变更教练手机号</h3>}
        ></IF>
      )}
    </Modal>
  );
}
