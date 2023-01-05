import { Badge, Col, Row, Tabs } from 'antd';
import { Integral } from './Integral';
import { Auth, _get } from 'utils';
import { useFetch, useForceUpdate } from 'hooks';
import { _getBaseInfo } from 'api';
import { IF, Loading } from 'components';
import { _queryAccountBalanceAll } from './_api';
import { CardCommon } from './CardCommon';
import useAccountType from './useAccountType';
import { useState } from 'react';
// import './index.scss';

const cardReturnDisable = ['01', '02', '03', '04']; // IC卡-正常 IC卡-补 教练虚拟点卡 积分
export default function Foo() {
  const [accountType, _setAccountType] = useAccountType();
  const [defaultKey, setDefaultKey] = useState('');
  const { TabPane } = Tabs;
  const [ignore, updatePage] = useForceUpdate();
  // 驾校基本信息详情
  const { data, isLoading } = useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getBaseInfo,
  });

  const { data: accountData } = useFetch({
    request: _queryAccountBalanceAll,
    depends: [ignore],
    query: {
      accountType: '00', // 账户类型 00:普通 10-代理商
    },
    callback(data) {
      setDefaultKey(_get(_get(data, 'subAccounts', []), '0.subAccountType') + '');
    },
  });

  const tabs = _get(accountData, 'subAccounts', []).map((item: any) => {
    return {
      ...item,
      tabName: item.subAccountName,
      key: item.subAccountType,
      cardReturnDisable: cardReturnDisable.includes(item.subAccountType),
    };
  });
  const Memo = (props: { memo: string }) => {
    const { memo } = props;
    return (
      <span style={{ alignSelf: 'flex-start' }} className="color-999999">
        {memo ? `注：${memo}` : ''}
      </span>
    );
  };
  return (
    <div>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <div>
            <Row className="border-line">
              <Col span={8}>
                <Badge color="#F3302B" className="bold" />
                <span>我的账户：{_get(data, 'name')}</span>
              </Col>
              <Col span={12}>
                <span className="ml20">社会信用代码：{_get(data, 'socialCredit')}</span>
              </Col>
            </Row>

            {/* @ts-ignore */}
            <Tabs
              activeKey={accountType || defaultKey}
              onTabClick={(key) => {
                _setAccountType(key);
              }}
            >
              {tabs.map((x: any) => {
                if (x.subAccountType === 'A1') {
                  //镇江 学员档案专用：剩余注册名额，此处不用
                  // eslint-disable-next-line array-callback-return
                  return;
                }
                if (x.tabName === '积分') {
                  return (
                    <TabPane tab={x.tabName} key={x.key} className="flex-box  direction-col">
                      <Memo memo={_get(x, 'memo')} />
                      <Integral updatePage={updatePage} />
                    </TabPane>
                  );
                }
                return (
                  <TabPane tab={x.tabName} key={x.key} className="flex-box direction-col">
                    <Memo memo={_get(x, 'memo')} />
                    <CardCommon
                      data={{ ...x, accountName: _get(data, 'name') }}
                      subAccountType={x.key}
                      accountBalance={x.accountBalance}
                      updatePage={updatePage}
                    />
                  </TabPane>
                );
              })}
            </Tabs>
          </div>
        }
      />
    </div>
  );
}
