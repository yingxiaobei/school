import { Drawer, Form, Row, Tabs, Divider } from 'antd';
import { useFetch, useHash, useVisible, useConfirm, useRequest, useAuth } from 'hooks';
import { _getDetails, _uploadLog, _reviewLog, _getRecordList } from './_api';
import { _get } from 'utils';
import { ItemCol, AuthWrapper, AuthButton, Title } from 'components';
import Minutes from './Minutes';
import TrainMovie from './TrainMovie';
import VehicleTrajectory from './VehicleTrajectory';
import Video from './Video';
import moment from 'moment';
import Reason from './Reason';
import Log from 'components/Log';
import { DownOutlined, LeftOutlined } from '@ant-design/icons';
import EquipmentPhotosLog from './EquipmentPhotosLog';
import { useState } from 'react';

const { TabPane } = Tabs;

export default function Details(props: any) {
  const { onCancel, currentRecord, defaultActiveKey, onOk, IsFuJian } = props;
  const [form] = Form.useForm();
  const [visible, _switchVisible] = useVisible();
  const [_showConfirm] = useConfirm();
  const [panVisible, setVisible] = useState({ pan1: true, pan2: true });
  const { data } = useFetch({
    query: {
      classid: _get(currentRecord, 'classid'),
      signstarttime: _get(currentRecord, 'signstarttime'),
    },
    request: _getDetails,
  });

  const subjectcodeHash = useHash('trans_part_type'); // 培训部分
  // 上传
  const { loading: uploadLoading, run: uploadRun } = useRequest(_uploadLog, {
    onSuccess: () => {
      onOk();
    },
  });

  const traincodeHash = useHash('subject_type'); // 课程方式
  const checkstatusJxHash = useHash('checkstatus_jx_type'); // 初审状态
  const checkstatusJgHash = useHash('checkstatus_jg_type'); // 上传状态监管审核
  const sourcetypeHash = useHash('source_type'); // 数据来源
  const iscyzgTypeHash = useHash('iscyzg_type'); // 从业资格学时
  const classrecordAppealStatusHash = useHash('classrecord_appeal_status'); // 申诉状态
  const isshareHash = useHash('ratio_is_share'); // 配比学时

  const timeLine = moment(_get(currentRecord, 'signendtime', '')).diff(
    moment(_get(currentRecord, 'signstarttime', '')),
    'minute',
  );
  // 签退－签到＜1的0学时+系统自动审批+整体无效才不能选中
  const isDisabled =
    timeLine < 1 && _get(currentRecord, 'crstate', '') === '3' && _get(currentRecord, 'reviewStatus', '') === '7';

  /** 详情底部按钮
   1. 待上传和上传失败：不变 （【学时有效】和【学时无效】两个按钮都展示）
   2. 上传中,已上传，已初审，已复审
   （1）有效状态是"无效"时，底部展示【学时有效】；
   （2）有效状态是"有效"时，底部展示【学时无效】；（有效包括整体有效和部分有效）；
   3. 电子教学日志上传中
   两个按钮都不展示*/
  const isShow = (isValidStatus: any) => {
    return (
      _get(currentRecord, 'checkstatus_jg') === '0' ||
      _get(currentRecord, 'checkstatus_jg') === '4' ||
      ((_get(currentRecord, 'checkstatus_jg') === '1' ||
        _get(currentRecord, 'checkstatus_jg') === '2' ||
        _get(currentRecord, 'checkstatus_jg') === '3' ||
        _get(currentRecord, 'checkstatus_jg') === '5') &&
        isValidStatus)
    );
  };

  const isShowEquipmentPhotoLog = useAuth('student/teachingJournal:equipmentPhotoLog');
  return (
    <Drawer
      visible
      destroyOnClose
      width={1300}
      title={'电子教学日志详情'}
      maskClosable={false}
      onClose={onCancel}
      footer={[
        <Row justify={'end'}>
          <AuthButton
            authId={'student/teachingJournal:btn10'}
            insertWhen={isShow(
              _get(currentRecord, 'crstate', '') === '1' || _get(currentRecord, 'crstate', '') === '2',
            )}
            type="primary"
            className="ml20"
            onClick={async () => {
              _switchVisible();
            }}
          >
            学时无效
          </AuthButton>
          <AuthButton
            authId={'student/teachingJournal:btn9'}
            insertWhen={isShow(_get(currentRecord, 'crstate', '') === '3')}
            type="primary"
            className="ml20"
            disabled={isDisabled}
            onClick={() => {
              _showConfirm({
                title: '是否设置本条电子教学日志有效',
                handleOk: async () => {
                  const res = await _reviewLog({
                    classids: _get(currentRecord, 'classid', ''),
                    signstarttime: _get(currentRecord, 'signstarttime', ''),
                    crstate: '1',
                  });

                  if (_get(res, 'code') === 200) {
                    onOk();
                  }
                },
              });
            }}
          >
            学时有效
          </AuthButton>
          {/*初审状态： 2:已初审 9:系统自动审批  */}
          {/*上传：（计时审核状态：已审核+系统自动审）&&（是否有效：部分有效+整体有效 ） &&（监管审核状态：未上传0+上传失败4+上传中5）才显示上传按钮*/}
          <AuthButton
            authId={'student/teachingJournal:btn11'}
            type="primary"
            insertWhen={
              (_get(data, 'checkstatus_jx') === '2' || _get(data, 'checkstatus_jx') === '9') &&
              (_get(data, 'crstate') === '1' || _get(data, 'crstate') === '2') &&
              (_get(data, 'checkstatus_jg') === '0' ||
                _get(data, 'checkstatus_jg') === '4' ||
                _get(data, 'checkstatus_jg') === '5')
            }
            loading={uploadLoading}
            className="ml20"
            onClick={async () => {
              uploadRun({
                classid: _get(currentRecord, 'classid'),
                year: moment(_get(data, 'signstarttime')).format('YYYY'),
                checkstatus_jg: _get(currentRecord, 'checkstatus_jg'),
              });
            }}
          >
            上传
          </AuthButton>
        </Row>,
      ]}
    >
      <Form form={form} autoComplete="off" labelCol={{ span: 9 }} wrapperCol={{ span: 15 }}>
        <Tabs defaultActiveKey={defaultActiveKey}>
          <TabPane tab="审核信息" key="1">
            <Title>监管审核信息</Title>
            <Row>
              <ItemCol span={8} label="上传监管时间">
                {_get(data, 'checkjg_stime')}
              </ItemCol>
              <ItemCol span={8} label="监管审核状态">
                {checkstatusJgHash[_get(data, 'checkstatus_jg', 1)]}
              </ItemCol>
              <ItemCol span={8} label="审核有效学时">
                {_get(data, 'jg_check_validtime')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={8} label="审核有效里程">
                {_get(data, 'jg_check_validmileage')}
              </ItemCol>
              <ItemCol span={8} label="备注">
                {_get(data, 'reason')}
              </ItemCol>
              {IsFuJian && (
                <ItemCol span={8} label="申诉状态">
                  {classrecordAppealStatusHash[_get(data, 'appealStatus', '')]}
                </ItemCol>
              )}
            </Row>
            {IsFuJian && (
              <Row>
                <ItemCol span={24} label="申诉原因" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
                  {_get(data, 'appealReason', '')}
                </ItemCol>
              </Row>
            )}
            <Divider />
            <Title>计时审核信息</Title>
            <Row>
              <ItemCol span={8} label="计时审核状态">
                {checkstatusJxHash[_get(data, 'checkstatus_jx', '0')]}
              </ItemCol>
              <ItemCol span={8} label="初审时间">
                {_get(data, 'checkjx_etime')}
              </ItemCol>
              <ItemCol span={8} label="初审人员">
                {_get(data, 'checkjx_username')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={8} label="初审有效学时">
                {_get(data, 'validtime_jx')}
              </ItemCol>
              <ItemCol span={8} label="初审有效里程">
                {_get(data, 'validmileage_jx')}
              </ItemCol>
              <ItemCol span={8} label="审核意见">
                {_get(data, 'msg_jx')}
              </ItemCol>
            </Row>
          </TabPane>

          <TabPane tab="日志详情" key="2">
            <Title>日志详情</Title>
            <Row>
              <ItemCol span={8} label="电子教学日志编号">
                {_get(data, 'recnum')}
              </ItemCol>
              <ItemCol span={8} label="教练姓名">
                {_get(data, 'coachname')}
              </ItemCol>
              <ItemCol span={8} label="教练证件号">
                {_get(data, 'coa_idcard')}
              </ItemCol>
            </Row>

            <Row>
              <ItemCol span={8} label="学员姓名">
                {_get(data, 'name')}
              </ItemCol>
              <ItemCol span={8} label="学员证件号">
                {_get(data, 'stu_idcard')}
              </ItemCol>
              <ItemCol span={8} label="培训部分">
                {subjectcodeHash[_get(data, 'subjectcode', '1')]}
              </ItemCol>
            </Row>

            <Row>
              <ItemCol span={8} label="课程方式">
                {traincodeHash[_get(data, 'traincode', 1)]}
              </ItemCol>
              <ItemCol span={8} label="车牌号">
                {_get(data, 'licnum')}
              </ItemCol>
              <ItemCol span={8} label="终端编号">
                {_get(data, 'termcode')}
              </ItemCol>
            </Row>

            <Row>
              <ItemCol span={8} label="数据来源">
                {sourcetypeHash[_get(data, 'sourcetype', 1)]}
              </ItemCol>
              <ItemCol span={8} label="培训机构">
                {_get(data, 'ins_name')}
              </ItemCol>
              <ItemCol span={8} label="采集时间">
                {_get(data, 'create_date')}
              </ItemCol>
            </Row>
            <Row>
              <AuthWrapper authId="student/teachingJournal:iscyzg">
                <ItemCol span={8} label="从业资格学时">
                  {iscyzgTypeHash[_get(data, 'iscyzg')]}
                </ItemCol>
              </AuthWrapper>
              <ItemCol span={8} label="配比学时">
                {isshareHash[_get(data, 'isshare')]}
              </ItemCol>
            </Row>

            <Row>
              <ItemCol span={8} label="签到信息">
                {_get(data, 'loginkey')}
              </ItemCol>
              <ItemCol span={8} label="签退信息">
                {_get(data, 'logoutkey')}
              </ItemCol>
              <ItemCol span={8} label="教学区域编号">
                {_get(data, 'regionseq')}
              </ItemCol>
            </Row>

            <Divider />
            <Title>学时详情</Title>
            <Row>
              <ItemCol span={8} label="签到时间">
                {_get(data, 'signstarttime')}
              </ItemCol>
              <ItemCol span={8} label="签退时间">
                {_get(data, 'signendtime')}
              </ItemCol>
              <ItemCol span={8} label="平均时速">
                {_get(data, 'avevelocity')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={8} label="训练时长">
                {_get(data, 'duration')}
              </ItemCol>
              <ItemCol span={8} label="车动时长">
                {_get(data, 'movetotaltime')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={8} label="点火时长">
                {_get(data, 'launchtotaltime')}
              </ItemCol>
              <ItemCol span={8} label="停车时长">
                {_get(data, 'speed')}
              </ItemCol>
              <ItemCol span={8} label="速度≤5时长">
                {_get(data, 'speed5')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={8} label="速度＞5时长">
                {_get(data, 'speed5up')}
              </ItemCol>
              <ItemCol span={8} label="训练里程">
                {_get(data, 'mileage')}
              </ItemCol>
              <ItemCol span={8} label="最高时速">
                {_get(data, 'maxspeed')}
              </ItemCol>
            </Row>
          </TabPane>

          <TabPane tab="照片详情" key="3">
            <TrainMovie currentRecord={currentRecord} />
          </TabPane>

          {currentRecord.traincode === '1' ? (
            <TabPane tab="分钟学时和轨迹" key="4">
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => {
                  setVisible({ pan1: !panVisible.pan1, pan2: panVisible.pan2 });
                }}
              >
                <Title>分钟学时</Title>

                {panVisible.pan1 ? (
                  <DownOutlined style={{ fontSize: '20px' }} />
                ) : (
                  <LeftOutlined style={{ fontSize: '20px' }} />
                )}
              </div>
              <div style={panVisible.pan1 ? {} : { display: 'none' }}>
                <Minutes currentRecord={currentRecord} />
              </div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => {
                  setVisible({ pan1: panVisible.pan1, pan2: !panVisible.pan2 });
                }}
              >
                <Title>车辆轨迹</Title>

                {panVisible.pan2 ? (
                  <DownOutlined style={{ fontSize: '20px' }} />
                ) : (
                  <LeftOutlined style={{ fontSize: '20px' }} />
                )}
              </div>

              <div style={panVisible.pan2 ? {} : { display: 'none' }}>
                <VehicleTrajectory currentRecord={currentRecord} />
              </div>
            </TabPane>
          ) : null}

          <TabPane tab="培训视频" key="5">
            <Video currentRecord={currentRecord} />
          </TabPane>

          <TabPane tab="交互日志" key="6">
            <Log<{ rows: LogRes[]; total: number }> entityId={_get(currentRecord, 'classid')} api={_getRecordList} />
            {/* 权限配置 */}
            {isShowEquipmentPhotoLog && (
              <EquipmentPhotosLog classid={_get(currentRecord, 'classid')} titleStyle={{ margin: '20px 0' }} />
            )}
          </TabPane>
        </Tabs>
      </Form>

      {visible && (
        <Reason
          onCancel={_switchVisible}
          onOk={() => {
            _switchVisible();
            onOk();
          }}
          query={{
            classids: _get(currentRecord, 'classid', ''),
            signstarttime: _get(currentRecord, 'signstarttime', ''),
            crstate: '3',
          }}
          invalidReasonWay={'all'}
        />
      )}
    </Drawer>
  );
}
