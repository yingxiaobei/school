/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useReducer, useEffect } from 'react';
import { Button, Col, Form, Input, Modal, Row, Select, Steps, Alert } from 'antd';
import { sendSMS, _bindBankCard, checkAmount, _queryApplyingBankCard, _getBaseInfo, _getCardList } from './_api';
import { RULES } from 'constants/rules';
import { useCountdown, useFetch, useOptions, useRequest, useVisible } from 'hooks';
import { Auth, _get } from 'utils';
import { IF, Loading } from 'components';

interface IProps {
  onCancel(): void;
  bankChannelId: string;
  bankAccount: string;
  acctNo: string;
  onOK(): void;
}

function BindBankCard(props: IProps) {
  const { onCancel, bankChannelId, bankAccount, acctNo, onOK } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [bindApplicationId, setBindApplicationId] = useState('');
  const [accName, setAccName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankNo, setBankNo] = useState('');
  const [accMobile, setAccMobile] = useState('');
  const [accId, setAccId] = useState('');
  const [reprName, setReprName] = useState('');
  const cardTypeOptions = useOptions('binding_card_cert_type'); // 证件类型
  const [idCardRules, setIdCardRules] = useState(RULES.ID_CARD);
  const { Step } = Steps;
  const [time, dispatch] = useReducer((x) => x - 1, 3);
  const [errorVisible, setErrorVisible] = useVisible();
  const [socialOrCertificate, setSocialOrCertificate] = useState('0'); //'0 社会信用代码 1 营业执照
  const { count, isCounting, setIsCounting } = useCountdown(60);
  const steps = [
    {
      title: '绑定账户',
      content: 'First-content',
    },
    {
      title: '小额验证',
      content: 'Second-content',
    },
  ];
  useEffect(() => {
    if (time === 0) {
      setErrorVisible();
    }
  }, [time]);

  const { isLoading: bankStatusLoading } = useFetch({
    request: _queryApplyingBankCard,
    query: {
      bankAccount,
      bankChannelId,
    },
    callback: (data) => {
      if (Object.keys(data).length === 0) {
        setCurrent(0);
      } else {
        setCurrent(1);
        setAccName(_get(data, 'accName', ''));
        setBankName(_get(data, 'bankName', ''));
        setBankNo(_get(data, 'bankNo', ''));
        setBindApplicationId(_get(data, 'bindApplicationId', ''));
        setAccMobile(_get(data, 'accMobile', ''));
      }
    },
  });
  // 驾校基本信息详情
  const { data: schoolData, isLoading: schoolDataLoading } = useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getBaseInfo,
    callback: (data) => {
      setAccName(_get(data, 'name', ''));
      setSocialOrCertificate(_get(data, 'socialCredit') ? '0' : '1');
      setAccId(_get(data, 'socialCredit', '') || _get(data, 'certificate', ''));
      setReprName(_get(data, 'legalPerson', ''));
    },
  });

  //获取中间四位隐藏的手机号，例如：130****9970
  function getPhoneNum(str: any) {
    if (!str.match(RULES.TEL_11.pattern)) return '';
    const result = str
      .match(/(\d{3})(\d{4})(\d{4})/)
      .slice(1)
      .reduce(function (value: any, item: any, index: any) {
        return index === 1 ? value + '****' : value + item;
      });
    return result;
  }

  // 开户银行数据
  const { data: bankList } = useFetch<any>({
    request: _getCardList,
    query: { bankName: '' },
  });

  return (
    <Modal visible width={800} title={'绑定银行卡'} maskClosable={false} onCancel={onCancel} footer={null}>
      {errorVisible && (
        <Modal visible width={800} title={'验证失败'} maskClosable={false} onCancel={setErrorVisible} footer={null}>
          <Alert
            message={<span className="wallet-color">审核不通过：打款金额或序号有误！</span>}
            type="error"
            className="mb20 text-center"
          />
          <div className="ml20 mr20 flex-box direction-col">
            <Row className="mb20">银行账户类型：对公银行账户</Row>
            <Row className="mb20">银行开户名：{accName}</Row>
            <Row className="mb20">开户银行：{bankName}</Row>
            <Row className="mb20">银行账号：{bankNo}</Row>
            <Row className="mb20">手机号码：{accMobile}</Row>
            <Button
              type="primary"
              onClick={() => {
                setErrorVisible();
                setCurrent(0);
              }}
            >
              重新绑定
            </Button>
          </div>
        </Modal>
      )}
      <Steps current={current}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div>
        <IF
          condition={bankStatusLoading || schoolDataLoading}
          then={<Loading />}
          else={
            <Form
              form={form}
              autoComplete="off"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              initialValues={{
                accName: _get(schoolData, 'name'),
                accId: _get(schoolData, 'socialCredit') || _get(schoolData, 'certificate', ''),
                reprName: _get(schoolData, 'legalPerson'), //回显驾校全称、信用代码、法人名称
                reprGlobalType: '1', //证件类型默认身份证
              }}
            >
              {current === 0 && (
                <>
                  <Form.Item
                    label="银行开户名"
                    name="accName"
                    rules={[{ whitespace: true, required: true, message: '请输入银行开户名' }, RULES.BANK_ACCOUNT]}
                  >
                    <Input onChange={(e: any) => setAccName(e.target.value)} />
                  </Form.Item>
                  <Form.Item
                    label={socialOrCertificate === '0' ? '社会信用代码（注册号）' : '营业执照号'}
                    name="accId"
                    rules={
                      socialOrCertificate === '0'
                        ? [
                            { whitespace: true, required: true, message: '如:91888888M000000BFCJ8L' },
                            RULES.SOCIAL_CREDIT_CODE,
                          ]
                        : [{ whitespace: true, required: true, len: 15 }]
                    }
                  >
                    <Input onChange={(e: any) => setAccId(e.target.value)} />
                  </Form.Item>

                  <Form.Item
                    label="法人姓名"
                    name="reprName"
                    rules={[{ whitespace: true, required: true, message: '请输入法人姓名' }]}
                  >
                    <Input onChange={(e: any) => setReprName(e.target.value)} />
                  </Form.Item>

                  <Form.Item
                    label="法人证件类型"
                    name="reprGlobalType"
                    rules={[{ whitespace: true, required: true, message: '请选择证件类型' }]}
                  >
                    <Select
                      options={cardTypeOptions}
                      getPopupContainer={(triggerNode) => triggerNode.parentElement}
                      onChange={(value: string) => {
                        if (value === '1') {
                          setIdCardRules(RULES.ID_CARD); //身份证号 根据身份证号校验
                        } else {
                          setIdCardRules(RULES.OTHER_IDCARD); //身份证号 根据身份证号校验
                        }
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="reprGlobalId"
                    label="法人证件号码"
                    rules={[{ whitespace: true, required: true, message: '请输入证件号码' }, idCardRules]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item label="银行账户类型">对公银行账户</Form.Item>

                  <Form.Item
                    label="开户银行"
                    name="bankName"
                    rules={[{ whitespace: true, required: true, message: '请输入开户银行' }, RULES.BANK_NAME]}
                  >
                    <Select
                      placeholder="请选择开户银行"
                      allowClear
                      showSearch
                      getPopupContainer={(triggerNode) => triggerNode.parentElement}
                      listHeight={320}
                      onChange={(e) => {
                        setBankName(e as string);
                      }}
                    >
                      {bankList &&
                        bankList.map((item: any) => (
                          <Select.Option value={item.bankName}>{item.bankName}</Select.Option>
                        ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="银行账号"
                    name="bankNo"
                    rules={[{ whitespace: true, required: true, message: '请输入银行账号' }, RULES.BANK_CARD]}
                  >
                    <Input onChange={(e) => setBankNo(e.target.value)} />
                  </Form.Item>
                  <Row>
                    <Col span={12} offset={3}>
                      <Form.Item
                        label="手机号码"
                        name="accMobile"
                        rules={[{ whitespace: true, required: true, message: '请输入手机号码' }, RULES.TEL_11]}
                      >
                        <Input
                          onChange={(e) => {
                            setAccMobile(e.target.value);
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        loading={loading}
                        disabled={isCounting}
                        className="ml10"
                        onClick={async (e: any) => {
                          form
                            .validateFields(['accName', 'accId', 'bankName', 'bankNo', 'accMobile'])
                            .then(async () => {
                              setLoading(true);
                              await sendSMS({
                                mobilePhone: accMobile,
                              });
                              setLoading(false);
                              setIsCounting(true);
                            });
                        }}
                      >
                        {isCounting ? `重新获取(${count})` : '获取验证码'}
                      </Button>
                    </Col>
                  </Row>

                  <Form.Item
                    label="验证码"
                    name="captcha"
                    rules={[{ whitespace: true, required: true, message: '请输入验证码' }, RULES.CODE_NUMBER_4_6]}
                  >
                    <Input />
                  </Form.Item>
                  <Row justify={'end'}>
                    <Button
                      type="primary"
                      loading={confirmLoading}
                      onClick={() => {
                        form.validateFields().then(async (values) => {
                          setConfirmLoading(true);
                          const res = await _bindBankCard({
                            accId,
                            accMobile,
                            accName,
                            acctNo,
                            bankChannelId,
                            bankName,
                            bankNo,
                            credentType: socialOrCertificate === '0' ? 73 : 68,
                            captcha: _get(values, 'captcha', ''),
                            reprGlobalId: _get(values, 'reprGlobalId', ''),
                            reprGlobalType: _get(values, 'reprGlobalType', ''),
                            reprName,
                          });
                          if (_get(res, 'code') === 200) {
                            setCurrent(1);
                            setBindApplicationId(_get(res, 'data.bindApplicationId'));
                          }
                          setConfirmLoading(false);
                        });
                      }}
                    >
                      确认
                    </Button>
                  </Row>
                </>
              )}
              {current === 1 && (
                <>
                  <Alert
                    message={`请输入银行转账金额及手机号${getPhoneNum(accMobile)}，接收短信的鉴权序号。`}
                    type="warning"
                    className="ml10 text-center"
                  />
                  <Form.Item
                    label="打款金额"
                    name="receiveAmt"
                    rules={[{ whitespace: true, required: true, message: '请输入打款金额' }, RULES.WITHDRAWAL_AMOUNT]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="鉴权序号"
                    name="orderNo"
                    rules={[{ whitespace: true, required: true, message: '请输入鉴权序号' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item wrapperCol={{ offset: 6 }}>
                    <Button
                      type="primary"
                      className="mr20"
                      loading={loading}
                      onClick={() => {
                        form.validateFields().then(async ({ receiveAmt, orderNo }) => {
                          let cardType = '1';
                          const res = await checkAmount({
                            bankAccount,
                            bankChannelId,
                            bankName,
                            bankNo,
                            bindApplicationId,
                            cardType,
                            receiveAmt,
                            orderNo,
                          });
                          if (_get(res, 'code') === 200) {
                            onOK();
                          } else {
                            dispatch(); //计数报错三次进入验证失败页面
                          }
                        });
                      }}
                    >
                      确认
                    </Button>
                  </Form.Item>
                  <Form.Item label="银行账户类型">对公银行账户</Form.Item>
                  <Form.Item label="银行开户名">{accName}</Form.Item>
                  <Form.Item label="开户银行">{bankName}</Form.Item>
                  <Form.Item label="银行账号">{bankNo}</Form.Item>
                  <Form.Item label="手机号码">{accMobile}</Form.Item>
                </>
              )}
            </Form>
          }
        />
      </div>
    </Modal>
  );
}

export default BindBankCard;
