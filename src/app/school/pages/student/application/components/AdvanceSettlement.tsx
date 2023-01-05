// 提前结算
import { Col, Form, Row, Space } from 'antd';
import { memo } from 'react';
import { _get } from 'utils';
import { Settlement } from '../_api';
import AccountShow from './AccountShow';
import { PackInfo } from './AddOrEdit';
import styles from './index.module.css';
interface Props {
  packInfo: PackInfo;
  amountInfo: Settlement;
}

function AdvanceSettlement({ packInfo, amountInfo }: Props) {
  return (
    <>
      <div className={styles['advanceSettlementNote']}>
        学员班级为冻结：将会提前结算给驾校，请确保已和学员充分沟通，无异议后再上传证明文件并提交申请。
      </div>
      <AccountShow content={amountInfo} />

      <Form.Item label="收款钱包" name={'bank'}>
        {_get(packInfo, 'bankchannelname')}
      </Form.Item>
    </>
  );
}

export default memo(AdvanceSettlement);
