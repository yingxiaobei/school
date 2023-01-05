import { Space } from 'antd';
import { useState } from 'react';
import { _addMessage } from './_api';
import { Auth, _get } from 'utils';
import { AuthButton, IF } from 'components';
import CommonCard from './CommonCard';
import closeEye from 'statics/images/wallet/closeEye.png';
import openEye from 'statics/images/wallet/openEye.png';
import { debounce } from 'lodash';

interface IProps {
  item: any;
  classTwoBankAccountStatus: number;
  cardInfoLoading: boolean;
  setBankAccount(param: string): void;
  setBankChannelId(param: string): void;
  setAcctNo(param: string): void;
  cardInfoRun: any;
  setTwoBankAccountVisible(param: boolean): void;
  ClassTwoBankAccountStatusLoading: boolean;
  setOpenAccountAgain(param: boolean): void;
}

export default function ClassTwoAccount(props: IProps) {
  const {
    classTwoBankAccountStatus,
    item,
    cardInfoLoading,
    setBankChannelId,
    setBankAccount,
    setAcctNo,
    cardInfoRun,
    setTwoBankAccountVisible,
    ClassTwoBankAccountStatusLoading,
    setOpenAccountAgain,
  } = props;

  const [acctNoOpenEye, setAcctNoOpenEye] = useState(false);
  const acctNo = String(_get(item, 'acctNo', '')) || String(_get(item, 'ClassTwoBankAccountStatus.acctNo', ''));
  const acctNoClose = acctNo
    ? acctNo.length > 6
      ? acctNo.substr(0, 3) + '***' + acctNo.substr(acctNo.length - 3)
      : acctNo
    : '/';
  const acctNoOpen = acctNo ? acctNo : '/';

  return (
    <div>
      {!ClassTwoBankAccountStatusLoading && (
        <IF
          condition={!(classTwoBankAccountStatus === 0)}
          then={
            <CommonCard
              isPingAnSecond={true}
              title={_get(item, 'bankName', '')}
              openedStatus={classTwoBankAccountStatus}
              bankName={'pa_bank'}
              item={item}
            >
              <div className="flex direction-col full-height full-width">
                <div className="flex1 flex direction-col mt20" style={{ alignItems: 'center' }}>
                  <div>
                    {/* 审核中不展示监管户账号 */}
                    {!(classTwoBankAccountStatus === 1) && (
                      <p className="mb10">
                        资金账号： {acctNoOpenEye ? acctNoOpen : acctNoClose}
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
                    )}
                    <p className="mb10">
                      {classTwoBankAccountStatus === 2 && '开通状态：成功'}
                      {classTwoBankAccountStatus === 3 && '开通状态：失败'}
                    </p>
                  </div>
                  {classTwoBankAccountStatus === 1 && (
                    <p className="flex1 flex-box color-primary mb10">开户审核中，请等待...</p>
                  )}
                </div>

                <Space size="small"></Space>
                <div className="text-right">
                  <AuthButton
                    danger
                    className="text-right"
                    authId="financial/wallet:btn3"
                    loading={cardInfoLoading}
                    onClick={() => {
                      setBankChannelId(_get(item, 'bankChannelId', ''));
                      setBankAccount(_get(item, 'bankAccount', ''));
                      setAcctNo(_get(item, 'acctNo', ''));
                      cardInfoRun({
                        bankChannelId: _get(item, 'bankChannelId', ''),
                        bankAccount: _get(item, 'bankAccount', ''),
                      });
                    }}
                    insertWhen={classTwoBankAccountStatus === 0 || classTwoBankAccountStatus === 2}
                  >
                    绑卡信息
                  </AuthButton>
                  <AuthButton
                    danger
                    className="text-right"
                    authId="financial/wallet:btn1"
                    loading={cardInfoLoading}
                    onClick={() => {
                      setBankChannelId(_get(item, 'bankChannelId', ''));
                      setTwoBankAccountVisible(true);
                      setOpenAccountAgain(true);
                    }}
                    insertWhen={classTwoBankAccountStatus === 3}
                  >
                    重新开户
                  </AuthButton>

                  {classTwoBankAccountStatus !== 1 && <div>仅用于收款</div>}
                </div>
              </div>
            </CommonCard>
          }
          else={
            <CommonCard
              title={_get(item, 'bankName', '')}
              isPingAnSecond={true}
              openedStatus={'HOT'}
              bankName={'pa_bank'}
              item={item}
            >
              <div className="flex-box direction-col full-height">
                <div className="flex1 flex-box direction-col">
                  <div className="fz14 color-primary bold-400">学员缴费零跑腿</div>
                  <div className="fz14 mb10 color-primary bold-400">驾校收账享奖励</div>
                </div>

                <Space size="small"></Space>
                <AuthButton
                  danger
                  onClick={debounce(() => {
                    _addMessage({
                      sysType: '1',
                      userInfo: Auth.get('schoolName') + '-' + Auth.get('operatorName'),
                      mobile: Auth.get('mobilePhone') || '',
                      productName: '3',
                      msgDesc: _get(item, 'bankName') + '-点击开通',
                    });
                    setBankChannelId(_get(item, 'bankChannelId', ''));
                    setTwoBankAccountVisible(true);
                  }, 800)}
                  className="text-right"
                  authId="financial/wallet:btn1"
                  loading={cardInfoLoading}
                >
                  开通/绑定
                </AuthButton>
              </div>
            </CommonCard>
          }
        />
      )}
    </div>
  );
}
