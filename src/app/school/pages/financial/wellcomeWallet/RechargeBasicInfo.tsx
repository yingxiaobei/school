import { Button, message, Modal, Row } from 'antd';
import { useEffect, useState } from 'react';
import { Auth, _get } from 'utils';
import ORDERPAYING from 'statics/images/orderPaying.png';
import ORDERPAYED from 'statics/images/orderPayed.png';
import ORDERCANCEL from 'statics/images/orderCancel.png';
import ORDERTOPAY from 'statics/images/orderToPay.png';
import ONLINE from 'statics/images/online.png';
import OFFLINE from 'statics/images/offline.png';
import TIME from 'statics/images/time.png';
import moment from 'moment';
import { useCountdown, useFetch, useRequest, useVisible } from 'hooks';
import { _cancelPayment, _confirmPayment, _queryBankList } from './_api';
import Preview from './Preview';
import OfflinePayed from './OfflinePayed';
import { PAY_REDIRECT_PREFIX } from 'constants/env';

export default function RechargeBasicInfo(props: any) {
  const { currentRecord, restTime, onOk } = props;
  const { confirm } = Modal;
  const { count, isCounting, setIsCounting } = useCountdown(restTime);

  const [offlinePayedVisible, setOfflinePayedVisible] = useVisible();
  const payStatus = _get(currentRecord, 'payStatus'); // 支付状态   0：待支付 1、支付中，2、已支付，3、已取消，4，已完成
  const rechargeApplyCode = _get(currentRecord, 'rechargeApplyCode');
  const [selectedBank, setSelectedBank] = useState({});
  // setRestTime(restTim);
  useEffect(() => {
    // setRestTime(restTim);
    setIsCounting(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRecord]);

  const getPayStatusImg = () => {
    //支付状态 0待支付 1支付中 2已支付 3已取消
    if (payStatus === '0') {
      return ORDERTOPAY;
    }
    if (payStatus === '1') {
      return ORDERPAYING;
    }
    if (payStatus === '2') {
      return ORDERPAYED;
    }
    if (payStatus === '3') {
      return ORDERCANCEL;
    }
    return '';
  };

  const [time, setTime] = useState('');

  useEffect(() => {
    const time = `${moment(count * 1000).format('mm')}:${moment(count * 1000).format('ss')} `;
    setTime(time);
  }, [count]);

  const { run, loading } = useRequest(_cancelPayment, {
    onSuccess() {
      onOk();
    },
  });
  useFetch({
    request: _queryBankList,
    query: {
      onlineCharge: '0',
      queryOperator: `${Auth.get('userId')}${Auth.get('operatorName')}`,
      subAccountType: _get(currentRecord, 'subAccountType', ''),
    },
    callback(data) {
      const seletedBank = _get(data, 'bankList', []).filter((x: any) => {
        return x.bankId == _get(currentRecord, 'bankId');
      });
      setSelectedBank({
        accountName: _get(seletedBank, '0.companyName', ''),
        bankAccount: _get(seletedBank, '0.bankAccount', ''),
        bankName: _get(seletedBank, '0.bankName', ''),
      });
    },
  });

  const _handlePay = async () => {
    if (_get(currentRecord, 'payWay') === '1') {
      const res = await _confirmPayment({
        bankId: _get(currentRecord, 'bankId'),
        payWay: _get(currentRecord, 'payWay'),
        rechargeNumApply: _get(currentRecord, 'rechargeNumApply'),
        rechargeNumber: _get(currentRecord, 'rechargeNumber'),
        remark: '在线支付',
        subAccountType: _get(currentRecord, 'subAccountType', ''),
        paySendReturnUrl: `${PAY_REDIRECT_PREFIX}/orderpay-service/front/recharge/redirect`,
      });
      var myWindow = window.open('', 'MsgWindow', 'width=1000,height=800');
      myWindow?.document.write(_get(res, 'data.execData')); //TODO
    } else {
      setOfflinePayedVisible();
    }
  };

  return (
    <div className="flex">
      {offlinePayedVisible && (
        <OfflinePayed
          subAccountType={_get(currentRecord, 'subAccountType')}
          offlinePayData={{ ...currentRecord, ...selectedBank }}
          onCancel={setOfflinePayedVisible}
          rechargeNumber={_get(currentRecord, 'rechargeNumber')}
          onOk={() => {
            setOfflinePayedVisible();
            onOk();
          }}
        />
      )}
      <div className="p20 width-600">
        <Row className="flex">
          <div className="flex1">
            {payStatus === '0' && (
              <span>
                <img src={TIME} className="mb10" alt="" />
                <span className="ml10 bold fz30">{time}</span>
              </span>
            )}
          </div>

          <img src={getPayStatusImg()} className="payStatusImg" alt="" />
        </Row>

        <Row className="mt20">订单编号：{_get(currentRecord, 'rechargeNumber')}</Row>
        <Row className="mt20">订单金额：￥{Number(_get(currentRecord, 'orderAmount', 0)).toFixed(2)}</Row>
        <Row className="mt20">
          收款银行：{_get(currentRecord, 'bankName')}
          {payStatus === '0' && (
            <img src={_get(currentRecord, 'payWay') === '1' ? ONLINE : OFFLINE} className="bankImg" alt="" />
          )}
        </Row>
        <Row className="mt20">创建时间：{_get(currentRecord, 'queryTime')}</Row>
        {payStatus !== '0' && (
          <Row className="mt20">
            付款时间/凭证号：{_get(currentRecord, 'payTime')}
            <span
              className="color-primary pointer ml10"
              onClick={() => {
                if (!_get(currentRecord, 'rechargeVoucherUrl')) {
                  return message.error('暂无凭证信息');
                }
                window.open(_get(currentRecord, 'rechargeVoucherUrl'));
              }}
            >
              {_get(currentRecord, 'tradingFlowNumber')}
            </span>
          </Row>
        )}
        {payStatus === '3' && <Row className="mt20">取消时间：{_get(currentRecord, 'cancelTime')}</Row>}
        {payStatus === '3' && <Row className="mt20">取消原因：{_get(currentRecord, 'cancelReason')}</Row>}
        {(payStatus === '2' || payStatus === '4') && (
          <>
            <Row className="mt20">业务审核时间：{_get(currentRecord, 'busConfirmOperateTime')}</Row>
            <Row className="mt20">财务审核时间：{_get(currentRecord, 'accConfirmOperateTime')}</Row>
            <Row className="mt20">完成时间：{_get(currentRecord, 'accConfirmOperateTime')}</Row>
          </>
        )}
        {payStatus === '0' && restTime != 0 && (
          <Row justify="end" className="mt20">
            <Button
              loading={loading}
              className="mr10"
              onClick={() => {
                confirm({
                  title: '确认取消此订单？',
                  content: '',
                  okType: 'danger',
                  onOk() {
                    run({
                      rechargeApplyCode,
                    });
                  },
                });
              }}
            >
              取消订单
            </Button>
            <Button onClick={_handlePay} type="primary">
              付款
            </Button>
          </Row>
        )}
      </div>
    </div>
  );
}
