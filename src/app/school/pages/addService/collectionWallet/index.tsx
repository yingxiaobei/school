import { useState } from 'react';
import { Badge, Row, Tooltip } from 'antd';
import { AuthButton, Loading } from 'components';
import { useHistory } from 'react-router-dom';
import { _get, Auth } from 'utils';
import CommonCard from 'app/school/pages/financial/wallet/CommonCard';
import { _getAccountInfo, _addMessage } from 'app/school/pages/financial/wallet/_api';
import closeEye from 'statics/images/wallet/closeEye.png';
import openEye from 'statics/images/wallet/openEye.png';
import { debounce } from 'lodash';
import OpenAccount from 'app/school/pages/financial/wallet/OpenAccount';
import { _getBankList } from './api';
import { useVisible, useFetch, useForceUpdate } from 'hooks';

const CollectionWallet = () => {
  const [acctNoOpenEye, setAcctNoOpenEye] = useState(false);
  const [acctByWeekOpenEye, setAcctByWeekOpenEye] = useState(false);
  const [openAccountVisible, setOpenAccountVisible] = useVisible();
  const [ignore, forceUpdate] = useForceUpdate();
  const history = useHistory();
  const [opened, setOpened] = useState<any>({});
  const [unopened, setUnopened] = useState<any>({});
  const acctNo = String(_get(opened, 'acctNo', ''));
  const acctNoClose = acctNo
    ? acctNo.length > 6
      ? acctNo.substr(0, 3) + '***' + acctNo.substr(acctNo.length - 3)
      : acctNo
    : '/';
  const acctByWeek = _get(opened, 'acctByWeek', '');
  const week = acctByWeek ? `￥${acctByWeek}` : acctByWeek === 0 ? '￥0' : '暂无数据';

  const memo = _get(unopened, 'memo') ? _get(unopened, 'memo') : '本钱包的账户说明暂时还没有哦，敬请期待';
  const memo_show = memo.length >= 30 ? memo.substr(0, 30) + '...' : memo; // 字数限制30，鼠标点到弹窗显示全部文字

  const { isLoading } = useFetch({
    request: _getBankList,
    depends: [ignore],
    callback: async (data) => {
      formatData(data);
    },
  });

  const formatData = async (data: any) => {
    await Promise.all(
      data.map(async (item: any) => {
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
      // 收款钱包只有平安银行电子户，所以只会有一个银行。res长度只能为1，若不是1，需要跟双林沟通
      if (_get(res, '[0].status') === 1) {
        setOpened(_get(res, '[0]', {}));
        setUnopened({});
      } else {
        setUnopened(_get(res, '[0]', {}));
        setOpened({});
      }
    });
  };
  return (
    <div>
      {isLoading && <Loading />}
      {openAccountVisible && (
        <OpenAccount
          onCancel={setOpenAccountVisible}
          bankChannel={_get(unopened, 'bankChannelId', '')}
          onOk={() => {
            setOpenAccountVisible();
            forceUpdate();
          }}
          type={'add'}
        />
      )}
      <div>
        <Badge color="#F3302B" className="bold color-primary" text={'已开通'} />
        <div className="wallet-div">
          {opened != null && Object.keys(opened).length ? (
            <CommonCard
              title={_get(opened, 'bankName', '')}
              openedStatus={'opened'}
              bankName={_get(opened, 'bankChannelType', '')}
              item={opened}
            >
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
                  ：￥{_get(opened, 'availBal', '0')}
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
                  {`：￥${_get(opened, 'cashAmt', '0')}`}
                </p>

                <p className="mb10">
                  <span className="wallet-span">待提现余额</span>
                  {`：￥${_get(opened, 'waitCashAmt', '0')}`}
                </p>

                <p className="fz14 text-center color-primary">(注：实际金额以银行为准)</p>
              </div>

              <Row justify="center" className="space-around mt20 full-width">
                <AuthButton
                  authId="financial/wallet:btn2"
                  type="primary"
                  onClick={() => {
                    history.push(`../valueAddOrder/withdrawalApplication`);
                    return;
                  }}
                >
                  立即提现
                </AuthButton>
              </Row>
            </CommonCard>
          ) : null}
        </div>
      </div>
      <div>
        <Badge color="#F3302B" className="bold" text="未开通" />
        <div className="wallet-div">
          {unopened != null && Object.keys(unopened).length ? (
            <CommonCard
              title={_get(unopened, 'bankName', '')}
              openedStatus={'not_opened'}
              bankName={_get(unopened, 'bankChannelType', '')}
              item={unopened}
            >
              <div className="flex direction-col full-height">
                <span className="flex1 flex-box color-primary">
                  <Tooltip placement="right" title={memo}>
                    {memo_show}
                  </Tooltip>
                </span>
                <AuthButton
                  authId="collectionWallet:btn1"
                  danger
                  style={{ alignSelf: 'center' }}
                  onClick={debounce(() => {
                    _addMessage({
                      sysType: '1',
                      userInfo: Auth.get('schoolName') + '-' + Auth.get('operatorName'),
                      mobile: Auth.get('mobilePhone') || '',
                      productName: '3',
                      msgDesc: _get(unopened, 'bankName') + '-点击开通',
                    });
                    let bankChannel = _get(unopened, 'bankChannelId', '');
                    // setBankChannelId(bankChannel);
                    //平安银行开户弹窗
                    if (_get(unopened, 'bankChannelType', '') === 'pa_bank') {
                      return setOpenAccountVisible();
                    }
                  }, 800)}
                >
                  开通
                </AuthButton>
              </div>
            </CommonCard>
          ) : null}
        </div>
      </div>
    </div>
  );
};
export default CollectionWallet;
