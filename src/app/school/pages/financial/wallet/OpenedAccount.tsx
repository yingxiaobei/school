import { Card, Row, Space } from 'antd';
import { _get } from 'utils';
import { AuthButton } from 'components';
import { useHistory } from 'react-router-dom';
import { PUBLIC_URL } from 'constants/env';
import CommonCard from './CommonCard';
import closeEye from 'statics/images/wallet/closeEye.png';
import openEye from 'statics/images/wallet/openEye.png';
import { useState } from 'react';
import { message } from 'antd';

interface IProps {
  item: any;
  cardInfoLoading: boolean;
  setBankAccount(param: string): void;
  setBankChannelId(param: string): void;
  setAcctNo(param: string): void;
  cardInfoRun: any;
  run: any;
  withdrawalLoading: boolean;
  pingAnBank: boolean;
  setZSWithDrawalVisible(): void;
  setCashAmt: any;
  setRechargeVisible(): void;
  type: string; //type : 'wallet' 钱包管理 ‘add' 增值服务收款钱包入口
}

export default function OpenedAccount(props: IProps) {
  const {
    item,
    cardInfoLoading,
    setBankChannelId,
    setBankAccount,
    setAcctNo,
    cardInfoRun,
    run,
    withdrawalLoading,
    pingAnBank,
    setZSWithDrawalVisible,
    setCashAmt,
    type = 'wallet',
    setRechargeVisible,
  } = props;
  const bankChannelType = _get(item, 'bankChannelType', '');
  const zheShangBank = bankChannelType === 'cz_bank';
  const history = useHistory();
  const [acctNoOpenEye, setAcctNoOpenEye] = useState(false);
  const [acctByWeekOpenEye, setAcctByWeekOpenEye] = useState(false);

  const acctNo = String(_get(item, 'acctNo', ''));
  const acctNoClose = acctNo
    ? acctNo.length > 6
      ? acctNo.substr(0, 3) + '***' + acctNo.substr(acctNo.length - 3)
      : acctNo
    : '/';
  const acctByWeek = _get(item, 'acctByWeek', '');
  const week = acctByWeek ? `￥${acctByWeek}` : acctByWeek === 0 ? '￥0' : '暂无数据';

  return (
    <CommonCard title={_get(item, 'bankName', '')} openedStatus={'opened'} bankName={bankChannelType} item={item}>
      <div>
        <p className="mb10">
          <span className="wallet-span">资金账号</span>：{acctNoOpenEye ? acctNo : acctNoClose}
          {acctNo && acctNo.length > 6 && (
            <span
              className="ml10"
              onClick={() => {
                setAcctNoOpenEye(!acctNoOpenEye);
              }}
            >
              {acctNoOpenEye && <img src={openEye} className="wallet-img-eye" alt="" />}
              {!acctNoOpenEye && <img src={closeEye} className="wallet-img-eye" alt="" />}
            </span>
          )}
        </p>
        <p className="mb10">
          <span className="wallet-span">账户余额</span>
          {pingAnBank || zheShangBank ? `：￥${_get(item, 'availBal', '0')}` : `：￥${_get(item, 'assureAmt', '0')}`}
        </p>

        <p className="mb10">
          <span className="wallet-span">本周收入</span>：{acctByWeekOpenEye ? week : '*****'}
          <span
            className="ml10"
            onClick={() => {
              setAcctByWeekOpenEye(!acctByWeekOpenEye);
            }}
          >
            {acctByWeekOpenEye && <img src={openEye} className="wallet-img-eye" alt="" />}
            {!acctByWeekOpenEye && <img src={closeEye} className="wallet-img-eye" alt="" />}
          </span>
        </p>

        <p className="mb10">
          <span className="wallet-span">可提现余额</span>
          {`：￥${_get(item, 'cashAmt', '0')}`}
        </p>
        {type === 'add' ? (
          <p className="mb10">
            <span className="wallet-span">待提现余额</span>
            {`：￥${_get(item, 'waitCashAmt', '0')}`}
          </p>
        ) : null}
        <p className="fz14 text-center color-primary">(注：实际金额以银行为准)</p>
      </div>

      <Row justify="center" className="space-around mt20 full-width">
        {type !== 'add' ? (
          <AuthButton
            authId="financial/wallet:btn4"
            type="primary"
            onClick={() => {
              history.push(`${PUBLIC_URL}financial/transactionRecords`, {
                bankChannelId: _get(item, 'bankChannelId', ''),
              });
            }}
          >
            交易明细
          </AuthButton>
        ) : null}
        {/* {zheShangBank && (
            <AuthButton
              authId=""
              type="primary"
              onClick={() => {
                setRechargeVisible();
              }}
            >
              充值
            </AuthButton>
          )} */}
        {(pingAnBank || zheShangBank) && (
          <AuthButton
            authId="financial/wallet:btn2"
            loading={withdrawalLoading}
            disabled={zheShangBank && _get(item, 'cashAmt', 0) === 0} //若【可提现=0】功能禁用
            type="primary"
            onClick={() => {
              if (type === 'add') {
                history.push(`../valueAddOrder/withdrawalApplication`);
                return;
              }
              if (pingAnBank) {
                setBankChannelId(_get(item, 'bankChannelId', ''));
                setBankAccount(_get(item, 'bankAccount', ''));
                setAcctNo(_get(item, 'acctNo', ''));
                setCashAmt(_get(item, 'cashAmt', ''));
                // run({
                //   bankChannelId: _get(item, 'bankChannelId', ''),
                //   bankAccount: _get(item, 'bankAccount', ''),
                // });
                setZSWithDrawalVisible();
                return;
              }
              if (zheShangBank) {
                setBankChannelId(_get(item, 'bankChannelId', ''));
                setBankAccount(_get(item, 'bankAccount', ''));
                setAcctNo(_get(item, 'acctNo', ''));
                setCashAmt(_get(item, 'cashAmt', ''));
                setZSWithDrawalVisible();
                return;
              }
            }}
          >
            立即提现
          </AuthButton>
        )}
        {type !== 'add' ? (
          <>
            <AuthButton
              danger
              authId="financial/wallet:btn5"
              onClick={() => {
                if (_get(item, 'srecharge', 0) === 1) {
                  setBankChannelId(_get(item, 'bankChannelId', ''));
                  setBankAccount(_get(item, 'bankAccount', ''));
                  setAcctNo(_get(item, 'acctNo', ''));
                  setRechargeVisible();

                  return;
                }
                message.error('本渠道暂不支持，敬请期待');
              }}
            >
              充值
            </AuthButton>
            {pingAnBank && (
              <AuthButton
                danger
                authId="financial/wallet:btn3"
                loading={cardInfoLoading}
                onClick={() => {
                  setBankChannelId(_get(item, 'bankChannelId', ''));
                  setBankAccount(_get(item, 'bankAccount', ''));
                  setAcctNo(_get(item, 'acctNo', ''));
                  setCashAmt(_get(item, 'cashAmt', ''));

                  cardInfoRun({
                    bankChannelId: _get(item, 'bankChannelId', ''),
                    bankAccount: _get(item, 'bankAccount', ''),
                  });
                }}
              >
                绑卡信息
              </AuthButton>
            )}
          </>
        ) : null}
      </Row>
    </CommonCard>
  );
}
