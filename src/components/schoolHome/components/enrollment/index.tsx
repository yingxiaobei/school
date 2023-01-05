import { Spin, Row, Col, Empty } from 'antd';
import { EnrollmentData } from 'components/schoolHome/schoolHomeType';
import { _get } from 'utils';
import styles from './index.module.css';
interface Props {
  loading: boolean;
  dataSource: EnrollmentData;
}
// 招生情况
function Enrollment({ dataSource, loading }: Props) {
  return (
    <div className={styles.container}>
      <Spin spinning={loading}>
        <Row className={styles.body}>
          <Col span={8} className={styles.textWrapper}>
            <div>{_get(dataSource, 'day', 0)}</div>
            <div className={styles.textName}>今日报名</div>
          </Col>
          <Col span={8} className={styles.textWrapper}>
            <div>{_get(dataSource, 'month', 0)}</div>
            <div className={styles.textName}>今月报名</div>
          </Col>
          <Col span={8} className={styles.textWrapper}>
            <div>{_get(dataSource, 'year', 0)}</div>
            <div className={styles.textName}>今年报名</div>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}

export default Enrollment;
