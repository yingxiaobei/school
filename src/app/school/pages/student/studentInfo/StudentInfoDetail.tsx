import { Tabs, Drawer, Modal } from 'antd';
import { Title } from 'components';
import StudentDetails from './components/StudentDetails';
import HistoricalStudentDetail from '../historicalStudentProfile/components/historicalStudentDetail';
import TeachingJournal from './components/TeachingJournal';
import SettlementRecords from '../../financial/settlementRecords/index';
import StudentOrder from '../../financial/studentOrder';
import ElectronicFile from './components/ElectronicFile';
import OrderRecord from '../../teach/orderRecord/index';
import PhasedReview from './components/PhasedReview';
import TrainInfo from './components/TrainInfo';
import AccountInfo from './components/AccountInfo';
import { useAuth, useFetch, useForceUpdate } from 'hooks';
import ChangeRecord from 'components/ChangeRecord';
import LicenseInstrument from './components/LicenseInstrument';
import { _getExamResultList, _getPageListStuKeyinfoChange, InputRule } from './_api';
import { _get } from 'utils';
import RobotCoach from './RobotCoach';
import ExamInfo from './components/ExamInfo';
import Log from 'components/Log';
import LogChange from './LogChange';
import { useState, useMemo } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { _getSyncInfoForJGReportAuditRecords } from '../phasedReview/_api';
import { _getRecordList } from '../teachingJournal/_api';

const { TabPane } = Tabs;

interface BaseProps {
  sid: string;
  onCancel: () => void;
}
interface FreezeProps {
  // 学员档案详情中 学员是否是一次性冻结、预约冻结的学员
  idcard: string;
  isFrozenStudent: boolean;
}

interface RobotProps {
  userId: string;
  isShowRobot: boolean;
}
interface TheoryProps {
  // 这个字段之前主要用于 理论学员档案
  practicalSchoolId: string;
  isTheory: boolean;
}

export interface Extras {
  type: 'studentInfo' | 'history' | 'studentSearch'; // 使用 union type

  customSchoolId: string;
  defaultActiveKey: '1' | '2' | string; // 默认为 '1' 退学页面用到时候是 "2"
  currentRecord: unknown;
  autoInput: InputRule[];
  hashStore: Record<string, { [key: string]: string }>;

  showBtn: boolean;
  isShowExamInfo: boolean;
  isTrainProject: boolean;
  isShowElectronicFile: boolean; // 满足申请管理中不需要展示 电子档案
}
export interface Props
  extends BaseProps,
    Partial<FreezeProps>,
    Partial<RobotProps>,
    Partial<TheoryProps>,
    Partial<Extras> {}

export default function StudentInfoDetail({
  onCancel,
  sid,
  isFrozenStudent,
  showBtn = false,
  idcard = '',
  currentRecord,
  customSchoolId,
  type = 'studentInfo',
  isShowRobot = false,
  isShowExamInfo = false,
  userId,
  isTheory = false,
  practicalSchoolId,
  defaultActiveKey = '1',
  isTrainProject = true,
  isShowElectronicFile = true,
  autoInput = [], // 自定义*可配置（）的input选项
  hashStore = {},
}: Props) {
  const isShowAccountInfo = useAuth('student/studentInfo:AccountInfo');
  const [showSyncBtn, setShowSyncBtn] = useState(false);

  const [loading, setLoading] = useState(false);
  const [ignore, forceUpdate] = useForceUpdate();

  const [activeKey, setActiveKey] = useState(defaultActiveKey);

  const { data } = useFetch({
    request: _getExamResultList,
    query: {
      stuId: sid,
      limit: 10,
      page: 1,
    },
    depends: [sid],
    forceCancel: !sid,
  });

  const isShow = useMemo(() => type === 'studentInfo' || type === 'history', [type]);

  // TODO: 后期可能会调整使用到该组件的页面中的展示项 因为页面中无法获得其中tab下所需要的参数
  const isShowOtherTabPane = useMemo(() => isTrainProject, [isTrainProject]);

  async function syncInfoForJGReportAuditRecords() {
    try {
      const errList: { type: string; message: string }[] = [];
      setLoading(true);
      for (let i = 1; i <= 4; i++) {
        const res = await _getSyncInfoForJGReportAuditRecords({
          sid,
          subject: i,
        });
        const code = _get(res, 'code');
        if (code !== 200) {
          const type = `科目${i}`;
          const message = _get(res, 'message', '');
          errList.push({
            type,
            message,
          });
        }
      }

      Modal.warning({
        icon: <ExclamationCircleOutlined />,
        title: '提示信息',
        maskClosable: true,
        width: 450,
        content: (
          <>
            {!errList.length ? (
              <div className="bold">
                本次共处理{4}条, 处理成功{4}条，处理失败0条
              </div>
            ) : (
              <>
                <div className="bold">
                  本次共处理{4}条, 处理成功{4 - errList.length}条，处理失败{errList.length}条
                </div>
                {errList.map((err) => {
                  return (
                    <div>
                      <span>{err.type}</span>
                      <span> {'  '}</span> <span>{err.message}</span>
                    </div>
                  );
                })}
              </>
            )}
          </>
        ),
      });

      forceUpdate();
    } catch (err) {
      // TODO: 网络错误 | 语法错误
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Drawer
      visible
      destroyOnClose
      // getContainer={false}
      width={1300}
      title={'学员信息详情'}
      onClose={onCancel}
      footer={null}
    >
      <Tabs
        defaultActiveKey={defaultActiveKey}
        activeKey={activeKey}
        onChange={(activeKey) => {
          setActiveKey(activeKey);
        }}
      >
        <TabPane tab="学员信息" key="1">
          {type === 'history' ? (
            <HistoricalStudentDetail sid={sid} customSchoolId={customSchoolId} />
          ) : (
            <StudentDetails
              sid={sid}
              customSchoolId={customSchoolId}
              isTheory={isTheory}
              practicalSchoolId={practicalSchoolId}
              setShowSyncBtn={setShowSyncBtn}
              autoInput={autoInput}
              hashStore={hashStore}
              type={type}
            />
          )}
        </TabPane>

        {/*公众服务平台 - 学员管理页面 只展示 "学员信息" tabPane */}
        {isShow && (
          <>
            <TabPane tab="教学日志" key="2">
              <TeachingJournal sid={sid} />
            </TabPane>
            <TabPane tab="驾训信息" key="3">
              <Title>学时里程信息</Title>
              <TrainInfo sid={sid} showBtn={showBtn} showSyncBtn={showSyncBtn} />
              <Title style={{ marginTop: 20 }}>阶段报审信息</Title>
              <PhasedReview
                currentRecord={currentRecord}
                sid={sid}
                type={type}
                loading={loading}
                syncInfoForJGReportAuditRecords={syncInfoForJGReportAuditRecords}
                updateFlag={ignore}
              />
            </TabPane>

            {/* 除了 统计管理 培训项目页面 确定只展示前三项 其他(组件)页面中tabPane基本都是 >= 3 */}
            {isShowOtherTabPane && (
              <>
                {isFrozenStudent && (
                  <>
                    <TabPane tab="缴费记录" key="4">
                      <StudentOrder sid={sid} isFromStudentInfo />
                    </TabPane>

                    <TabPane tab="结算记录" key="5">
                      <SettlementRecords idcard={idcard} sid={sid} type="studentInfo" />
                    </TabPane>
                  </>
                )}
                {isShowElectronicFile && (
                  <TabPane tab="电子档案" key="6">
                    <ElectronicFile sid={sid} currentRecord={currentRecord} />
                  </TabPane>
                )}

                <TabPane tab="预约记录" key="7">
                  <OrderRecord sid={sid} isFromStudentInfo />
                </TabPane>
                <TabPane tab="变更记录" key="8">
                  <ChangeRecord paramsKey={'sid'} id={sid} api={_getPageListStuKeyinfoChange} isStu={true} />
                </TabPane>
                {isShowAccountInfo && (
                  <TabPane tab="账户信息" key="9">
                    <AccountInfo sid={sid} isShowTip={isFrozenStudent} setActiveKey={setActiveKey} />
                  </TabPane>
                )}
                {!!_get(data, 'rows.length', 0) && (
                  <TabPane tab="路考仪" key="10">
                    <LicenseInstrument sid={sid} />
                  </TabPane>
                )}
                {isShowExamInfo && (
                  <TabPane tab="考试信息" key="12">
                    <ExamInfo sid={sid} />
                  </TabPane>
                )}
                {isShowRobot && (
                  <TabPane tab="机器人教练" key="13">
                    <div>
                      <RobotCoach userId={userId} />
                    </div>
                  </TabPane>
                )}
                {/*
                  学员档案 历史学员档案 理论学员等 详情都可以展示
                  （原 "交互日志" 只有学员档案中可展示 目前简单为主 不做多余的判断）
                */}
                <TabPane tab="交互日志" key="14">
                  <Log<{ rows: LogRes[]; total: number }> entityId={sid} api={_getRecordList} />
                  <LogChange entityId={sid} />
                </TabPane>
              </>
            )}
          </>
        )}
      </Tabs>
    </Drawer>
  );
}
