import { Button, Row } from 'antd';
import { useFetch, useForceUpdate, useVisible } from 'hooks';

import { _get } from 'utils';
import { ExchangeRecord } from './ExchangeRecord';
import { PointsDetails } from './PointsDetails';
import { _queryAccountBalanceBySubType } from './_api';
import { IF, Loading } from 'components';
import { PointsExchange } from './PointsExchange';
import BALANCE from 'statics/images/iconBalance.png';

export function Integral(props: any) {
  const { updatePage } = props;
  const [exchangeVisible, setExchangeVisible] = useVisible();
  const [pointsDetailVisible, setPointsDetailVisible] = useVisible();
  const [pointsExchangeVisible, setPointsExchangeVisible] = useVisible();
  const [ignore, forceUpdate] = useForceUpdate();

  const { data, isLoading } = useFetch({
    request: _queryAccountBalanceBySubType,
    depends: [ignore],
    query: {
      accountType: '00', // 账户类型 00:普通 10-代理商
      subAccountType: '04', //子账号类型 00:点卡账户 01:IC卡(始) 02:IC卡(补) 03:教练虚拟点卡 04:积分
    },
  });

  const price = Number(_get(data, 'accountBalance', 0)).toFixed(2);
  const priceArr = price.split('.');

  return (
    <div className="flex-box mt20 direction-col cardDiv">
      {exchangeVisible && <ExchangeRecord onCancel={setExchangeVisible} />}
      {pointsDetailVisible && <PointsDetails onCancel={setPointsDetailVisible} />}
      {pointsExchangeVisible && (
        <PointsExchange
          onCancel={() => {
            setPointsExchangeVisible();
            updatePage();
          }}
          currentRecord={data}
          onOk={() => {
            setPointsExchangeVisible();
            forceUpdate();
            updatePage();
          }}
        />
      )}

      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <div>
            <Row className="mt20 mb20 flex bold fz50 baseline color-primary">
              <img src={BALANCE} className="mr20" alt="" />
              <span>{_get(priceArr, '0', 0)}.</span>
              <span>{_get(priceArr, '1', 0)}</span>
            </Row>
          </div>
        }
      />
      <Row className="mt20 mb20 fz18 color-666666">剩余可用</Row>
      <div className="align-center flex mt60 ">
        <Button type="primary" className="mb20 mt20  mr20 width-100 " onClick={setPointsExchangeVisible}>
          兑换
        </Button>
        <Button danger className="ml20 mr20" onClick={setExchangeVisible}>
          兑换记录
        </Button>
        <Button danger className="ml20" onClick={setPointsDetailVisible}>
          收支明细
        </Button>
      </div>
    </div>
  );
}
