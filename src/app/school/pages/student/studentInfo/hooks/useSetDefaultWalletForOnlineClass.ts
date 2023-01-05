import { useCallback, useEffect, useState } from 'react';
import { _get } from 'utils';
import { _queryDefaultChannelByPackage } from '../_api';

interface Props {
  package_id: string;
  cid?: string;
  train_price_online: number;
  isEdit: boolean;
  isChangeClass: number;
  // isChangeCarTypeOrBusiType: number;

  setDefaultWalletCallback: (bankInfo: typeof initialBankInfo) => void;
}

const initialBankInfo = {
  bankName: '',
  bankchannelid: '',
  bankaccount: '',
};

export const useSetDefaultWalletForOnlineClass = ({
  package_id,
  cid,
  train_price_online,
  isEdit,
  isChangeClass,
  // isChangeCarTypeOrBusiType,

  setDefaultWalletCallback,
}: Props) => {
  // const [bankInfo, setBankInfo] = useState(initialBankInfo);
  const [checkIsDefaultWalletLoading, setCheckDefaultWalletLoading] = useState(false);

  const setDefaultWallet = useCallback(
    async (package_id: string) => {
      try {
        setCheckDefaultWalletLoading(true);
        const defaultWalletRes = await _queryDefaultChannelByPackage({ package_id, cid })!;
        const defaultWallet = _get(defaultWalletRes, 'data');
        if (defaultWallet) {
          const bankInfo = {
            bankName: _get(defaultWallet, 'acctBankName'),
            bankchannelid: _get(defaultWallet, 'bankChannelId'),
            bankaccount: _get(defaultWallet, 'bankChannelId'),
          };
          setDefaultWalletCallback(bankInfo);
        } else {
          setDefaultWalletCallback(initialBankInfo);
        }
      } finally {
        setCheckDefaultWalletLoading(false);
      }
    },
    [cid, setDefaultWalletCallback],
  );

  useEffect(() => {
    // 进入编辑页面 不会去询问（判断） 是否有设置默认钱包
    // 只有在对 车型、业务、班级进行交互的时候
    // 造成了班级变化 (注意 首次备案成功之后 切换业务类型和车型 班级是不会被清空的 涉及到了原来的业务)

    if (isEdit) {
      if (package_id && train_price_online) {
        if (isChangeClass) {
          setDefaultWallet(package_id);
        }
      } else {
        setDefaultWalletCallback(initialBankInfo);
      }
    } else {
      if (package_id && train_price_online) {
        setDefaultWallet(package_id);
      } else {
        setDefaultWalletCallback(initialBankInfo);
      }
    }
    // dep 不增加 setDefaultWallet 的原因就是 只有当班级切换的时候 才去触发是否有设置默认钱包
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [package_id, train_price_online, isEdit, isChangeClass, setDefaultWalletCallback]);

  return [checkIsDefaultWalletLoading];
};
