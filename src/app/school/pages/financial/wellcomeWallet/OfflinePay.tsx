import { Row, Select, Button, message } from 'antd';
import { useFetch } from 'hooks';
import { useState } from 'react';
import { Auth, _get } from 'utils';
import { _queryBankList } from './_api';
import copy from 'copy-text-to-clipboard';
import OFFLINEUNOPEN from 'statics/images/offlineUnopen.png';

import { IF, Loading } from 'components';

export function OfflinePay(props: any) {
  const { bankId, setBankId, setOfflinePayData, rechargeNumApply, subAccountType } = props;
  const [accountName, setAccountName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankListOptions, setBankListOptions] = useState([]);
  const [bankName, setBankName] = useState('');
  const { data, isLoading } = useFetch({
    request: _queryBankList,
    query: {
      onlineCharge: '0',
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

  return (
    <div>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          _get(data, 'bankList.length', 0) > 0 ? (
            <div>
              <Row className="mb10 color-primary">预计到账后1个工作日内发放</Row>
              <Row className="mb10">①选择转入账户 ②网上银行或临柜转入金额 ③上传转账回执单</Row>
              <Row className="mb10">
                收款银行：
                <Select
                  className="width-150"
                  options={bankListOptions}
                  getPopupContainer={(triggerNode: any) => triggerNode.parentElement}
                  onChange={(value: any) => {
                    setBankId(value);
                  }}
                  onSelect={(value: any) => {
                    const seletedBank = _get(data, 'bankList', []).filter((x: any) => {
                      return x.bankId == value;
                    });
                    setAccountName(_get(seletedBank, '0.companyName', ''));
                    setBankAccount(_get(seletedBank, '0.bankAccount', ''));
                    setBankName(_get(seletedBank, '0.bankName', ''));
                    setOfflinePayData({
                      rechargeNumApply,
                      bankId: value,
                      accountName: _get(seletedBank, '0.companyName', ''),
                      bankAccount: _get(seletedBank, '0.bankAccount', ''),
                      bankName: _get(seletedBank, '0.bankName', ''),
                    });
                  }}
                />
              </Row>
              <Row className="mb10">账户名：{accountName}</Row>
              <Row className="mb10">账号：{bankAccount}</Row>
              <Row>
                <Button
                  onClick={() => {
                    if (!bankName) {
                      return message.error('请选择银行');
                    }
                    if (copy(`银行：${bankName}；户名：${accountName}；账号：${bankAccount}`)) {
                      return message.info('复制成功');
                    }
                  }}
                >
                  一键复制收款账号
                </Button>
              </Row>
            </div>
          ) : (
            <div className="flex-box mt20 fz16 height-200">
              <img src={OFFLINEUNOPEN} className="mr20" alt="" />
              您所在区域暂未开通线下转账，详询当地服务工程师。
            </div>
          )
        }
      />
    </div>
  );
}
