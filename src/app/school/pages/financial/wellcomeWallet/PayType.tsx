import { Button, Drawer, message, Modal, Tabs } from 'antd';
import { useState } from 'react';
import { Auth, _get } from 'utils';
import { OnlinePay } from './OnlinePay';
import { OfflinePay } from './OfflinePay';
import { _confirmPayment, _preparePayment } from './_api';
import { useRequest, useVisible } from 'hooks';
import { PAY_REDIRECT_PREFIX } from 'constants/env';
import { formatDecimal } from 'utils';

export function PayType(props: any) {
  const {
    onCancel,
    rechargeValues,
    subAccountType,
    onOk,
    setOfflinePayData,
    setRechargeNumber,
    setOfflinePayedVisible,
  } = props;
  const { TabPane } = Tabs;
  const [type, setType] = useState('1');
  const [activeKey, setActiveKey] = useState('onlinePay');
  const [totalPay, setTotalPay] = useState(_get(rechargeValues, 'rechargeTotal', 0));
  const [bankId, setBankId] = useState('');
  const [bankIdOffline, setBankIdOffline] = useState('');
  const [fee, setFee] = useState(0);
  const [feeModel, setFeeModel] = useState('2');
  const { confirm } = Modal;
  const { loading, run } = useRequest(_preparePayment, {
    onSuccess: async (data) => {
      const rechargeNumber = _get(data, 'rechargeNumber', '');

      setRechargeNumber(rechargeNumber);
      if (activeKey === 'onlinePay') {
        const res = await _confirmPayment({
          bankId,
          payWay: activeKey === 'onlinePay' ? '1' : '0',
          rechargeNumApply: _get(rechargeValues, 'rechargeNumApply', '0'),
          rechargeNumber,
          remark: '在线支付',
          subAccountType,
          payMode: type === '1' ? 'WeixinProgram' : '',
          paySendReturnUrl: `${PAY_REDIRECT_PREFIX}/orderpay-service/front/recharge/redirect`,
        });

        onOk(res, rechargeNumber, type);
        return;
      }
      onCancel();
      setOfflinePayedVisible();
    },
  });

  const _handleOk = () => {
    if ((activeKey === 'onlinePay' && !bankId) || (activeKey === 'offlinePay' && !bankIdOffline)) {
      return message.error('请选择银行');
    }

    let secondsToGo = 3;
    const modal = confirm({
      title: activeKey === 'onlinePay' ? '已确认银行并同意支付必要的信息服务费用' : '已确认收款银行与应付总额。',
      content: '',
      okText: '确认付款(3)',
      okButtonProps: { disabled: true },
      okType: 'danger',
      cancelText: '返回修改',
      onOk() {
        run({
          bankId: activeKey === 'onlinePay' ? bankId : bankIdOffline,
          payWay: activeKey === 'onlinePay' ? '1' : '0',
          queryOperator: `${Auth.get('userId')}${Auth.get('operatorName')}`,
          rechargeNumApply: _get(rechargeValues, 'rechargeNumApply', '0'),
          subAccountType,
        });
      },
    });
    const timer = setInterval(() => {
      secondsToGo -= 1;
      modal.update({
        okText: `确认付款${secondsToGo > 0 ? secondsToGo : ''}`,
        okButtonProps: { disabled: secondsToGo > 0 ? true : false },
      });
      if (secondsToGo == 0) {
        clearInterval(timer);
      }
    }, 1000);
  };

  return (
    <Drawer
      destroyOnClose
      visible
      width={1000}
      title={'请选择付款方式'}
      onClose={onCancel}
      footer={
        <div className="text-right">
          <span className="bold fz18">
            应付总额：<span className="color-primary">￥{Number(totalPay).toFixed(2)}</span>
          </span>
          <Button onClick={_handleOk} type="primary" className="ml20" loading={loading}>
            确定
          </Button>
        </div>
      }
    >
      <div>
        <div className="payType-div flex-box">
          待支付：
          <span className="color-primary fz20">￥{Number(_get(rechargeValues, 'rechargeTotal', 0)).toFixed(2)}</span>
        </div>
        <Tabs
          defaultActiveKey="onlinePay"
          activeKey={activeKey}
          onChange={(val: any) => {
            setActiveKey(val);
            if (val === 'offlinePay') {
              setTotalPay(formatDecimal(_get(rechargeValues, 'rechargeTotal', 0), 2));
            } else {
              let total = 0;
              if (feeModel == '1') {
                //手续费方式 1.比例（%），2固费（元/笔）
                total =
                  Number(fee) * Number(_get(rechargeValues, 'rechargeTotal', 0)) +
                  Number(_get(rechargeValues, 'rechargeTotal', 0));
              } else if (feeModel == '2') {
                total = Number(fee) + Number(_get(rechargeValues, 'rechargeTotal', 0));
              } else {
                total = fee
                  ? Number(fee) + Number(_get(rechargeValues, 'rechargeTotal', 0))
                  : Number(_get(rechargeValues, 'rechargeTotal', 0));
              }
              setTotalPay(formatDecimal(total, 2));
            }
          }}
        >
          <TabPane tab="在线支付" key="onlinePay">
            <OnlinePay
              setBankId={setBankId}
              bankId={bankId}
              setTotalPay={setTotalPay}
              rechargeTotal={_get(rechargeValues, 'rechargeTotal', 0)}
              fee={fee}
              setFee={setFee}
              feeModel={feeModel}
              setFeeModel={setFeeModel}
              type={type}
              setType={setType}
              subAccountType={subAccountType}
            />
          </TabPane>
          <TabPane tab="线下转账" key="offlinePay">
            <OfflinePay
              setBankId={setBankIdOffline}
              bankId={bankIdOffline}
              setOfflinePayData={setOfflinePayData}
              rechargeNumApply={_get(rechargeValues, 'rechargeNumApply', 0)}
              subAccountType={subAccountType}
            />
          </TabPane>
        </Tabs>
      </div>
    </Drawer>
  );
}
