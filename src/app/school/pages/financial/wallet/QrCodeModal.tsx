import { Button, Modal, Row } from 'antd';
import { QrCode } from 'components';
import { useInterval } from 'hooks';
import { useEffect, useState } from 'react';
import { _get } from 'utils';
import { PAY_REDIRECT_PREFIX } from 'constants/env';

interface Iprops {
  res: any;
  onCancel(): void;
  realAmount: number;
  fee: number;
  onOk(): void;
}

export default function QrCodeModal(props: Iprops) {
  const { res, onCancel, realAmount, fee, onOk } = props;
  const [qrcodeVal, setQrcodeVal] = useState('');

  // https://test.welldriver.cn:1445/wellpay?bankChannelId=3379900755808747657
  /* &callBackUrl=http://124.70.184.157:33035/dfo/biz_web/stu/StudentInfoPayment/orderNotify.do
  &orderId=3633894068360183937
  &rechargeFee=0.01
  &returnUrl=http://124.70.184.157:33035/dfo/biz_web/stu/paySuccess.html&tradeFlowId=
  &requestUrl=https://orderpay.welldrive.cn:1444/openapi/orderpay-service/front/recharge
  &userId=123&resourceId=12&recharegAmt=1 */

  useEffect(() => {
    console.log(res);
    const bankChannelId = _get(res, 'body.bankChannelId');
    const recharegAmt = _get(res, 'body.payAmount');
    const requestUrl = _get(res, 'body.requestUrl');
    const resourceId = _get(res, 'body.resourceId');
    const userId = _get(res, 'body.userId');

    const returnUrl = `${PAY_REDIRECT_PREFIX}/orderpay-service/front/recharge/redirect`;
    const url = `https://test.welldriver.cn:1445/wellpay?bankChannelId=${bankChannelId}&callBackUrl=&orderId=&rechargeFee=${fee}&returnUrl=${returnUrl}&tradeFlowId=&requestUrl=${requestUrl}&userId=${userId}&resourceId=${resourceId}&recharegAmt=${recharegAmt}`;

    setQrcodeVal(url);
  }, [res, fee, realAmount]);
  console.log(fee, qrcodeVal);
  return (
    <Modal
      visible
      onCancel={() => {
        onCancel();
      }}
      footer={
        <Row justify={'end'}>
          <Button
            type="primary"
            onClick={() => {
              onOk();
            }}
          >
            我已付款
          </Button>
        </Row>
      }
      title={'微信支付'}
      width={400}
      bodyStyle={{ width: 400 }}
    >
      <div className="flex-box direction-col">
        <div className="bold fz16">
          <div className="color-primary mt10">支付总额：￥{Number(realAmount).toFixed(2)}</div>
        </div>
        <div className="mt10">
          <QrCode value={qrcodeVal} />
        </div>
        <span>打开微信扫一扫</span>
      </div>
    </Modal>
  );
}
