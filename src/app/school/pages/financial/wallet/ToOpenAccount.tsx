import { Card, Modal, Tooltip } from 'antd';
import { _get, Auth } from 'utils';
import { AuthButton } from 'components';
import { _openSchoolAccount, _addMessage } from './_api';
import CommonCard from './CommonCard';
import { debounce } from 'lodash';
interface IProps {
  item: any;
  setBankAccount(param: string): void;
  setBankChannelId(param: string): void;
  run: any;
  pingAnBank: boolean;
  zheShangBank: boolean;
  setOpenAccountVisible(): void;
  bankChannelType: string;
  setLoading(param: boolean): void;
  forceUpdate(): void;
  setZSgOpenAccountVisible(): void;
}

export default function ToOpenAccount(props: IProps) {
  const { confirm } = Modal;
  const {
    item,
    setBankChannelId,
    setBankAccount,
    pingAnBank,
    setOpenAccountVisible,
    bankChannelType,
    setLoading,
    forceUpdate,
    zheShangBank,
    setZSgOpenAccountVisible,
  } = props;
  const memo = _get(item, 'memo') ? _get(item, 'memo') : '本钱包的账户说明暂时还没有哦，敬请期待';
  const memo_show = memo.length >= 30 ? memo.substr(0, 30) + '...' : memo; // 字数限制30，鼠标点到弹窗显示全部文字

  return (
    <CommonCard title={_get(item, 'bankName', '')} openedStatus={'not_opened'} bankName={bankChannelType} item={item}>
      <div className="flex direction-col full-height">
        <span className="flex1 flex-box color-primary">
          <Tooltip placement="right" title={memo}>
            {memo_show}
          </Tooltip>
        </span>
        <AuthButton
          // loading={loading}
          authId="financial/wallet:btn1"
          danger
          style={{ alignSelf: 'center' }}
          onClick={debounce(() => {
            _addMessage({
              sysType: '1',
              userInfo: Auth.get('schoolName') + '-' + Auth.get('operatorName'),
              mobile: Auth.get('mobilePhone') || '',
              productName: '3',
              msgDesc: _get(item, 'bankName') + '-点击开通',
            });
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
          }, 800)}
        >
          开通/绑定
        </AuthButton>
      </div>
    </CommonCard>
  );
}
