import { _get } from 'utils';
import CommonCard from './CommonCard';
import close_red from 'statics/images/wallet/close_red.png';
import { Button, Modal } from 'antd';
import { _openSchoolAccount, _abandonSchoolAccount } from './_api';
import { useRequest } from 'hooks';

interface IProps {
  item: any;
  bankChannelType: string;
  setBankChannelId(param: string): void;
  setTwoBankAccountVisible(param: boolean): void;
  setLoading: any;
  setOpenAccountVisible: any;
  forceUpdate: any;
  setBankAccount: any;
  setZSgOpenAccountVisible: any;
  setOpenAccountAgain(param: boolean): void;
}

export default function OpeningAccount(props: IProps) {
  const {
    item,
    bankChannelType,
    setBankChannelId,
    setTwoBankAccountVisible,
    setLoading,
    setOpenAccountVisible,
    forceUpdate,
    setBankAccount,
    setZSgOpenAccountVisible,
    setOpenAccountAgain,
  } = props;

  const isOpenClassTwoAccount = bankChannelType === 'pa_bank_second';
  if (isOpenClassTwoAccount) {
    item.failMessage = _get(item, 'ClassTwoBankAccountStatus.zjMessage', '');
  }
  const status = _get(item, 'status') || _get(item, 'ClassTwoBankAccountStatus.status');

  const isFailed = status === 3;
  const { confirm } = Modal;

  const { loading, run } = useRequest(_abandonSchoolAccount, {
    onSuccess: () => {
      forceUpdate();
    },
  });

  return (
    <CommonCard
      isPingAnSecond={false}
      title={_get(item, 'bankName', '')}
      openedStatus={_get(item, 'status')}
      bankName={bankChannelType}
      isOpening={true}
      item={item}
    >
      {
        <div className="flex-box direction-col full-height">
          {isFailed && (
            <span className="color-primary flex1 flex-box">
              <img src={close_red} className="mr10 img-icon" alt="" />
              开户失败{_get(item, 'failMessage', '') ? `：${_get(item, 'failMessage', '')}` : ''}
            </span>
          )}
          {isFailed && (
            <div>
              <Button
                className="mr20"
                type="primary"
                loading={loading}
                onClick={() => {
                  run({
                    bankChannelId: _get(item, 'bankChannelId', ''),
                  });
                }}
              >
                放弃
              </Button>
              <Button
                danger
                onClick={() => {
                  const bankChannelType = _get(item, 'bankChannelType', '');
                  // pa_bank:平安银行
                  const pingAnBank = bankChannelType === 'pa_bank';
                  // cz_bank：浙商银行
                  const zheShangBank = bankChannelType === 'cz_bank';

                  if (isOpenClassTwoAccount) {
                    setBankChannelId(_get(item, 'bankChannelId', ''));
                    setTwoBankAccountVisible(true);
                    setOpenAccountAgain(true);
                    return;
                  }
                  let bankChannel = _get(item, 'bankChannelId', '');
                  setBankChannelId(bankChannel);
                  //平安银行开户弹窗
                  if (pingAnBank) {
                    return setOpenAccountVisible();
                  }
                  //浙商银行开户弹窗
                  if (zheShangBank) {
                    return setZSgOpenAccountVisible();
                  }
                  if (bankChannelType !== 'pa_bank') {
                    confirm({
                      title: `是否确定开户？`,
                      content: '',
                      okText: '确定',
                      okType: 'danger',
                      cancelText: '取消',
                      async onOk() {
                        let bankChannel = _get(item, 'bankChannelId', '');
                        setBankChannelId(bankChannel);
                        setLoading(true);
                        const res = await _openSchoolAccount({
                          bankChannelId: bankChannel,
                          bankChannelType: bankChannelType,
                        });

                        if (_get(res, 'code') === 200) {
                          let bankAcc = _get(res, 'data.bankAccount', '');
                          setBankAccount(bankAcc);
                        }
                        forceUpdate();
                        setLoading(false);
                      },
                    });
                  }
                }}
              >
                再试一次
              </Button>
            </div>
          )}
          {!isFailed && <span className="color-primary flex-box flex1">开户审核中，请等待......</span>}
        </div>
      }
    </CommonCard>
  );
}
