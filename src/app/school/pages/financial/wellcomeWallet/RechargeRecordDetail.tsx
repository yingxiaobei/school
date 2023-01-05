import { Drawer, Tabs } from 'antd';
import moment from 'moment';

import { _get } from 'utils';
import { _queryJfRechargeApplyInfo } from './_api';
import ProductInfo from './ProductInfo';
import { TransactionInfo } from './TransactionInfo';
import RechargeBasicInfo from './RechargeBasicInfo';

export default function RechargeRecordDetail(props: any) {
  const { onCancel, currentRecord, onOk } = props;
  const { TabPane } = Tabs;
  const queryTime = _get(currentRecord, 'queryTime');
  const expireTime = _get(currentRecord, 'expireTime', 0) * 60;
  const passedSeconds = moment(moment().format('YYYY-MM-DD HH:mm:ss')).diff(moment(queryTime), 'seconds');
  const restTime = expireTime - passedSeconds;

  return (
    <Drawer destroyOnClose visible width={800} title={'详情'} onClose={onCancel}>
      <Tabs defaultActiveKey="basicInfo">
        <TabPane tab="基本信息" key={'basicInfo'}>
          <RechargeBasicInfo currentRecord={currentRecord} restTime={restTime > 0 ? restTime : 0} onOk={onOk} />
        </TabPane>
        <TabPane tab="商品信息" key={'productInfo'}>
          <ProductInfo currentRecord={currentRecord} />
        </TabPane>
        <TabPane tab="交易信息" key={'transactionInfo'}>
          <TransactionInfo currentRecord={currentRecord} />
        </TabPane>
      </Tabs>
    </Drawer>
  );
}
