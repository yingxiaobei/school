import { Button, Carousel, Modal, Table } from 'antd';
import moment from 'moment';
import { Auth, generateMenuMap, getWeek, _get } from 'utils';
import ONLINE from 'statics/images/home_img.png';
import ERP from 'statics/images/banner/ERP.png';
import TRAIN from 'statics/images/banner/train.png';
import LUKAOYI from 'statics/images/banner/lukaoyi.png';
import IMG1 from 'statics/images/qrcode1.png';
import IMG2 from 'statics/images/qrcode2.png';
import IMG3 from 'statics/images/qrcode3.png';
import IMG4 from 'statics/qrcode4.jpg';
import { useVisible } from 'hooks';
import { _getBaseInfo } from 'api';
import useBanner from './hooks/useBanner';
import useStudentExam from './hooks/useStudentExam';
import useCoaching from './hooks/useCoaching';
import { ColumnsType } from 'antd/lib/table';
import {
  CoachingData,
  COACH_TRAIN_STATIC,
  EXAM_PASS_RATE,
  EXAM_RESULT_MANAGE,
  Path,
  PHASED_REVIEW,
  StudentExamData,
  STUDENT_INFO,
} from './schoolHomeType';
import { ConfigProvider } from 'antd';
import styles from './index.module.css';
import { Link } from 'react-router-dom';
import { PUBLIC_URL } from 'constants/env';
import { RightOutlined } from '@ant-design/icons';
import GlobalContext from 'globalContext';
import { useContext, useEffect, useState } from 'react';
import DashBarList from './components/dashbarList';
import Enrollment from './components/enrollment';
import Shortcut from './components/shortcut';
import PassRate from './components/passRate';
import usePassRate from './hooks/usePassRate';
import { useHistory } from 'react-router-dom';
import useEnrollment from './hooks/useEnrollment';
import { PRIMARY_COLOR } from 'constants/styleVariables';

export default function SchoolHome() {
  const history = useHistory();
  const { $menuTree } = useContext(GlobalContext);
  const [isOpenExamResultManage, setIsOpenExamResultManage] = useState(false); // 考试成绩管理
  const [isCoachTrainStatistic, setCoachTrainStatistic] = useState(false); // 教练带教学时权限
  const [isOpenExamPassRate, setIsOpenExamPassRate] = useState(false); // 考试合格率权限
  const [isOpenStudentInfo, setIsOpenStudentInfo] = useState(false); // 学员新增权限
  const [isOpenPhasedReview, setIsOpenPhasedReview] = useState(false); // 阶段报审权限

  const normalBanner = [
    {
      materialContent1: ONLINE,
    },
    {
      materialContent1: ERP,
    },
    {
      materialContent1: TRAIN,
    },
    {
      materialContent1: LUKAOYI,
    },
  ];

  useEffect(() => {
    const allMenu: object = generateMenuMap($menuTree);
    if (Object.prototype.hasOwnProperty.call(allMenu, EXAM_RESULT_MANAGE)) {
      setIsOpenExamResultManage(true);
    }
    if (Object.prototype.hasOwnProperty.call(allMenu, EXAM_PASS_RATE)) {
      setIsOpenExamPassRate(true);
    }
    if (Object.prototype.hasOwnProperty.call(allMenu, COACH_TRAIN_STATIC)) {
      setCoachTrainStatistic(true);
    }
    if (Object.prototype.hasOwnProperty.call(allMenu, PHASED_REVIEW)) {
      setIsOpenPhasedReview(true);
    }
    if (Object.prototype.hasOwnProperty.call(allMenu, STUDENT_INFO)) {
      setIsOpenStudentInfo(true);
    }
  }, [$menuTree]);

  const [bannerList] = useBanner();
  const [studentExamData, studentExamLoading] = useStudentExam(isOpenExamResultManage);
  const [coachData, coachLoading] = useCoaching(isCoachTrainStatistic);
  const [subjectTwo, subjectTree, passRateLoading] = usePassRate(isOpenExamPassRate);

  const [enrollment, enrollmentLoading] = useEnrollment();

  const week = moment().format('E');
  const [visible, setVisible] = useVisible();
  const columns: ColumnsType<StudentExamData> = [
    {
      title: '姓名',
      dataIndex: 'studentName',
    },
    {
      title: '考试日期',
      dataIndex: 'testDate',
    },
    {
      title: '考试场地',
      dataIndex: 'testPlace',
    },
    {
      title: '考试场次',
      dataIndex: 'testEtc',
    },
  ];

  const columns2: ColumnsType<CoachingData> = [
    {
      title: '姓名',
      dataIndex: 'cname',
    },
    {
      title: '总时长',
      dataIndex: 'statisticTimeSum',
    },
    {
      title: '总公里',
      dataIndex: 'statisticMileSum',
    },
  ];
  const ModalInfo = (props: any) => {
    const { onCancel } = props;
    return (
      <Modal visible onCancel={onCancel} footer={null} title="提示">
        <div className="flex-box direction-col mb20">
          <div className="fz16 mb10 bold">暂未开通此功能，请联系客服开通功能！</div>
          <div className="mb10">全方位解决驾校运行管理难题</div>
          <img src={IMG4} width={150} alt="" />
        </div>
      </Modal>
    );
  };

  const jump = (conditions: boolean, path: Path) => {
    if (conditions) {
      history.push(`${PUBLIC_URL}${path}`);
    } else {
      setVisible();
    }
  };

  const link = (path: Path) => {
    //  判断对应的权限是否存在 存在的话就直接跳转链接 不存在的话同理 弹出modal
    switch (path) {
      case EXAM_RESULT_MANAGE:
        jump(isOpenExamResultManage, EXAM_RESULT_MANAGE);
        break;
      case EXAM_PASS_RATE:
        jump(isOpenExamPassRate, EXAM_PASS_RATE);
        break;
      case COACH_TRAIN_STATIC:
        jump(isCoachTrainStatistic, COACH_TRAIN_STATIC);
        break;
      case PHASED_REVIEW:
        jump(isOpenPhasedReview, PHASED_REVIEW);
        break;
      case STUDENT_INFO:
        jump(isOpenStudentInfo, STUDENT_INFO);
        break;
      default:
        break;
    }
  };

  return (
    <div className="pl20 pr20 pt10 pb20" style={{ background: '#fafafa' }}>
      {visible && <ModalInfo onCancel={setVisible} />}
      <div className="fz20 bold flex space-between mb10">
        <span>欢迎您，{Auth.get('schoolName')}</span>
        <span>
          {moment().format('YYYY.MM.DD')}
          {getWeek(week)}
        </span>
      </div>
      <div>
        <Carousel autoplay>
          {bannerList
            ? bannerList.map((banner, index) => (
                <div key={index}>
                  <div
                    onClick={() => {
                      if (_get(banner, 'materialContent2')) {
                        window.open(banner.materialContent2);
                      }
                    }}
                  >
                    <img
                      style={{ width: '100%', borderRadius: 10, height: 200 }}
                      src={banner.materialContent1}
                      alt=""
                    />
                  </div>
                </div>
              ))
            : normalBanner.map((banner, index) => (
                <div key={index}>
                  <img style={{ width: '100%', borderRadius: 10, height: 200 }} src={banner.materialContent1} alt="" />
                </div>
              ))}
        </Carousel>
      </div>
      {/* TODO: 11-1 快捷操作（开通/未开通） 招生情况（一直存在）*/}
      <div className="flex mt20 mb20">
        <div className="flex1">
          <div className="fz18 mb10 flex space-between">
            <span>快捷操作</span>
            {/* 更多的children */}
          </div>
          {/* content children */}
          <Shortcut jumpLink={link} />
        </div>

        <div className="flex1 ml20">
          <div className="fz18 mb10 flex space-between">
            <span>招生情况</span>
            {/* 更多的children */}
          </div>
          {/* content children */}
          <Enrollment loading={enrollmentLoading} dataSource={enrollment} />
        </div>
      </div>

      <div className="flex mt20 mb20">
        <div className={`flex1`}>
          <div className="fz18 mb10 flex space-between">
            <span>学员考试场次-明天</span>
            {isOpenExamResultManage && (
              <Link to={`${PUBLIC_URL}exam/examResultManage`} style={{ color: PRIMARY_COLOR, fontSize: 16 }}>
                更多 <RightOutlined />
              </Link>
            )}
          </div>
          <DashBarList loading={studentExamLoading} dataSource={studentExamData} columns={columns} />
          {!isOpenExamResultManage && (
            <div className="flex-box mt20">
              <Button type="primary" onClick={setVisible}>
                查看学员考试场次
              </Button>
            </div>
          )}
        </div>
        <div className={`flex1 ml20`}>
          <div className="fz18 mb10 flex space-between">
            <span>教练带教学时情况-近一月</span>
            {isCoachTrainStatistic && (
              <Link to={`${PUBLIC_URL}coachTrainStatistic`} style={{ color: PRIMARY_COLOR, fontSize: 16 }}>
                更多 <RightOutlined />
              </Link>
            )}
          </div>
          <DashBarList loading={coachLoading} dataSource={coachData} columns={columns2} />
          {!isCoachTrainStatistic && (
            <div className="flex-box mt20">
              <Button type="primary" onClick={setVisible}>
                查看教练带教学时统计
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* TODO: 11-1 考试合格率 近一月 (未开通/靠同) */}
      <div className="flex mt20 mb20">
        <div className="flex1">
          <div className="fz18 mb10 flex space-between">
            <span>考试合格率-近一月</span>
            {/* 更多的children */}
          </div>
          {/* content children */}
          <PassRate
            loading={passRateLoading}
            subjectThree={subjectTree}
            subjectTwo={subjectTwo}
            isOpen={isOpenExamPassRate}
            setModal={setVisible}
          />
        </div>

        <div className="flex1 ml20">{/* TODO: 后续功能 */}</div>
      </div>
      <div>
        <div className="fz18 mb10">联系我们</div>
        <div className="flex space-around background-white pt10 pb20">
          <div className="flex-box direction-col">
            <div className={styles['qrcode-title']}>公众号</div>
            <img src={IMG3} className="w120 mb10" alt="微信公众号" />
            <div className="flex-box direction-col">
              <div className={styles['qrcode-item']}>远方学车</div>
              <div className={styles['qrcode-item']}>微信公众号</div>
            </div>
          </div>
          <div className="flex-box direction-col">
            <div className={styles['qrcode-title']}>学员端</div>
            <img src={IMG1} className="w120 mb10" alt="学员端APP" />
            <div className="flex-box direction-col">
              <div className={styles['qrcode-item']}>维尔驾服</div>
              <div className={styles['qrcode-item']}>学员端APP</div>
            </div>
          </div>

          <div className="flex-box direction-col">
            <div className={styles['qrcode-title']}>校长/教练端</div>
            <img src={IMG2} className="w120 mb10" alt="校长/教练端APP" />
            <div className="flex-box direction-col">
              <div className={styles['qrcode-item']}>维尔驾服</div>
              <div className={styles['qrcode-item']}>校长/教练端APP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
