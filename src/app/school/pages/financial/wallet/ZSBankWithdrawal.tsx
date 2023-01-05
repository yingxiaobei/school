import { useState, useEffect } from 'react';
import { Button, Form, Input, Row, Col, Popover, Modal, message, Divider } from 'antd';
import { _sendMsg, _withdraw, _getBankFee, _queryBankCard, _getAccountInfo } from './_api';
import { Auth, formatDecimal, _get } from 'utils';
import { useCountdown, useHash, useFetch, useRequest } from 'hooks';
import ChargingStandardTable from './ChargingStandardTable';
import { RULES } from 'constants/rules';

interface IProps {
  onCancel(): void;
  bankChannelId: string;
  acctNo: string;
  cashAmount: string;
  onOk(): void;
  bankAccount: string;
  setBankCardVisible?(): void;
  type?: string; // 'wallet' 钱包管理入口 'add' 增值订单提现入口
  withrawApplyId?: any; //提现单号
}

export default function ZSBankWithdrawal(props: IProps) {
  const {
    onCancel,
    bankChannelId,
    acctNo,
    cashAmount = '0',
    onOk,
    bankAccount,
    type = 'wallet',
    setBankCardVisible,
    withrawApplyId,
  } = props;
  const [form] = Form.useForm();
  const [messageOrderNo, setMessageOrderNo] = useState('');
  const withdrawStatusHash = useHash('withdraw_status_type'); // 提现状态
  const [amountMoney, setAmountMoney] = useState(0); //输入的金额
  const [serviceFee, setServiceFee] = useState(0); //服务费
  const [realAmount, setRealAmount] = useState(0); //到账金额
  const { count, isCounting, setIsCounting } = useCountdown(60);
  const cashAmt = cashAmount ? cashAmount : '0';
  const { data = [], isLoading: feeLoad } = useFetch({
    request: _getBankFee, //手续费列表
    query: {
      bankChannelId: bankChannelId,
      feeType: 2,
      acctNo: acctNo,
    },
  });
  const { data: data2 = [] } = useFetch({
    request: _queryBankCard,
    query: {
      bankChannelId: bankChannelId,
      bankAccount,
    },
  });

  const { data: dataAdd = [] } = useFetch({
    request: _getAccountInfo,
    forceCancel: type !== 'add',
    query: {
      bankChannelId: bankChannelId,
      bankAccount,
      busiType: '2',
      personType: '2',
      userId: Auth.get('schoolId'),
    },
  });

  const bankNo = _get(data2, 'bankNo', '');
  const bankName = _get(data2, 'bankName', '');
  const accMobile = _get(data2, 'accMobile', '');
  const disable = _get(data2, 'swithdraw', 1) === 0; //0不支持 1支持

  const { loading: confirmLoading, run } = useRequest(_withdraw, {
    onSuccess: (res) => {
      onOk();
      const messageInfo = withdrawStatusHash[_get(res, 'withdrawStatus')];
      const status = _get(res, 'withdrawStatus');
      if (status === 1) {
        message.loading('提现申请成功，实际到账时间以银行时间为准', 2.5);
      } else if (status === 2) {
        message.success(messageInfo);
      } else if (status === 3) {
        message.error(messageInfo);
      }
    },
  });

  const { loading: captchaLoading, run: captchaRun } = useRequest(_sendMsg, {
    onSuccess: (res) => {
      setIsCounting(true);
      setMessageOrderNo(_get(res, 'messageOrderNo'));
      const mobile = _get(res, 'receiveMobile', '');
      message.success('验证码将发送到您尾号' + mobile + '的手机号中');
    },
  });

  useEffect(() => {
    if (type === 'add') {
      form.setFieldsValue({ cashAmt: String(cashAmt) });

      let val = Number(cashAmt);
      if (isNaN(val)) {
        return;
      }
      setAmountMoney(val); //输入的金额
      const fee = Number(getServiceCharge(val)); //服务费
      setRealAmount(Number(Number(val - fee).toFixed(2))); //总金额=输入的金额}
    }
  }, [acctNo, feeLoad]);
  function getServiceCharge(money: number) {
    for (let i = 0; i < data.length; i++) {
      if (
        (!_get(data[i], 'withdrawFeeMax') && money > _get(data[i], 'withdrawFeeMin', 0)) || //不存在最大值时
        (money < _get(data[i], 'withdrawFeeMax', 0) && money >= _get(data[i], 'withdrawFeeMin', 0))
      ) {
        const feePer = Number(formatDecimal(money * _get(data[i], 'feePer', 0), 2));
        const fee = _get(data[i], 'fee', 0);
        const finalFee = feePer !== 0 ? Math.min(feePer, fee) : fee; //费率和固费取最小的
        setServiceFee(finalFee);
        return finalFee;
      }
    }
    setServiceFee(0);
    return 0;
  }
  return (
    <Modal visible width={800} title={'提现申请'} maskClosable={false} onCancel={onCancel} footer={null}>
      <Form form={form} autoComplete="off" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        {type === 'add' ? (
          <>
            <Row>
              <Col span={8} offset={4}>
                <Form.Item label="账号"> {acctNo}</Form.Item>
              </Col>
              <Col span={8} offset={3}>
                <Form.Item label="剩余免费提现次数" labelCol={{ span: 12 }}>
                  {_get(dataAdd, 'feeType', '').toString() === '0'
                    ? '不限'
                    : Number(_get(dataAdd, 'maxFreeNum', '')) - Number(_get(dataAdd, 'freeNum', '')) + '次/月'}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={8} offset={4}>
                <Form.Item label="余额"> {_get(dataAdd, 'availBal', '暂无信息')}</Form.Item>
              </Col>

              <Col span={10} offset={1}>
                <Form.Item label="可提金额" labelCol={{ span: 10 }}>
                  {_get(dataAdd, 'cashAmt', '')}
                </Form.Item>
              </Col>
            </Row>
          </>
        ) : null}

        <Row>
          <Col span={12} offset={3}>
            <Form.Item label="提现账户" required>
              {!data2 || Number(_get(data2, 'status', 0)) === 0 ? (
                '暂无账户信息'
              ) : type === 'add' ? (
                <>
                  <span className="bold fz18">{_get(data2, 'accName', '')}</span>
                  <br />
                  <span className="bold ">
                    {bankName} | 尾号：{bankNo.substr(bankNo.length - 4)}
                  </span>
                </> //未绑卡 前往绑卡
              ) : (
                <span className="bold fz18">
                  {bankName} | 尾号：{bankNo.substr(bankNo.length - 4)}
                </span>
              )}
            </Form.Item>
          </Col>
          <Col>
            <Button
              className="btn-110"
              type="primary"
              onClick={() => {
                if ((!data2 || Number(_get(data2, 'status', 0)) === 0) && type === 'add') {
                  //未绑卡 前往绑卡
                  setBankCardVisible && setBankCardVisible();
                  onCancel();
                  return;
                }
                message.info('暂无功能，敬请期待。'); //已绑卡，暂无支持换绑卡
              }}
            >
              使用其他账户
            </Button>
          </Col>
        </Row>

        {type === 'add' ? (
          <Form.Item label="提现金额" name="cashAmt">
            <Input disabled />
          </Form.Item>
        ) : (
          <Row>
            <Col span={12} offset={3}>
              <Form.Item
                label="提现金额"
                name="cashAmt"
                rules={[
                  { whitespace: true, required: true, message: `请输入提现金额` },
                  RULES.WITHDRAWAL_AMOUNT,
                  {
                    validator: (rule, value, callback) => {
                      // const fee = Number(getServiceCharge(value)); //服务费
                      if (Number(value) > Number(cashAmt)) {
                        callback('提现金额不足');
                      }
                      callback();
                    },
                  },
                ]}
              >
                <Input
                  disabled={isCounting}
                  placeholder={`可提现总额￥${cashAmt}`}
                  onChange={(e) => {
                    if (e.target.value === '') {
                      setServiceFee(0);
                      setRealAmount(0);
                      return;
                    }
                    let val = Number(e.target.value);
                    if (isNaN(val)) {
                      return;
                    }
                    setAmountMoney(val); //输入的金额
                    const fee = Number(getServiceCharge(val)); //服务费
                    const realAmount = Number(val - fee).toFixed(2);
                    setRealAmount(Number(realAmount));
                  }}
                />
              </Form.Item>
            </Col>
            <Col>
              <Button
                className="btn-110"
                type="primary"
                disabled={disable}
                onClick={() => {
                  form.setFieldsValue({ cashAmt: String(cashAmt) });

                  let val = Number(cashAmt);
                  if (isNaN(val)) {
                    return;
                  }
                  setAmountMoney(val); //输入的金额
                  const fee = Number(getServiceCharge(val)); //服务费
                  setRealAmount(Number(Number(val - fee).toFixed(2))); //总金额=输入的金额
                }}
              >
                全额提现
              </Button>
            </Col>
          </Row>
        )}

        <Form.Item label="到账金额">
          ￥{realAmount}
          <span className="ml20 mr20">|</span>
          <span>{'信息服务费: ￥' + serviceFee}</span>
          <Popover placement="topLeft" title="收费标准" content={<ChargingStandardTable record={data} />}>
            <span className="color-primary ml20 pointer">收费标准</span>
          </Popover>
        </Form.Item>
        <Row>
          <Col span={12} offset={3}>
            <Form.Item
              label="验证码"
              name="messageCheckCode"
              rules={[{ whitespace: true, required: true, message: '请输入验证码' }, RULES.CODE_NUMBER_4_6]}
            >
              <Input placeholder="验证码将发送到您在银行预留的手机号" />
            </Form.Item>
          </Col>
          <Col>
            {/* 1、获取验证码亮起时，可以输入金额，不能点击确认；
                2、获取验证码倒计时期间，金额不能输入，确认按钮亮起 */}
            <Button
              className="btn-110"
              type="primary"
              loading={captchaLoading}
              disabled={isCounting || disable}
              onClick={() => {
                form.validateFields(['cashAmt']).then(async (values: any) => {
                  captchaRun({
                    acctNo,
                    bankChannelId,
                    cashAmt: realAmount,
                    mobile: accMobile,
                  });
                });
              }}
            >
              {isCounting ? `重新获取(${count})` : '获取验证码'}
            </Button>
          </Col>
        </Row>

        {/* <Form.Item label="备注" name="remark" rules={[RULES.MEMO]}>
          <Input.TextArea />
        </Form.Item> */}

        <Row justify={'center'}>
          <Button
            className="btn-110"
            type="primary"
            loading={confirmLoading}
            disabled={disable}
            onClick={() => {
              form.validateFields().then(async ({ cashAmt, remark, messageCheckCode }) => {
                if (!messageOrderNo) {
                  return message.error('请先获取验证码');
                }
                run({
                  acctNo,
                  bankChannelId,
                  cashAmt: cashAmt, //输入框的提现金额
                  remark: 'newVersion', //区分平安提现
                  messageCheckCode,
                  messageOrderNo,
                  withrawApplyId: withrawApplyId,
                  shopId: Auth.get('schoolId'),
                });
              });
            }}
          >
            确认
          </Button>
        </Row>
        <Row justify="center" className="mt10">
          <div>预计2小时到账，具体以银行为准。</div>
        </Row>
      </Form>
    </Modal>
  );
}
