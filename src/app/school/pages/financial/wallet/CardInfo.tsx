import { _get } from 'utils';
import { Button, Modal } from 'antd';
import { _unbindBankCard } from './_api';
import { useRequest } from 'hooks';

interface IProps {
  onCancel(): void;
  onOk(): void;
  setWithDrawalVisible(): void;
  bankInfo: string;
  bankAccount: string;
  bankChannelId: string;
}

function CardInfo(props: IProps) {
  const { onCancel, onOk, setWithDrawalVisible, bankInfo, bankAccount, bankChannelId } = props;
  const { confirm } = Modal;
  let bankNo = _get(bankInfo, 'bankNo', '');

  const { loading: unbindLoading, run } = useRequest(_unbindBankCard, {
    onSuccess: onOk,
  });

  return (
    <Modal visible width={400} title={'绑卡信息'} maskClosable={false} onCancel={onCancel} footer={null}>
      <div className="mb20">{'银行卡号 : ****' + bankNo.substr(bankNo.length - 4)}</div>
      <Button
        type="primary"
        className="mr10"
        onClick={() => {
          setWithDrawalVisible();
        }}
      >
        提现
      </Button>
      <Button
        loading={unbindLoading}
        onClick={() => {
          confirm({
            title: `确定解绑该银行卡？`,
            content: '',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            async onOk() {
              onCancel();
              run({
                bankAccount: bankAccount, //银行电子账户
                bankChannelId: bankChannelId, //开户渠道ID
                unbindType: '2', //解绑类型 1：用户解绑 2：驾校解绑
              });
            },
          });
        }}
      >
        解绑
      </Button>
    </Modal>
  );
}

export default CardInfo;
