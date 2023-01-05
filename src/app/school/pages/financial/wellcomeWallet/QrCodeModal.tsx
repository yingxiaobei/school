import { Button, Modal, Row } from 'antd';
import { useInterval } from 'hooks';
import { useEffect, useState } from 'react';
import { _get } from 'utils';

export default function QrCodeModal(props: any) {
  const { src, currentRecord, setQrCodeVisible, _switchDetailsVisible, getDetailRecord } = props;
  const [delay, setDelay] = useState(0);
  useInterval(() => {
    const res = getDetailRecord(_get(currentRecord, 'rechargeNumber'));
    const payStatus = _get(res, 'payStatus'); // 支付状态   0：待支付 1、支付中，2、已支付，3、已取消，4，已完成
    if (payStatus === '2') {
      setDelay(0);
      setQrCodeVisible();
      _switchDetailsVisible();
    }
  }, delay);

  useEffect(() => {
    setTimeout(() => {
      setDelay(2000);
    }, 5000);
  }, []);

  return (
    <Modal
      visible
      onCancel={() => {
        setDelay(0);
        setQrCodeVisible();
      }}
      footer={
        <Row justify={'end'}>
          <Button
            type="primary"
            onClick={() => {
              setDelay(0);
              setQrCodeVisible();
              _switchDetailsVisible();
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
          <div className="mt10">订单编号：{_get(currentRecord, 'rechargeNumber')}</div>
          <div className="mt10">创建时间：{_get(currentRecord, 'queryTime')}</div>
          <div className="color-primary mt10">支付总额：￥{Number(_get(currentRecord, 'payAmount', 0)).toFixed(2)}</div>
        </div>
        <div className="mt10">
          <img src={src} alt="" />
        </div>
        <span>打开微信扫一扫</span>
      </div>
    </Modal>
  );
}
