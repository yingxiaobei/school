// 钱包管理
import { useState } from 'react';
import { message, Badge } from 'antd';
import { useFetch, useVisible, useForceUpdate, useRequest } from 'hooks';
import { _get, Auth } from 'utils';
import { _getBankList, _getAccountInfo, _queryBankCard, _getClassTwoOpenAccountStatus } from './_api';
import { Loading } from 'components';
import BindBankCard from './BindBankCard';
import Withdrawal from './Withdrawal';
import CardInfo from './CardInfo';
import AddCard from './AddCard';
import OpenAccount from './OpenAccount';
import OpenClassTwoAccount from './OpenClassTwoAccount';
import ClassTwoAccount from './ClassTwoAccount';
import OpenedAccount from './OpenedAccount';
import ToOpenAccount from './ToOpenAccount';
import OpenZheShangAccount from './OpenZheShangAccount';
import ZSBankWithdrawal from './ZSBankWithdrawal';
import OpeningAccount from './OpeningAccount';
import Recharge from './Recharge';
import './index.scss';
import QrCodeModal from './QrCodeModal';

// type=add 增值服务收款钱包 只展示平安银行电子账户 只有开通/绑定 以及申请提现功能

function Wallet(props: any) {
  const { type = 'wallet' } = props; //type : 'wallet' 钱包管理 ‘add' 增值服务收款钱包入口
  const [bankChannelId, setBankChannelId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [acctNo, setAcctNo] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [accMobile, setAccMobile] = useState('');
  const [cashAmt, setCashAmt] = useState(''); //可提现余额
  const [loading, setLoading] = useState(false);
  const [ignore, forceUpdate] = useForceUpdate();
  const [bankCardVisible, setBankCardVisible] = useVisible();
  const [withDrawalVisible, setWithDrawalVisible] = useVisible();
  const [zsWithDrawalVisible, setZSWithDrawalVisible] = useVisible();
  const [cardInfoVisible, setCardInfoVisible] = useVisible();
  const [addCardVisible, setAddCardVisible] = useVisible();
  const [openAccountVisible, setOpenAccountVisible] = useVisible();
  const [twoBankAccountVisible, setTwoBankAccountVisible] = useState(false);
  const [classTwoAccount, setClassTwoAccount] = useState(undefined);
  const [zSOpenAccountVisible, setZSgOpenAccountVisible] = useVisible();
  const [rechargeVisible, setRechargeVisible] = useVisible();
  const [opened, setOpened] = useState([]) as any;
  const [unOpened, setUnOpened] = useState([]) as any;
  const [opening, setOpening] = useState([]) as any;
  const [qrCodeVisible, setQrCodeVisible] = useVisible();
  const [qrCodeRes, setQrCodeRes] = useState();
  const [callBackData, setCallBackData] = useState();
  const [openAccountAgain, setOpenAccountAgain] = useState(false); //重新开户

  const { loading: withdrawalLoading, run } = useRequest(_queryBankCard, {
    onSuccess: (res) => {
      if (!res || Number(_get(res, 'status', 0)) === 0) {
        //未绑卡
        //res为空或status=0时，均提示未绑卡
        message.warning('你还没有绑定银行卡');
        setAddCardVisible();
      } else {
        setAccMobile(_get(res, 'accMobile'));
        setWithDrawalVisible();
      }
    },
  });

  const { loading: cardInfoLoading, run: cardInfoRun } = useRequest(_queryBankCard, {
    onSuccess: (res) => {
      if (!res || Number(_get(res, 'status', 0)) === 0) {
        //data为空或status=0时，均提示未绑卡
        //未绑卡
        setAddCardVisible();
      } else {
        setCardInfoVisible();
        setBankInfo(res);
      }
    },
  });

  const { isLoading } = useFetch({
    request: _getBankList,
    depends: [ignore],
    callback: async (data) => {
      formatData(data);
    },
  });

  // 查询二类户开户的状态
  // FIXME: ts
  const { data: ClassTwoBankAccountStatus = {}, isLoading: ClassTwoBankAccountStatusLoading } = useFetch<any>({
    request: _getClassTwoOpenAccountStatus,
    query: { bankChannelId: classTwoAccount },
    requiredFields: ['bankChannelId'],
    depends: [classTwoAccount, ignore],
  });

  const formatData = async (data: any) => {
    await Promise.all(
      data.map(async (item: any) => {
        if (_get(item, 'bankChannelType', '') === 'pa_bank_second') {
          //TODO: 发请求获取状态
          const res = await _getClassTwoOpenAccountStatus({
            bankChannelId: _get(item, 'bankChannelId', ''),
          });
          setClassTwoAccount(_get(item, 'bankChannelId', ''));
          return { ...item, ClassTwoBankAccountStatus: _get(res, 'data') };
        }

        const accData = await _getAccountInfo({
          bankChannelId: item.bankChannelId,
          bankAccount: item.bankAccount,
          busiType: '2',
          personType: '2',
          userId: Auth.get('schoolId') as string,
        });

        return { ...item, ..._get(accData, 'data', {}) };
      }),
    ).then((res: any) => {
      // setDataSource(res);
      let openArr: any = [];
      let unOpenArr: any = [];
      let openingArr: any = [];
      res.forEach((item: any) => {
        // 银行渠道类型
        const bankChannelType = _get(item, 'bankChannelType', '');
        // 如果是二类户的话不走下面的逻辑
        const isOpenClassTwoAccount = bankChannelType === 'pa_bank_second';
        // 平安银行二类户状态
        const classTwoBankAccountStatus = Number(_get(item, 'ClassTwoBankAccountStatus.status', 0));
        const status = _get(item, 'status'); // 状态 0：不可用；1：可用  2：处理中； 3：处理失败"

        if (isOpenClassTwoAccount) {
          if (classTwoBankAccountStatus === 2) {
            //成功
            openArr.push(item);
          } else if (classTwoBankAccountStatus === 0) {
            //未开通
            unOpenArr.push(item);
          } else {
            openingArr.push(item);
          }
        } else {
          if (status === 1) {
            openArr.push(item);
          } else {
            if (!status || status === 0) {
              unOpenArr.push(item);
            } else {
              openingArr.push(item);
            }
          }
        }
      });

      setOpened([...openArr]);
      setUnOpened([...unOpenArr]);
      setOpening([...openingArr]);
    });
  };

  return (
    <div>
      {isLoading && <Loading />}
      {!isLoading && (
        <>
          {openAccountVisible && (
            <OpenAccount
              onCancel={setOpenAccountVisible}
              bankChannel={bankChannelId}
              setBankAccount={setBankAccount}
              setAcctNo={setAcctNo}
              setCashAmt={setCashAmt}
              setAddCardVisible={setAddCardVisible}
              onOk={() => {
                setOpenAccountVisible();
                forceUpdate();
              }}
              type={type}
            />
          )}
          {bankCardVisible && ( //绑卡
            <BindBankCard
              onCancel={setBankCardVisible}
              bankChannelId={bankChannelId}
              acctNo={acctNo}
              bankAccount={bankAccount}
              onOK={() => {
                forceUpdate();
                setBankCardVisible();
              }}
            />
          )}
          {withDrawalVisible && ( //提现
            <Withdrawal
              onCancel={setWithDrawalVisible}
              bankChannelId={bankChannelId}
              acctNo={acctNo}
              cashAmount={cashAmt}
              onOk={() => {
                setWithDrawalVisible();
                forceUpdate();
              }}
            />
          )}
          {zsWithDrawalVisible && ( //浙商提现
            <ZSBankWithdrawal
              onCancel={setZSWithDrawalVisible}
              bankChannelId={bankChannelId}
              bankAccount={bankAccount}
              acctNo={acctNo}
              cashAmount={cashAmt}
              onOk={() => {
                setZSWithDrawalVisible();
                forceUpdate();
              }}
            />
          )}
          {rechargeVisible && (
            <Recharge
              onCancel={setRechargeVisible}
              bankChannelId={bankChannelId}
              bankAccount={bankAccount}
              closeRecharge={setRechargeVisible}
              onOk={() => {
                forceUpdate();
              }}
              setQrCodeRes={setQrCodeRes}
              setQrCodeVisible={setQrCodeVisible}
              callback={(data: any) => {
                setCallBackData(data);
              }}
              acctNo={acctNo}
            />
          )}
          {qrCodeVisible && (
            <QrCodeModal
              res={qrCodeRes}
              onCancel={setQrCodeVisible}
              realAmount={_get(callBackData, 'realAmount')}
              fee={_get(callBackData, 'fee')}
              onOk={() => {
                setQrCodeVisible();
                forceUpdate();
              }}
            />
          )}
          {cardInfoVisible && ( //展示卡信息
            <CardInfo
              onCancel={setCardInfoVisible}
              onOk={() => {
                forceUpdate();
              }}
              setWithDrawalVisible={setWithDrawalVisible}
              bankInfo={bankInfo}
              bankAccount={bankAccount}
              bankChannelId={bankChannelId}
            />
          )}
          {addCardVisible && ( //未绑卡，需要添加银行卡
            <AddCard
              onCancel={setAddCardVisible}
              onClick={() => {
                setAddCardVisible();
                setBankCardVisible();
              }}
            />
          )}

          {/* 二类户钱包开通申请 */}
          {twoBankAccountVisible && (
            <OpenClassTwoAccount
              onCancel={setTwoBankAccountVisible}
              bankChannelId={bankChannelId}
              onOk={() => {
                forceUpdate();
              }}
              setOpenAccountAgain={setOpenAccountAgain}
              openAccountAgain={openAccountAgain}
            />
          )}

          {zSOpenAccountVisible && (
            <OpenZheShangAccount
              onCancel={setZSgOpenAccountVisible}
              bankChannelId={bankChannelId}
              onOk={() => {
                forceUpdate();
              }}
            />
          )}
          <div>
            <Badge color="#F3302B" className="bold color-primary" text={'已开通'} />
            <div className="wallet-div">
              {opened.map((item: any) => {
                // 银行渠道类型
                const bankChannelType = _get(item, 'bankChannelType', '');
                // pa_bank:平安银行
                const pingAnBank = bankChannelType === 'pa_bank';
                // 如果是二类户的话不走下面的逻辑
                const isOpenClassTwoAccount = bankChannelType === 'pa_bank_second';
                // 平安银行二类户状态
                const classTwoBankAccountStatus = Number(_get(ClassTwoBankAccountStatus, 'status', 0));
                // return  // 开户成功
                // if (_get(item, 'openedAccount', false)) {
                if (type === 'add') {
                  if (pingAnBank) {
                    return (
                      <OpenedAccount
                        key={_get(item, 'bankChannelId')}
                        item={item}
                        cardInfoLoading={cardInfoLoading}
                        setBankChannelId={setBankChannelId}
                        setBankAccount={setBankAccount}
                        setAcctNo={setAcctNo}
                        cardInfoRun={cardInfoRun}
                        run={run}
                        withdrawalLoading={withdrawalLoading}
                        pingAnBank={pingAnBank}
                        setZSWithDrawalVisible={setZSWithDrawalVisible}
                        setCashAmt={setCashAmt}
                        setRechargeVisible={setRechargeVisible}
                        type={type}
                      />
                    );
                  }
                } else {
                  if (isOpenClassTwoAccount) {
                    return (
                      <ClassTwoAccount
                        setOpenAccountAgain={setOpenAccountAgain}
                        key={_get(item, 'bankChannelId')}
                        classTwoBankAccountStatus={classTwoBankAccountStatus}
                        item={item}
                        cardInfoLoading={cardInfoLoading}
                        setBankChannelId={setBankChannelId}
                        setBankAccount={setBankAccount}
                        setAcctNo={setAcctNo}
                        cardInfoRun={cardInfoRun}
                        setTwoBankAccountVisible={setTwoBankAccountVisible}
                        ClassTwoBankAccountStatusLoading={ClassTwoBankAccountStatusLoading}
                      />
                    );
                  }
                  return (
                    <OpenedAccount
                      key={_get(item, 'bankChannelId')}
                      item={item}
                      cardInfoLoading={cardInfoLoading}
                      setBankChannelId={setBankChannelId}
                      setBankAccount={setBankAccount}
                      setAcctNo={setAcctNo}
                      cardInfoRun={cardInfoRun}
                      run={run}
                      withdrawalLoading={withdrawalLoading}
                      pingAnBank={pingAnBank}
                      setZSWithDrawalVisible={setZSWithDrawalVisible}
                      setCashAmt={setCashAmt}
                      setRechargeVisible={setRechargeVisible}
                      type={type}
                    />
                  );
                }
                // }
              })}
            </div>
          </div>
          {type !== 'add' ? (
            <div className="mt20 mb20">
              <Badge color="#1DC996" className="bold" text="开通中" />
              <div className="wallet-div">
                {opening.map((item: any) => {
                  // 银行渠道类型
                  const bankChannelType = _get(item, 'bankChannelType', '');
                  // 如果是二类户的话不走下面的逻辑
                  const isOpenClassTwoAccount = bankChannelType === 'pa_bank_second';
                  // 平安银行二类户状态
                  const classTwoBankAccountStatus = Number(_get(ClassTwoBankAccountStatus, 'status', 0));

                  // if (isOpenClassTwoAccount) {
                  //   return (
                  //     <ClassTwoAccount
                  //       key={_get(item, 'bankChannelId')}
                  //       classTwoBankAccountStatus={classTwoBankAccountStatus}
                  //       item={item}
                  //       cardInfoLoading={cardInfoLoading}
                  //       setBankChannelId={setBankChannelId}
                  //       setBankAccount={setBankAccount}
                  //       setAcctNo={setAcctNo}
                  //       cardInfoRun={cardInfoRun}
                  //       setTwoBankAccountVisible={setTwoBankAccountVisible}
                  //       ClassTwoBankAccountStatusLoading={ClassTwoBankAccountStatusLoading}
                  //     />
                  //   );
                  // } else {
                  //   return (
                  //     <OpeningAccount
                  //       bankChannelType={bankChannelType}
                  //       item={item}
                  //       setBankChannelId={setBankChannelId}
                  //       setTwoBankAccountVisible={setTwoBankAccountVisible}
                  //       setLoading={setLoading}
                  //       setOpenAccountVisible={setOpenAccountVisible}
                  //       forceUpdate={forceUpdate}
                  //       setBankAccount={setBankAccount}
                  //       setZSgOpenAccountVisible={setZSgOpenAccountVisible}
                  //     />
                  //   );
                  // }
                  return (
                    <OpeningAccount
                      setOpenAccountAgain={setOpenAccountAgain}
                      bankChannelType={bankChannelType}
                      item={item}
                      setBankChannelId={setBankChannelId}
                      setTwoBankAccountVisible={setTwoBankAccountVisible}
                      setLoading={setLoading}
                      setOpenAccountVisible={setOpenAccountVisible}
                      forceUpdate={forceUpdate}
                      setBankAccount={setBankAccount}
                      setZSgOpenAccountVisible={setZSgOpenAccountVisible}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}

          <div>
            <Badge color="#F3302B" className="bold" text="未开通" />
            <div className="wallet-div">
              {unOpened.map((item: any) => {
                // 银行渠道类型
                const bankChannelType = _get(item, 'bankChannelType', '');
                // pa_bank:平安银行
                const pingAnBank = bankChannelType === 'pa_bank';
                // cz_bank：浙商银行
                const zheShangBank = bankChannelType === 'cz_bank';
                // 如果是二类户的话不走下面的逻辑
                const isOpenClassTwoAccount = bankChannelType === 'pa_bank_second';
                // 平安银行二类户状态
                const classTwoBankAccountStatus = Number(_get(ClassTwoBankAccountStatus, 'status', 0));
                // return  // 开户成功
                // if (_get(item, 'openedAccount', false)) {
                if (type === 'add') {
                  if (pingAnBank) {
                    return (
                      <ToOpenAccount
                        key={_get(item, 'bankChannelId')}
                        item={item}
                        setBankChannelId={setBankChannelId}
                        setBankAccount={setBankAccount}
                        run={run}
                        pingAnBank={pingAnBank}
                        zheShangBank={zheShangBank}
                        setOpenAccountVisible={setOpenAccountVisible}
                        bankChannelType={bankChannelType}
                        setLoading={setLoading}
                        forceUpdate={forceUpdate}
                        setZSgOpenAccountVisible={setZSgOpenAccountVisible}
                      />
                    );
                  }
                } else {
                  if (isOpenClassTwoAccount) {
                    return (
                      <ClassTwoAccount
                        key={_get(item, 'bankChannelId')}
                        classTwoBankAccountStatus={classTwoBankAccountStatus}
                        item={item}
                        cardInfoLoading={cardInfoLoading}
                        setBankChannelId={setBankChannelId}
                        setBankAccount={setBankAccount}
                        setAcctNo={setAcctNo}
                        cardInfoRun={cardInfoRun}
                        setOpenAccountAgain={setOpenAccountAgain}
                        setTwoBankAccountVisible={setTwoBankAccountVisible}
                        ClassTwoBankAccountStatusLoading={ClassTwoBankAccountStatusLoading}
                      />
                    );
                  }
                  return (
                    <ToOpenAccount
                      key={_get(item, 'bankChannelId')}
                      item={item}
                      setBankChannelId={setBankChannelId}
                      setBankAccount={setBankAccount}
                      run={run}
                      pingAnBank={pingAnBank}
                      zheShangBank={zheShangBank}
                      setOpenAccountVisible={setOpenAccountVisible}
                      bankChannelType={bankChannelType}
                      setLoading={setLoading}
                      forceUpdate={forceUpdate}
                      setZSgOpenAccountVisible={setZSgOpenAccountVisible}
                    />
                  );
                }
                // }
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Wallet;
