import { useState } from 'react';
import { Button, Form, Input, Row, Col, Modal, Radio } from 'antd';
import { _sendMsg, _withdraw, _getBankFee, _queryBankCard, _rechargeWithNoOrder, _queryPApayOrder } from './_api';
import { Auth, _get, formatDecimal } from 'utils';
import { useFetch, useRequest } from 'hooks';
import { RULES } from 'constants/rules';
import { PAY_REDIRECT_PREFIX } from 'constants/env';

interface IProps {
  onCancel(): void;
  bankChannelId: string;
  onOk(): void;
  bankAccount: string;
  closeRecharge(): void;
  setQrCodeRes: any;
  setQrCodeVisible: any;
  callback: any;
  acctNo: string;
}

export default function Recharge(props: IProps) {
  const { onCancel, bankChannelId, onOk, closeRecharge, setQrCodeRes, setQrCodeVisible, callback, acctNo } = props;
  console.log(props, 'props');
  const [form] = Form.useForm();
  const [weixinFee, setWeixinFee] = useState({
    fee: 0,
    feeModel: 1, //费率：1；固费：2
  });
  const [bankFee, setBankFee] = useState({
    fee: 0,
    feeModel: 1, //费率：1；固费：2
  });
  const [realAmount, setRealAmount] = useState(0); //到账金额

  const [type, setType] = useState('2');
  const [fee, setFee] = useState(0);

  const { data = [] } = useFetch({
    request: _getBankFee, //手续费列表
    query: {
      bankChannelId: bankChannelId,
      feeType: 1, //充值
      acctNo: acctNo,
    },
    callback: (data) => {
      getServiceCharge(data);
    },
  });

  const { loading: confirmLoading, run } = useRequest(_rechargeWithNoOrder, {
    onSuccess: (res) => {
      closeRecharge();
      var myWindow = window.open('', 'MsgWindow', 'width=1000,height=800');
      myWindow?.document.write(_get(res, 'execData'));
      var loop = setInterval(async function () {
        if (myWindow?.closed) {
          clearInterval(loop);
          console.log('closed');
          // message.loading('充值申请成功，实际到账时间以银行时间为准', 2.5);
          onOk();
        }
      }, 1000);
    },
  });
  const { loading: qrCodeLoading, run: qrcodeRun } = useRequest(_queryPApayOrder, {
    onSuccess: (res) => {
      console.log(res);
      setQrCodeRes(res);

      setQrCodeVisible();
      onCancel();
    },
  });

  function getServiceCharge(data: any) {
    for (let i = 0; i < data.length; i++) {
      const payModel = _get(data[i], 'payModel');
      const weixinFee = payModel === 'WeixinProgram';
      const bankFee = payModel === 'B2B';
      const fee = _get(data[i], 'fee');
      const feeModel = _get(data[i], 'feeModel');
      if (weixinFee) {
        setWeixinFee({
          fee,
          feeModel,
        });
      }
      if (bankFee) {
        setBankFee({
          fee,
          feeModel,
        });
      }
    }
  }
  function checkAmountValid(val: string) {
    if (RULES.WITHDRAWAL_AMOUNT.pattern.test(val) && Number(val) <= 20000) {
      return true;
    } else {
      return false;
    }
  }
  function getFee(value: number, t?: string) {
    let fee = 0;
    let _type = t ? t : type;
    if (_type === '1') {
      if (weixinFee.feeModel === 1) {
        fee = weixinFee.fee * value;
      } else {
        fee = weixinFee.fee;
      }
    } else {
      if (bankFee.feeModel === 1) {
        fee = bankFee.fee * value;
      } else {
        fee = bankFee.fee;
      }
    }
    const finalFee = Number(formatDecimal(fee, 2));
    return finalFee;
  }
  function handleAmount(val: string) {
    if (!checkAmountValid(val)) {
      setFee(0);
      setRealAmount(0);
      return;
    }
    const value = Number(val);
    const finalFee = getFee(value);
    setFee(finalFee);
    setRealAmount(Number(formatDecimal(value + finalFee, 2)));
  }

  return (
    <Modal visible width={800} title={'充值申请'} maskClosable={false} onCancel={onCancel} footer={null}>
      <Form form={form} autoComplete="off" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item label="充值方式" required>
          <Radio.Group
            onChange={(e) => {
              const type = e.target.value;
              setType(type);
              let val = form.getFieldValue('cashAmt');
              if (!checkAmountValid(val)) {
                setFee(0);
                setRealAmount(0);
                return;
              }
              const value = Number(val);
              const finalFee = getFee(value, type);
              setFee(finalFee);
              setRealAmount(Number(formatDecimal(value + finalFee, 2)));
            }}
            value={type}
          >
            <Radio value={'1'}>微信支付</Radio>
            <Radio value={'2'}>网银支付（支持个人和企业账户）</Radio>
          </Radio.Group>
        </Form.Item>

        <Row>
          <Col span={12} offset={3}>
            <Form.Item
              label="充值金额"
              name="cashAmt"
              rules={[
                { whitespace: true, required: true, message: `请输入充值金额` },
                RULES.WITHDRAWAL_AMOUNT,
                {
                  validator: (rule, value, callback) => {
                    if (Number(value) > 20000) {
                      callback('充值金额<=20000');
                    }
                    callback();
                  },
                },
              ]}
              extra={
                <div>
                  <span>{`信息服务费: ￥  ${fee}`}</span>
                </div>
              }
            >
              <Input
                placeholder={'<=20000.00'}
                onChange={(e) => {
                  const value = e.target.value;
                  handleAmount(value);
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="支付总额" name="cashAmt" required>
          {`￥${realAmount}`}
        </Form.Item>

        <Row justify={'center'}>
          <Button
            className="btn-110"
            type="primary"
            loading={confirmLoading || qrCodeLoading}
            onClick={() => {
              form.validateFields().then(async ({ cashAmt, remark, messageCheckCode }) => {
                if (type === '2') {
                  run({
                    bankChannelId,
                    clientType: 'pc',
                    recharegAmt: cashAmt, //充值金额不加手续费
                    transMethod: 'B2B',
                    returnUrl: `${PAY_REDIRECT_PREFIX}/orderpay-service/front/recharge/redirect`,
                  });
                } else {
                  callback({
                    cashAmt,
                    realAmount,
                    fee,
                  });
                  qrcodeRun({
                    bankChannelId,
                    recharegAmt: cashAmt, //充值金额不加手续费
                  });
                }
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
