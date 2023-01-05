import { useState } from 'react';
import { Button, Form, Input, Row, Col, Popover, Modal, message } from 'antd';
import { _sendMsg, _withdraw, _getBankFee } from './_api';
import { Auth, _get } from 'utils';
import { useCountdown, useHash, useFetch, useRequest } from 'hooks';
import ChargingStandardTable from './ChargingStandardTable';
import { RULES } from 'constants/rules';

interface IProps {
  onCancel(): void;
  bankChannelId: string;
  acctNo: string;
  cashAmount: string;
  onOk(): void;
}

function WithDrawal(props: IProps) {
  const { onCancel, bankChannelId, acctNo, cashAmount, onOk } = props;
  const [form] = Form.useForm();
  const [messageOrderNo, setMessageOrderNo] = useState('');
  const withdrawStatusHash = useHash('withdraw_status_type'); // 提现状态
  const [amountMoney, setAmountMoney] = useState(0); //输入的金额
  const [serviceFee, setServiceFee] = useState(0); //服务费
  const [totalAmount, setTotalAmount] = useState(0); //总金额
  const { count, isCounting, setIsCounting } = useCountdown(60);

  const { data = [] } = useFetch({
    request: _getBankFee, //手续费列表
    query: {
      bankChannelId: bankChannelId,
      feeType: 2,
      acctNo: acctNo,
    },
  });

  const { loading: confirmLoading, run } = useRequest(_withdraw, {
    onSuccess: (res) => {
      onOk();
      const messageInfo = withdrawStatusHash[_get(res, 'withdrawStatus')];
      const status = _get(res, 'withdrawStatus');
      if (status === 1) {
        message.loading('提现正在处理中，请稍后关注余额', 2.5);
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

  function getServiceCharge(money: number) {
    for (let i = 0; i < data.length; i++) {
      if (money <= _get(data[i], 'withdrawFeeMax', 0) && money > _get(data[i], 'withdrawFeeMin', 0)) {
        setServiceFee(_get(data[i], 'fee', 0));
        return _get(data[i], 'fee', 0);
      }
    }
    setServiceFee(0);
    return 0;
  }

  return (
    <Modal visible width={800} title={'平安银行余额提现申请'} maskClosable={false} onCancel={onCancel} footer={null}>
      <Form form={form} autoComplete="off" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item label="可提现">{cashAmount}</Form.Item>
        <Form.Item label="提现账户">{acctNo}</Form.Item>
        <Form.Item
          label="金额"
          name="cashAmt"
          rules={[
            { whitespace: true, required: true, message: '请输入金额' },
            RULES.WITHDRAWAL_AMOUNT,
            {
              validator: (rule, value, callback) => {
                const fee = Number(getServiceCharge(value)); //服务费
                if (Number(value) + Number(fee) > Number(cashAmount)) {
                  callback('提现金额不足');
                }
                callback();
              },
            },
          ]}
        >
          <Input
            disabled={isCounting}
            onChange={(e) => {
              let val = Number(e.target.value);
              setAmountMoney(val); //输入的金额
              const fee = Number(getServiceCharge(val)); //服务费
              setTotalAmount(Number(Number(val + fee).toFixed(2))); //总金额=输入的金额
            }}
          />
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
              type="primary"
              loading={captchaLoading}
              disabled={isCounting}
              onClick={() => {
                form.validateFields(['cashAmt']).then(async ({ accMobile }) => {
                  captchaRun({
                    acctNo,
                    bankChannelId,
                    cashAmt: amountMoney,
                    mobile: accMobile,
                  });
                });
              }}
            >
              {isCounting ? `重新获取(${count})` : '获取验证码'}
            </Button>
          </Col>
        </Row>

        <Form.Item label="备注" name="remark" rules={[RULES.MEMO]}>
          <Input.TextArea />
        </Form.Item>

        <Form.Item label="信息服务费">
          {serviceFee}
          <span className="ml20">{'付款总额:' + totalAmount}</span>
          <Popover placement="topLeft" title="收费标准" content={<ChargingStandardTable record={data} />}>
            <span className="color-primary ml20 pointer">查看收费标准</span>
          </Popover>
        </Form.Item>
        <Row justify={'end'}>
          <Button
            type="primary"
            loading={confirmLoading}
            disabled={!isCounting}
            onClick={() => {
              form.validateFields().then(async ({ cashAmt, remark, messageCheckCode }) => {
                run({
                  acctNo,
                  bankChannelId,
                  cashAmt: amountMoney, //提现金额不加手续费
                  remark,
                  messageCheckCode,
                  messageOrderNo,
                  shopId: Auth.get('schoolId'),
                });
              });
            }}
          >
            确认
          </Button>
        </Row>
      </Form>
    </Modal>
  );
}

export default WithDrawal;
