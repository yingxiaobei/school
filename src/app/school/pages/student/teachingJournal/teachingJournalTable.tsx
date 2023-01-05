import { useState } from 'react';
import { Button, message, Tooltip } from 'antd';
import { useFetch, useVisible, useHash, useRequest, useAuth } from 'hooks';
import {
  _getFinalAssess,
  _uploadLog,
  _getFinalAssessAll,
  _getVehicleTrajectory,
  _resetNumber,
  _selectPhoto,
  _getResult,
} from './_api';
import moment from 'moment';
import Details from './Details';
import { AuthButton, CustomTable } from 'components';
import { GPS, _get, _handleIdCard } from 'utils';
import { useEffect } from 'react';
import Appeal from './Appeal';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import EquipmentPhotosWarmTips from './EquipmentPhotosWarmTips';
import { QuestionCircleOutlined } from '@ant-design/icons';

const crstateColor = ['black', 'green', 'orange', 'red'];

export default function TeachingJournalTable(props: any) {
  const {
    query,
    isTraningDetail = false,
    ignore,
    forceUpdate,
    selectCallback,
    trackCallback,
    pagination,
    setPagination,
    tablePagination,
    radioOpen = false,
    selectType,
    withOutQueryTime = false,
    isHidden = false, //s是否展示资金确认状态
    setIsLoading,
    IsFuJian = false,
    isFromStudent = false,
    tableHeight,
    setColumns,
    setSelectedRow,
    pageType = '',
    renderKey = Math.random(),
  } = props;
  const subjectcodeHash = useHash('trans_part_type'); // 培训部分
  const traincodeHash = useHash('subject_type'); // 课程方式
  const crstateHash = useHash('crstate_type'); // 是否有效
  const reviewStatusTypeHash = useHash('review_status_type'); // 计时审核状态
  const stuFundConfirmHash = useHash('stu_fund_confirm_status_type'); // 资金确认状态
  const checkstatusJgHash = useHash('checkstatus_jg_type'); // 监管审核状态
  const stuStatusHash = useHash('stu_drivetrain_status'); // 学员状态
  const iscyzgTypeHash = useHash('iscyzg_type'); // 从业学时
  const isShareHash = useHash('ratio_is_share'); // 配比学时

  const classrecordAppealStatusHash = useHash('classrecord_appeal_status'); // 申诉状态

  // const [selectRecord, setSelectedRecord] = useState(null) as any;
  const [currentRecord, setCurrentRecord] = useState(null) as any;
  const [visible, _switchVisible] = useVisible();
  const [appealVisible, setAppealVisible] = useVisible();
  const [warmTipsVisible, setWarmTipsVisible] = useVisible(); // （温馨提示）获取照片设备
  const [defaultActiveKey, setDefaultActiveKey] = useState('1'); // 详情的初始打开tab页
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const depends = [...[ignore, pagination.current, pagination.pageSize], isTraningDetail ? query.subjectcode : ''];
  const [trackLoading, setTrackLoading] = useState(false);

  const { isLoading = false, data } = useFetch({
    request: withOutQueryTime ? _getFinalAssessAll : _getFinalAssess, //判断是否培训明细审核调用
    query: query,
    depends: depends,
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      if (pageType === 'training_detail_review') {
        let key = [_get(data, 'rows.0.classid')];
        setSelectedRowKeys(key);
        let selectRow = _get(data, 'rows', []).filter((x: any) => key.includes(x.classid));
        selectCallback(selectRow[0]);
      }
      setSelectedRowKeys([]);
    },
  });

  useEffect(() => {
    if (!setIsLoading) {
      return;
    }
    setIsLoading && setIsLoading(isLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRow: any) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRow && setSelectedRow(selectedRow);
      let selectRow = _get(data, 'rows', []).filter((x: any) => selectedRowKeys.includes(x.classid));
      selectCallback && selectCallback(selectRow[0]);
    },
    selectedRowKeys,
  };
  let btn = isTraningDetail ? 'student/trainingDetailReview:btn' : 'student/teachingJournal:btn';
  let detailButton = btn + '1';
  let checkStatusButton = btn + '3';
  let uploadButton = btn + '2';
  const appealButton = btn + 'Appeal';

  // 上传
  const { loading: uploadLoading, run: uploadRun } = useRequest(_uploadLog, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
    onFail: () => {
      //失败也要刷新
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  function _trackCompare() {
    setTrackLoading(true);
    Promise.all(
      selectedRowKeys.map(async (key: string) => {
        const record = _get(data, 'rows', []).find((x: any) => key === x.classid);
        return await _getVehicleTrajectory({
          carid: _get(record, 'carid', ''),
          signstarttime: _get(record, 'signstarttime', ''),
          signendtime: _get(record, 'signendtime', ''),
        });
      }),
    )
      .then((res) => {
        const tracks: any = res
          .map((x: any) =>
            _get(x, 'data', []).map((y: any) => {
              // 将GPS位置转换成BD位置
              // WGS-84 to GCJ-02
              const WCJ = GPS.gcj_encrypt(Number(y.lat), Number(y.lon));
              const { lat: gcjLat, lon: gcjLon } = WCJ;

              // GCJ-02 to BD-09
              // const WGS = GPS.bd_encrypt(gcjLat, gcjLon);
              return { lng: gcjLon, lat: gcjLat };
            }),
          )
          .filter((x: any) => x.length > 0);
        trackCallback([...tracks]);
      })
      .finally(() => {
        setTrackLoading(false);
      });
  }

  const { loading: resetNumberLoading, run: resetNumberRun } = useRequest(_resetNumber, {
    onSuccess: () => {
      forceUpdate();
    },
  });
  const { loading: selectPhotoLoading, run: selectPhotoRun } = useRequest(_selectPhoto, {
    onSuccess: () => {
      // forceUpdate();
      message.success('获取照片中，请过段时间点击教学日志详情查看获取情况');
    },
    onFail(params?: any) {
      message.error(params);
    },
  });

  const renderColor = (text: string, record: any) => (
    <span style={record?.crstate === '3' ? { color: 'red' } : {}}>{text}</span>
  );
  // 查询审核结果
  const { loading: getApplicationLoading, run: getApplicationRun } = useRequest(_getResult, {
    onSuccess: () => {
      forceUpdate();
    },
    onFail: (params) => {
      message.error(params);
    },
  });
  const columns: any = [
    {
      title: '编号',
      width: 65,
      fixed: isFromStudent || isTraningDetail ? false : 'left',
      disableCheckbox: true,
      ellipsis: true,
      dataIndex: 'recnum',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '学员姓名',
      dataIndex: 'name',
      disableCheckbox: isFromStudent ? false : true,
      width: 80,
      fixed: isFromStudent || isTraningDetail ? false : 'left',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '学员证件',
      dataIndex: 'stu_idcard',
      width: 160,
      render: (value: any, record: any) => {
        return renderColor(_handleIdCard({ value, record }), record);
      },
    },
    {
      title: '教练姓名',
      dataIndex: 'coachname',
      // disableCheckbox: isFromStudent ? false : true,
      width: 80,
      // fixed: isFromStudent || isTraningDetail ? false : 'left',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '车牌号',
      dataIndex: 'licnum',
      width: 80,
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '培训部分',
      width: 70,
      dataIndex: 'subjectcode',
      render: (subjectcode: any, record: any) => renderColor(subjectcodeHash[subjectcode], record),
    },
    {
      title: '课程方式',
      width: 100,
      dataIndex: 'traincode',
      render: (traincode: any, record: any) => renderColor(traincodeHash[traincode], record),
    },
    {
      title: '从业资格学时',
      dataIndex: 'iscyzg',
      ellipsis: false,
      width: 60,
      hide: !useAuth('student/teachingJournal:iscyzg'),
      render: (iscyzg: any, record: any) => renderColor(iscyzgTypeHash[iscyzg], record),
    },
    {
      title: '配比学时',
      width: 80,
      dataIndex: 'isshare',
      render: (isshare: string, record: any) => renderColor(isShareHash[isshare], record),
    },
    {
      title: '签到时间',
      width: 160,
      dataIndex: 'signstarttime',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '签退时间',
      width: 160,
      dataIndex: 'signendtime',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '训练时长/分钟',
      ellipsis: false,
      width: 60,
      dataIndex: 'duration',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '有效训练时长/分钟',
      ellipsis: false,
      width: 75,
      dataIndex: 'validtime',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '训练里程/公里',
      ellipsis: false,
      width: 75,
      dataIndex: 'mileage',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '有效训练里程/公里',
      ellipsis: false,
      width: 75,
      dataIndex: 'validmileage',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: (
        <>
          {'是否有效 '}
          <Tooltip
            placement="bottom"
            title={
              <>
                <div> 黑色：待评价</div>
                <div> 红色：整体无效</div>
                <div> 绿色：整体有效</div>
                <div> 橙色：部分有效</div>
              </>
            }
          >
            <QuestionCircleOutlined />
          </Tooltip>
        </>
      ),
      dataIndex: 'crstate',
      width: 100,
      render: (crstate: any) => <span style={{ color: crstateColor[Number(crstate)] }}>{crstateHash[crstate]}</span>,
    },
    {
      title: '学员状态',
      dataIndex: 'stu_status',
      width: 70,
      render: (stu_status: any, record: any) => renderColor(stuStatusHash[stu_status], record),
    },
    {
      title: '计时审核状态',
      dataIndex: 'reviewStatus',
      width: 100,
      render: (reviewStatus: any, record: any) => (
        <span style={record?.crstate === '3' ? { color: 'red' } : {}}>
          {reviewStatus === 2 || reviewStatus === '2' ? (
            <b style={{ color: 'red' }}>{reviewStatusTypeHash[reviewStatus]}</b>
          ) : (
            reviewStatusTypeHash[reviewStatus]
          )}
        </span>
      ),
    },
    {
      title: '上传监管时间',
      width: 140,
      dataIndex: 'checkjg_stime',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '监管审核状态',
      ellipsis: false,
      width: 75,
      dataIndex: 'checkstatus_jg',
      render: (checkstatus_jg: string, record: any) => {
        if (checkstatus_jg === '4') {
          return (
            <Tooltip title={record['msg_jg']}>
              <span style={{ color: PRIMARY_COLOR }}>{checkstatusJgHash[checkstatus_jg]}</span>
            </Tooltip>
          );
        }

        return <span style={record?.crstate === '3' ? { color: 'red' } : {}}>{checkstatusJgHash[checkstatus_jg]}</span>;
      },
    },
    {
      title: '申诉状态',
      width: 90,
      dataIndex: 'appealStatus',
      hide: !IsFuJian,
      render: (appealStatus: any, record: any) => renderColor(classrecordAppealStatusHash[appealStatus], record),
    },
    {
      title: '审核人',
      width: 115,
      ellipsis: true,
      dataIndex: 'checkjx_username',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '审核单位',
      dataIndex: 'schoolName',
      ellipsis: true,
      width: 100,
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '审核时间',
      width: 150,
      dataIndex: 'checkjx_etime',
      render: (text: string, record: any) => renderColor(text, record),
    },
    {
      title: '资金确认状态',
      width: 80,
      dataIndex: 'stuFundConfirmStatus',
      hide: !isHidden,
      render: (text: any, record: any) => renderColor(stuFundConfirmHash[text], record),
    },
    {
      title: '操作',
      fixed: 'right',
      width: pageType === 'training_detail_review' ? 260 : 200,
      disableCheckbox: true,
      dataIndex: 'operate',
      ellipsis: false,
      render: (_: void, record: any) => (
        <div className="flex-box wrap">
          <AuthButton
            authId={detailButton}
            onClick={() => {
              setCurrentRecord(record);
              _switchVisible();
              setDefaultActiveKey('3');
            }}
            className="operation-button"
          >
            详情
          </AuthButton>
          {_get(record, 'checkstatus_jg') === '0' &&
          _get(record, 'checkstatus_jx') !== '2' && ( //只有待上传才显示学时初审和上传按钮
              <AuthButton
                authId={checkStatusButton}
                className="operation-button"
                onClick={async () => {
                  setCurrentRecord(record);
                  _switchVisible();
                  setDefaultActiveKey('3');
                }}
              >
                学时初审
              </AuthButton>
            )}
          {/*XQ000678 河源：调整电子教学日志-上传按钮是否显示的控制*/
          /*上传：（是否有效：部分有效+整体有效 ） &&（监管审核状态：未上传0+上传失败4+上传中5）才显示上传按钮*/}
          {(_get(record, 'crstate') === '1' || _get(record, 'crstate') === '2') &&
            (_get(record, 'checkstatus_jg') === '0' ||
              _get(record, 'checkstatus_jg') === '4' ||
              _get(record, 'checkstatus_jg') === '5') && (
              <AuthButton
                loading={_get(currentRecord, 'classid') === _get(record, 'classid') && uploadLoading}
                authId={uploadButton}
                className="operation-button"
                onClick={async () => {
                  setCurrentRecord(record);
                  uploadRun({
                    classid: _get(record, 'classid'),
                    year: moment(_get(record, 'signstarttime')).format('YYYY'),
                    checkstatus_jg: _get(record, 'checkstatus_jg'),
                  });
                }}
              >
                上传
              </AuthButton>
            )}
          {/*  checkstatus_jg:1:已上传，2：已初审，3：已复审  */}

          {/*明慧： 修改编号：电子教学日志上传失败checkstatus_jg:4 返回showResetRecnumButton为true展示 */}
          <AuthButton
            authId="student/teachingJournal:btn12"
            loading={_get(currentRecord, 'classid') === _get(record, 'classid') && resetNumberLoading}
            insertWhen={_get(record, 'checkstatus_jg', '') === '4' && _get(record, 'showResetRecnumButton')}
            onClick={() => {
              setCurrentRecord(record);
              resetNumberRun({
                classid: _get(record, 'classid', ''),
                year: moment(_get(record, 'signstarttime')).format('YYYY'),
              });
            }}
            className="operation-button"
          >
            修改编号
          </AuthButton>
          <AuthButton
            authId="student/teachingJournal:btn13"
            loading={_get(currentRecord, 'classid') === _get(record, 'classid') && selectPhotoLoading}
            insertWhen={_get(record, 'traincode') !== '4'}
            onClick={() => {
              setCurrentRecord(record);
              // TODO: 温馨提醒 弹出
              setWarmTipsVisible();
            }}
            className="operation-button"
          >
            获取设备照片
          </AuthButton>
          {/* 申诉 */}
          <AuthButton
            authId={appealButton}
            insertWhen={IsFuJian}
            onClick={() => {
              setCurrentRecord(record);
              setAppealVisible();
            }}
            className="operation-button"
          >
            申诉
          </AuthButton>
          <AuthButton
            authId="student/teachingJournal:btn6"
            loading={_get(currentRecord, 'classid') === _get(record, 'classid') && getApplicationLoading}
            insertWhen={
              pageType === 'training_detail_review' &&
              (_get(record, 'checkstatus_jg') === '1' ||
                _get(record, 'checkstatus_jg') === '2' ||
                _get(record, 'checkstatus_jg') === '3')
            }
            onClick={() => {
              setCurrentRecord(record);
              getApplicationRun({
                id: _get(record, 'classid', ''),
                sid: _get(record, 'stuid', ''),
                subject: _get(record, 'subjectcode', ''),
                signstarttime: _get(record, 'signstarttime'),
              });
            }}
            className="operation-button"
          >
            查询审核结果
          </AuthButton>
        </div>
      ),
    },
  ];
  useEffect(() => {
    setColumns && setColumns(columns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useAuth('student/teachingJournal:iscyzg'), IsFuJian]);

  return (
    <>
      {warmTipsVisible && (
        <EquipmentPhotosWarmTips
          okCallback={() => {
            selectPhotoRun({
              poscode: _get(currentRecord, 'termcode', ''),
              starttime: _get(currentRecord, 'signstarttime', ''),
              endtime: _get(currentRecord, 'signendtime', ''),
              classid: _get(currentRecord, 'classid', ''),
              year: moment(_get(currentRecord, 'signstarttime')).format('YYYY'),
            }).finally(setWarmTipsVisible);
          }}
          cancelCallback={setWarmTipsVisible}
          loading={selectPhotoLoading}
        />
      )}
      {visible && (
        <Details
          onCancel={_switchVisible}
          IsFuJian={IsFuJian}
          currentRecord={currentRecord}
          defaultActiveKey={defaultActiveKey}
          onOk={() => {
            _switchVisible();
            setPagination({ ...pagination, current: 1 });
            forceUpdate();
          }}
        />
      )}
      {/* 申诉 */}
      {appealVisible && (
        <Appeal
          onCancel={setAppealVisible}
          onOk={() => {
            setAppealVisible();
            setPagination({ ...pagination, current: 1 });
            forceUpdate();
          }}
          currentRecord={currentRecord}
        />
      )}

      {isTraningDetail && (
        <Button type="primary" loading={trackLoading} onClick={_trackCompare} style={{ marginBottom: 15 }}>
          开始轨迹对比
        </Button>
      )}
      <CustomTable
        scroll={
          isTraningDetail
            ? { x: 1200, y: 280 }
            : {
                x: 1200,
                y: isFromStudent ? document.body.clientHeight - 320 : tableHeight ? tableHeight() : 400,
              }
        }
        rowSelection={
          radioOpen
            ? {
                type: selectType,
                ...rowSelection,
              }
            : undefined
        }
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record: any) => _get(record, 'classid')}
        pagination={tablePagination}
        key={renderKey}
        pageType={pageType}
      />
    </>
  );
}
