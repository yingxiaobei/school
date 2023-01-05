import { Button, message, Modal, Radio, Row } from 'antd';
import { useFetch, useRequest } from 'hooks';
import { useState } from 'react';
import { _getAccountInfo, _openSchoolAccount, _getBaseInfo, _getSchool } from './_api';
import { Auth, _get } from 'utils';
import { IF, Loading } from 'components';

interface IProps {
  onCancel(): void;
  bankChannel: any;
  setBankAccount?(param: string): void;
  setAcctNo?(param: string): void;
  setCashAmt?(param: string): void;
  setAddCardVisible?(): void;
  onOk(): void;
  type?: string; //type : 'wallet' 钱包管理 ‘add' 增值服务收款钱包入口
}

export default function OpenAccount(props: IProps) {
  const {
    onCancel,
    bankChannel,
    setBankAccount,
    setAcctNo,
    setCashAmt,
    setAddCardVisible,
    onOk,
    type = 'wallet',
  } = props;

  const [disabled, setDisabled] = useState(true);
  const [componyName, setComponyName] = useState('');
  const [certificate, setCertificate] = useState('');

  const [idCard, setIdcard] = useState('');
  const { confirm } = Modal;
  // 驾校基本信息详情
  const { isLoading: schoolDataLoading } = useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getBaseInfo,
    callback: (data: any) => {
      setComponyName(_get(data, 'name', ''));
      setIdcard(_get(data, 'socialCredit', ''));
      setCertificate(_get(data, 'certificate', ''));
    },
  });

  // 驾校基本信息详情
  const { data } = useFetch({
    query: {
      proSchoolId: Auth.get('schoolId'),
    },
    request: _getSchool,
  });
  const { loading, run } = useRequest(_openSchoolAccount, {
    onSuccess: async (res) => {
      let bankAcc = _get(res, 'bankAccount', '');
      setBankAccount && setBankAccount(bankAcc);
      const ress = await _getAccountInfo({
        bankChannelId: bankChannel,
        bankAccount: bankAcc,
        busiType: '2',
        personType: '2',
        userId: Auth.get('schoolId') as string,
      });
      setAcctNo && setAcctNo(_get(ress, 'data.acctNo', ''));
      setCashAmt && setCashAmt(_get(res, 'data.cashAmt', ''));
      onOk();

      type === 'add'
        ? confirm({
            title: `开户成功，现在可以让学员购买商品了！`,
            content: '',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            async onOk() {},
          })
        : confirm({
            title: `开户成功，立即添加银行账户？`,
            content: '',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            async onOk() {
              setAddCardVisible && setAddCardVisible();
            },
          });
    },
  });

  return (
    <Modal visible title={'资料确认'} maskClosable={false} onCancel={onCancel} footer={null} width={400}>
      <div>
        <IF
          condition={schoolDataLoading}
          then={<Loading />}
          else={
            <div className="wallet-openAccount-div">
              <Row>企业名称：{componyName}</Row>
              <Row>证件类型：{idCard ? '社会信用代码' : '营业执照号'}</Row>
              <Row>证件号码：{idCard || certificate || '无'}</Row>
              {type === 'add' ? <Row>合作公司：{_get(data, 'name')}</Row> : null}
              <Radio
                className="whitespace-normal"
                onChange={(e) => {
                  e.target.checked ? setDisabled(false) : setDisabled(true);
                }}
              >
                已阅读并同意
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://my.orangebank.com.cn/orgLogin/hd/act/jianzb/jzbxy.html"
                >
                  《平安银行电子商务支付结算服务协议》
                </a>
                、
                <a target="_blank" rel="noopener noreferrer" href="https://auth.orangebank.com.cn/#/m/cDealOne">
                  《平安数字用户服务协议》
                </a>
              </Radio>
            </div>
          }
        />
      </div>

      <Row justify={'end'} className="mt10">
        <Button onClick={onCancel} className="mr20">
          取消
        </Button>
        <Button
          type="primary"
          loading={loading}
          disabled={disabled}
          onClick={() => {
            if (!(idCard || certificate)) {
              message.error('企业信息不完整，请联系服务工程师补录');
              return;
            }
            run({ bankChannelId: bankChannel, accId: idCard || certificate, memberGlobalType: idCard ? '73' : '68' });
          }}
        >
          确认
        </Button>
      </Row>
    </Modal>
  );
}
