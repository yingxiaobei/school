import { RightOutlined } from '@ant-design/icons';
import { Col, Empty, Row, Spin } from 'antd';
import { EXAM_PASS_RATE, Subject } from 'components/schoolHome/schoolHomeType';
import { PUBLIC_URL } from 'constants/env';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import { useHistory } from 'react-router-dom';
import { _get } from 'utils';
import styles from './index.module.css';

interface Props {
  loading: boolean;
  subjectTwo: Subject;
  subjectThree: Subject;

  // 按照原型图的格式_展示
  isOpen: boolean; // 权限控制
  setModal: () => void;
}

function PassRate({ loading, subjectTwo, subjectThree, isOpen, setModal }: Props) {
  const history = useHistory();

  const link = () => {
    if (isOpen) {
      history.push(`${PUBLIC_URL}${EXAM_PASS_RATE}`);
    } else {
      setModal();
    }
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.wrapper} style={{ position: 'relative' }}>
        {isOpen ? (
          <Row className="full-height" align="middle">
            <Col span={12}>
              <div className={styles.subWrapper}>
                <div className={styles.rate}>{_get(subjectTwo, 'passRate', '0')}%</div>
                <div className={styles.number}>
                  <div style={{ margin: '12px 0' }}>科二</div>
                  <div style={{ margin: '12px 0' }}>参考人数：{_get(subjectTwo, 'examCount', 0)}</div>
                  <div style={{ margin: '12px 0' }}>
                    考出人数：{_get(subjectTwo, 'onePassCount', 0) + _get(subjectTwo, 'mulPassCount', 0)}
                  </div>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.subWrapper}>
                <div className={styles.rate}>{_get(subjectThree, 'passRate', '0')}%</div>
                <div className={styles.number}>
                  <div style={{ margin: '12px 0' }}>科三</div>
                  <div style={{ margin: '12px 0' }}>参考人数：{_get(subjectThree, 'examCount', 0)}</div>
                  <div style={{ margin: '12px 0' }}>
                    考出人数：{_get(subjectThree, 'onePassCount', 0) + _get(subjectThree, 'mulPassCount', 0)}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        ) : (
          <>
            <Empty className={styles.empty} />
          </>
        )}
        <p onClick={link} style={{ color: PRIMARY_COLOR, fontSize: 16, cursor: 'pointer' }} className={styles.link}>
          查看考试合格率 <RightOutlined />
        </p>
      </div>
    </Spin>
  );
}

export default PassRate;
