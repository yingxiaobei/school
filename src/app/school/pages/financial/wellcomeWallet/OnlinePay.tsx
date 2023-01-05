import { Radio, Row, Select, Tooltip } from 'antd';
import { useFetch, useVisible } from 'hooks';
import { useEffect, useState } from 'react';
import { Auth, _get } from 'utils';
import { _queryBankList, _queryOrderFee } from './_api';
import { IF, Loading } from 'components';
import PayBankList from './PayBankList';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ONLINEUNOPEN from 'statics/images/onlineUnopen.png';
import { formatDecimal } from 'utils';

export function OnlinePay(props: any) {
  const {
    bankId,
    setBankId,
    setTotalPay,
    rechargeTotal,
    setFee,
    fee,
    feeModel,
    setFeeModel,
    type,
    setType,
    subAccountType,
  } = props;

  const [payBankListVisible, setPayBankListVisible] = useVisible();
  const [b2bFee, setB2bFee] = useState({});
  const [weixinFee, setWeixinFee] = useState({});
  const [finalFee, setFinalFee] = useState('');
  const { data, isLoading } = useFetch({
    request: _queryBankList,
    query: {
      onlineCharge: '1',
      queryOperator: `${Auth.get('userId')}${Auth.get('operatorName')}`,
      subAccountType,
    },
    callback(data) {
      setBankListOptions(
        _get(data, 'bankList', []).map((x: any) => {
          return { ...x, label: x.bankName, value: x.bankId };
        }),
      );
    },
  });

  useEffect(() => {
    async function queryFee() {
      const res = await _queryOrderFee({
        bankId,
        feeType: '1',
      });
      const feeList = _get(res, 'data.feeList', []);
      let weixinItem = {};
      let b2bItem = {};
      // eslint-disable-next-line array-callback-return
      feeList.map((item: any) => {
        if (item.payModel === 'B2B') {
          b2bItem = item;
          return setB2bFee(item);
        }
        if (item.payModel === 'WeixinProgram') {
          weixinItem = item;
          return setWeixinFee(item);
        }
      });
      if (type === '1') {
        setFeeModel(_get(weixinItem, 'feeModel'));
        setFee(_get(weixinItem, 'fee', ''));
      } else {
        setFeeModel(_get(b2bItem, 'feeModel'));
        setFee(_get(b2bItem, 'fee', ''));
      }
      const seletedBank = _get(data, 'bankList', []).filter((x: any) => {
        return x.bankId == bankId;
      });
      setAccountName(_get(seletedBank, '0.companyName', ''));
    }
    bankId && queryFee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankId]);

  useEffect(() => {
    if (type === '1') {
      setFeeModel(_get(weixinFee, 'feeModel'));
      _get(weixinFee, 'fee', '') && setFee(_get(weixinFee, 'fee', ''));
    } else {
      setFeeModel(_get(b2bFee, 'feeModel'));
      _get(b2bFee, 'fee', '') && setFee(_get(b2bFee, 'fee', ''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    let total = 0;
    if (feeModel === '1') {
      //手续费方式 1.比例（%），2固费（元/笔）
      total = Number(fee) * Number(rechargeTotal) + Number(rechargeTotal);
    } else {
      total = Number(fee) + Number(rechargeTotal);
    }
    setTotalPay(formatDecimal(total, 2));
    const finalFee: string = fee
      ? feeModel === '2'
        ? `￥${formatDecimal(fee, 2)}/笔`
        : `￥${formatDecimal(Number(fee) * rechargeTotal, 2)}/笔`
      : '';
    setFinalFee(finalFee);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fee, feeModel]);

  const [accountName, setAccountName] = useState('');
  const [bankListOptions, setBankListOptions] = useState([]);
  // const finalFee = formatDecimal(Number(fee) * rechargeTotal, 2);

  return (
    <div>
      {payBankListVisible && <PayBankList onCancel={setPayBankListVisible} />}
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          _get(data, 'bankList.length', 0) > 0 ? (
            <div>
              <Row className="mb10 color-primary">预计到账后2小时内发放</Row>
              <Row className="mb10">①确认可选银行、手续费额 ②在线收银台选择付款银行 ③付款银行在线转账</Row>
              <Row className="mb10">
                收款银行：
                <Select
                  className="width-150 "
                  options={bankListOptions}
                  getPopupContainer={(triggerNode) => triggerNode.parentElement}
                  onChange={(value: any) => {
                    setBankId(value);
                  }}
                />
              </Row>
              <Row className="mb10">账户名：{accountName}</Row>
              <Row className="mb10">
                付款方式：
                <Radio.Group
                  onChange={(e) => {
                    const type = e.target.value;
                    setType(type);
                  }}
                  value={type}
                >
                  <Radio value={'1'}>微信支付</Radio>
                  <Radio value={'2'}>企业网银</Radio>
                </Radio.Group>
                {type === '2' && (
                  <span onClick={setPayBankListVisible} className="hover-active color-primary bold">
                    付款银行
                  </span>
                )}
              </Row>
              <Row className="mb10">
                信息服务费：{finalFee}
                <Tooltip
                  color={'#333'}
                  className="ml20"
                  placement="right"
                  title="您在平台购买商品时，可能需要承担一定比例的信息服务费"
                >
                  <QuestionCircleOutlined className="mt4" />
                </Tooltip>
              </Row>
            </div>
          ) : (
            <div className="flex-box mt20 fz16 height-200">
              <img src={ONLINEUNOPEN} className="mr20" alt="" />
              您所在区域暂未开通在线支付，详询当地服务工程师。
            </div>
          )
        }
      />
    </div>
  );
}
