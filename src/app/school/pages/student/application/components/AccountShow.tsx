import { memo } from 'react';
import { Col, Row } from 'antd';
import { _get } from 'utils';
import { ApplicationDetail, Settlement } from '../_api';
import AccountItem from './AccountItem';
import styles from './index.module.css';

interface Props {
  content: Settlement;
}

function AccountShow({ content }: Props) {
  return (
    <>
      <Row style={{ margin: '0 100px' }}>
        <Col span={8} className={styles['accountWrapper']}>
          <AccountItem text={'套餐托管总额'} account={_get(content, 'packageamount', '0.00')} />
        </Col>

        <Col span={8} className={styles['accountWrapper']}>
          <AccountItem text={'充值总额'} account={_get(content, 'rechargeamount', '0.00')} />
        </Col>

        <Col span={8} className={styles['accountWrapper']}>
          <AccountItem text={'当前余额'} account={_get(content, 'currentbalance', '0.00')} />
        </Col>
      </Row>

      <Row style={{ margin: '10px 100px 24px 100px' }}>
        <Col span={8} className={styles['accountWrapper']}>
          <AccountItem text={'已结算金额'} account={_get(content, 'settledamount', '0.00')} />
        </Col>

        <Col span={8} className={styles['accountWrapper']}>
          <AccountItem text={'待结算金额'} account={_get(content, 'tobesettledamount', '0.00')} />
        </Col>
      </Row>
    </>
  );
}

export default memo(AccountShow);
