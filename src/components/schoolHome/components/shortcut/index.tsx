import {
  ArrowsAltOutlined,
  AuditOutlined,
  ScheduleOutlined,
  SolutionOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Row, Col } from 'antd';
import {
  COACH_TRAIN_STATIC,
  EXAM_RESULT_MANAGE,
  Path,
  PHASED_REVIEW,
  STUDENT_INFO,
} from 'components/schoolHome/schoolHomeType';
import styles from './index.module.css';

interface Props {
  jumpLink: (path: Path) => void;
}

function Shortcut({ jumpLink }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <Row gutter={[18, 18]}>
          <Col span={12}>
            <div className={styles.cardWrapper} onClick={() => jumpLink(STUDENT_INFO)}>
              <div className={styles.iconWrapper}>
                <UserAddOutlined />
              </div>
              <div className={styles.desc}>
                <div>学员新增</div>
                <div className={styles.subText}>快速录入学员信息</div>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.cardWrapper} onClick={() => jumpLink(PHASED_REVIEW)}>
              <div className={styles.iconWrapper}>
                <AuditOutlined />
              </div>
              <div className={styles.desc}>
                <div>阶段报审</div>
                <div className={styles.subText}>处理学员阶段报审</div>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.cardWrapper} onClick={() => jumpLink(COACH_TRAIN_STATIC)}>
              <div className={styles.iconWrapper}>
                <ScheduleOutlined />
              </div>
              <div className={styles.desc}>
                <div>教练带教学时统计</div>
                <div className={styles.subText}>教练员带教学时的数据统计</div>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.cardWrapper} onClick={() => jumpLink(EXAM_RESULT_MANAGE)}>
              <div className={styles.iconWrapper}>
                <SolutionOutlined />
              </div>
              <div className={styles.desc}>
                <div>考试成绩管理</div>
                <div className={styles.subText}>同步学员交管考试中心相关信息</div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default Shortcut;
