/* eslint-disable react-hooks/exhaustive-deps */ /* 学员信息管理 */
import moment from 'moment';
import { Drawer, message, Modal, Tooltip } from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { DownloadOutlined, ExclamationCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';

import GlobalContext from 'globalContext';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import { _get, bindCardCommon, downloadFile, _handleIdCard, _handlePhone } from 'utils';
import RowSetting from 'components/RowSetting';
import Details from './StudentInfoDetail';
import AddOrEdit from './AddOrEdit';
import Push from './Push'; // 重推鸿阳
import Recharge from './Recharge'; // 充值
import NoVerify from './NoVerify'; // 免签
import BindIdCard from './BindIdCard'; // 绑定二代证
import NoCardSoftWare from './NoCardSoftWare'; // 未安装（安装远方驾服读卡程序）
import CloseAccountModal from './CloseAccountModal'; // 销户
import ChangeClass from './ChangeClass'; // 更换班级
import Transfer from './Transfer'; // 转入（更换驾校）
import UploadContract from './UploadContract'; // 上传合同
import GenerateContract from './GenerateContract'; // 生成合同、重新生成合同
import DiffColorClasses from './components/DiffColorClasses';
import SettlementRecords from '../../financial/settlementRecords';
import ChangeAppPhone from '../../coach/coachInfo/ChangeAppPhone';

import {
  useAuth,
  useBulkStatisticsResult,
  useConfirm,
  useFetch,
  useHash,
  useInfo,
  useOptions,
  usePrevious,
  useRequest,
  useTablePro,
  useVisible,
  useAuto,
} from 'hooks';
import {
  AuthButton,
  BatchProcessResult,
  ButtonContainer,
  CustomTable,
  MoreOperation,
  ReadIdCard,
  Search,
  UpdatePlugin,
  UploadArrLoading,
} from 'components';
import {
  useClassOption,
  useClassStart,
  useIsFrozen,
  useIsOpenExamInfo,
  useLeave,
  useRobot,
  useShowDistanceEduBtn,
} from './hooks';

import { _clearDeviceCache, _getStudentInfo } from 'api';
import {
  _C2ToC1,
  _cancelStuLation,
  _checkChangeCarNeedDeductCard,
  _checkTheoryBatch,
  _deleteStudentNum,
  _export,
  _exportStudentBefore,
  _getChangeSchoolAuditSwitch,
  _getChangeSchoolResult,
  _getCoachListData,
  _getInputRule,
  _getPackageIdForChangeCar,
  _getSchoolAuth,
  _getTransTime,
  _openAccount,
  _previewContractFile,
  _registered,
  _stuChangeSchoolApply,
  _studentChangeZLB,
  _transformCarType,
  _updateStuIdauth,
  getKeyInfos,
  getReginfos,
  InputRule,
  _updateStuDepositInfo,
} from './_api';

import type { FiltersType } from 'components/Search';
import BatchPrint from './BatchPrint';
import ChangeClassAndTrainType from './ChangeClassAndTrainType';
import { _getSyncInfoForJGReportAuditRecords } from '../phasedReview/_api';
import StudentCert from './StudentCert';

interface IStudentInfo {
  customSchoolId?: string;
  detailAuthId?: 'publicServicePlatform/studentSearch:btn1' | 'student/studentInfo:btn2';
  type?: 'studentInfo' | 'studentSearch';
}
// 0：未开班 1：已开班
const IS_CLASSES_START = { 0: '未开班', 1: '已开班' };

// 1. 学员管理中学员档案 2. 公众服务平台学员管理 3. 学员跨机构
function StudentInfo({
  customSchoolId = '',
  detailAuthId = 'student/studentInfo:btn2',
  type = 'studentInfo',
}: IStudentInfo) {
  const [_showConfirm] = useConfirm();
  const { optionStore, hashStore, customerFetch } = useAuto();

  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [pushVisible, setPushVisible] = useVisible(); // 重推鸿阳
  const [cloAccVisible, setCloAccVisible] = useVisible(); // 销户
  const [uploadVisible, _setUploadVisible] = useVisible(); // 上传合同
  const [reChargeVisible, setReChargeVisible] = useVisible(); // 充值
  const [noVerifyVisible, setNoVerifyVisible] = useVisible(); // 免签
  const [generateVisible, _setGenerateVisible] = useVisible(); // 生成合同
  const [transferVisible, _switchTransferVisible] = useVisible(); // 驾校转入
  const [changeClassVisible, setChangeClassVisible] = useVisible(); // 更换班级
  const [changeClassAndTrainTypeVisible, setChangeClassAndTrainTypeVisible] = useVisible(); // 换车型并且更换班级
  const [classList, setClassList] = useState([]);
  const [changeType, setChangeType] = useState('');
  const [updatePluginVisible, setUpdatePluginVisible] = useVisible(); // 读卡插件
  const [transferAddVisible, _switchTransferAddVisible] = useVisible(); // 驾校转入
  const [settlementRecordsVisible, setSettlementRecordsVisible] = useVisible(); // 结算记录
  const [noSoftWareVisible, setNoSoftWareVisible] = useVisible();
  const [bindIdCardVisible, setBindIdCardVisible] = useVisible();
  const [batchPrintVisible, setBatchPrintVisible] = useVisible();
  const [devClearVisible, setDevClearVisible] = useVisible();
  const [cerFileVisible, setCertFileVisible] = useVisible();
  const [cerEdit, setCertEdit] = useState(false);
  const [certTitle, setCertTitle] = useState('上传学习驾驶证明');
  const { $companyId, $isForceUpdatePlugin } = useContext(GlobalContext);
  const pre$CompanyId = usePrevious($companyId);

  useLeave(pre$CompanyId, $companyId);

  const [info, setInfo] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [idCard, setIdCard] = useState('');
  const [stutransareatype, setStutransareatype] = useState();

  const [certNum, setCertNum] = useState(); //身份证号
  const [idCardId, setIdCardId] = useState(); //身份证物理卡号
  const [loading, setLoading] = useState(false);

  const isClassStart = useClassStart(); // 开班显示
  const isShowExamInfo = useIsOpenExamInfo(); // 详情页是否开放考试信息
  const { robotCourse, isShowRobot } = useRobot(); // 机器人教练信息
  const isShowDistanceEducationBtn = useShowDistanceEduBtn(); // 远程教育按钮

  const searchRef = useRef<HTMLDivElement>(null);
  const [syncLoading, setSyncLoading] = useState(false);

  // 学员列表
  const {
    isEdit,
    search,
    currentId,
    tableProps,
    currentRecord,
    isAddOrEditVisible,
    _refreshTable,
    _handleAdd,
    _handleEdit,
    _handleOk,
    _handleSearch,
    setCurrentId,
    setCurrentRecord,
    _switchIsAddOrEditVisible,
  } = useTablePro({
    request: _getStudentInfo,
    initPageSize: 15,
    initPageSizeOptions: [10, 15, 20, 50, 100], //增加显示15条选项
    customHeader: { customSchoolId },
    cb: () => {
      setSelectedRowKeys([]);
      setSelectedRows([]);
    },
  });

  const isFrozenStudent = useIsFrozen(currentId); // 是否是一次性冻结、预约冻结的学员

  useEffect(() => {
    _refreshTable();
  }, [idCard, $companyId, customSchoolId]);

  const { loading: cancelationLoading, run } = useRequest(_cancelStuLation, {
    // 监管注销
    onSuccess: _refreshTable,
  });

  // 判断是否允许驾校上传合同
  const { data: uploadContract } = useFetch<any>({
    request: _getSchoolAuth,
  });

  // 查询转校审核开关 "1":开 "0":关
  const { data: schoolAudit } = useFetch({
    request: _getChangeSchoolAuditSwitch,
  });

  // 班级数据
  const classOptions = useClassOption(customSchoolId, $companyId);
  const { $elementAuthTable } = useContext(GlobalContext);
  const batchOperaVisible =
    $elementAuthTable['student/studentInfo:btn37'] || $elementAuthTable['student/studentInfo:btn41'];
  const businessTypeHash = useHash('businessType', false, '-1', [], {
    query: { customHeader: { customSchoolId } },
    depends: [customSchoolId],
    forceUpdate: true,
  }); // 业务类型
  const stuStatusHash = useHash('stu_drivetrain_status'); // 学员状态
  const contractflagHash = useHash('stu_contract_status'); // 合同签订状态
  const recordStatusTypeHash = useHash('stu_record_status_type'); // 学员备案状态
  const registeredNationalFlagHash = useHash('registered_national_flag'); // 统一编码
  const studentTypeHash = useHash('student_type'); // 学员类型
  const genderHash = useHash('gender_type'); // 性别
  const studentSourceHash = useHash('stu_data_source');
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [changeAppPhoneVisible, setChangeAppPhoneVisible] = useVisible();
  const [_showInfo] = useInfo();
  const [batchTheoryReviewLoading, setBatchTheoryReviewLoading] = useState(false);

  async function bindCard() {
    setBindIdCardVisible();
    if ($isForceUpdatePlugin) {
      setInfo('无法进行绑定二代证');
      return setUpdatePluginVisible();
    }
    setLoading(true);
    const result = await bindCardCommon();
    setLoading(false);
    if (result === 'update') {
      return setNoSoftWareVisible();
    }
    setIdCardId(_get(result, 'cardNo', '')); //物理卡号
    setCertNum(_get(result, 'data.idNo', '')); //身份证号
  }
  // 批量备案
  const { run: batchRecord, loading: batchLoad } = useBulkStatisticsResult(_registered, {
    onOk: (data) => {
      const { total, errorTotal, errHashList } = data;
      showBatchProcessResult(total, errorTotal, errHashList);
      clearSelects();
    },
  });
  // 备案
  const { loading: recordLoading, run: recordRun } = useRequest(_registered, {
    onSuccess: _refreshTable,
  });

  // C1转C2
  const { loading: transLoading, run: transRun } = useRequest(_transformCarType, {
    onSuccess: _refreshTable,
  });

  // C2转C1
  const { loading: C2ToC1Loading, run: C2ToC1Run } = useRequest(_C2ToC1, {
    onSuccess: _refreshTable,
  });

  // C1转C2/C2转C1的前置展示条件
  function isShowTransFromCar(record: any, originalType: 'C1' | 'C2') {
    return (
      _get(record, 'traintype') === originalType &&
      _get(record, 'registered_NationalFlag') === '1' &&
      _get(record, 'status') === '01'
    );
  }

  //开户
  const { loading: openAccountLoading, run: openAccountRun } = useRequest(_openAccount, {
    onSuccess: _refreshTable,
  });

  const { data: keyInfos = [] } = useFetch({
    request: getKeyInfos,
  });

  const { data: regInfos = [] } = useFetch({
    request: getReginfos,
  });

  // 取消免签
  const { loading: cancelLoading, run: cancelRun } = useRequest(_updateStuIdauth, {
    onSuccess: _refreshTable,
  });

  // 学员转校申请审核结果
  const { loading: reviewLoading, run: schoolResultRun } = useRequest(_getChangeSchoolResult, {
    onSuccess: _refreshTable,
  });

  // 转校申请
  const { loading: changeSchoolApplyLoading, run: changeSchoolApply } = useRequest(_stuChangeSchoolApply, {
    onSuccess: _refreshTable,
  });

  // 获取监管平台学时
  const { loading: transTimeLoading, run: transTime } = useRequest(_getTransTime, {
    onSuccess: () => {
      _refreshTable();
      const sid = _get(currentRecord, 'sid');
      syncInfoForJGReportAuditRecords(sid);
    },
  });

  // 获取监管平台学时
  const { loading: updateStuDepLoading, run: updateStuDepoInfo } = useRequest(_updateStuDepositInfo, {
    onSuccess: () => {
      _refreshTable();
    },
  });

  // 清空统一编码
  const { loading: clearLoading, run: clearCode } = useRequest(_deleteStudentNum, {
    onSuccess: _refreshTable,
  });

  // 浙里办
  const { loading: zlbLoading, run: zlbRun } = useRequest(_studentChangeZLB, {
    onSuccess: _refreshTable,
  });

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    selectedRowKeys,
  };
  // 获取车型对应的预约冻结班级
  async function getOrderFrozenClassListByTrainType(traintype: string, sid: string) {
    const res = await _getPackageIdForChangeCar({
      sid,
      traintype,
    });
    return _get(res, 'data', []);
  }

  // C1转C2 或 C2转C1处理
  async function handleChangeTrainType(type: string, record: any) {
    const classList = await getOrderFrozenClassListByTrainType(type === 'toC1' ? 'C1' : 'C2', _get(record, 'sid', ''));

    if (classList.length > 1) {
      //如果>1 弹窗选择班级
      setClassList(classList);
      setCurrentRecord(record);
      setChangeType(type);
      setChangeClassAndTrainTypeVisible();
      return;
    }
    let package_id = '';
    let package_name = '';
    if (classList.length === 1) {
      //如果=1 默认选择，静默处理
      package_id = _get(classList, '0.packid', '');
      package_name = _get(classList, '0.packlabel', '');
    }
    const query = { id: _get(record, 'sid'), package_id, package_name };
    if (type === 'toC1') {
      C2ToC1Run(query);
    } else {
      transRun(query);
    }
  }

  const columns = [
    // {
    //   title: '序号',
    //   render: (_: any, record: any, index: number) =>
    //     index + 1 + (tableProps.pagination.current - 1) * (tableProps.pagination.pageSize || 10),
    //   fixed: 'left',
    //   width: 40,
    // },
    {
      title: '姓名',
      dataIndex: 'name',
      fixed: 'left',
      disableCheckbox: true,
      width: 80,
    },
    {
      title: '证件号',
      dataIndex: 'idcard',
      disableCheckbox: true,
      fixed: 'left',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '性别',
      dataIndex: 'sex',
      render: (sex: string) => genderHash[sex],
      width: 80,
      hide: type === 'studentSearch',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      width: 80,
      hide: type === 'studentSearch',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      width: 120,
      hide: type === 'studentSearch',
      render: (value: any, record: any) => _handlePhone(value),
    },
    {
      title: '学车教练',
      dataIndex: 'coachname',
      width: 100,
      hide: type === 'studentSearch',
    },
    {
      title: '学号',
      dataIndex: 'studentnum',
      width: 80,
      hide: type === 'studentSearch',
    },
    {
      title: '入学天数',
      dataIndex: 'enterdays',
      width: 100,
      hide: type === 'studentSearch',
    },
    {
      title: '业务类型',
      dataIndex: 'busitype',
      render: (busitype: string) => businessTypeHash[busitype],
      width: 100,
    },
    {
      title: '培训车型',
      dataIndex: 'traintype',
      width: 100,
    },
    {
      title: '报名日期',
      dataIndex: 'applydate',
      width: 100,
    },
    {
      title: '是否开班',
      dataIndex: 'isClassStudent',
      width: 80,
      hide: type === 'studentSearch',
      render: (isClassStudent: string) => IS_CLASSES_START[isClassStudent],
    },
    {
      title: (
        <>
          {'学员班级 '}
          <Tooltip
            placement="bottom"
            title={
              <>
                <div>黑色：无需开户</div>
                <div>红色：尚未开户</div>
                <div>橙色：已开户未充值</div>
                <div>绿色：已开户已充值</div>
                <div>灰色：开户中或销户中</div>
              </>
            }
          >
            <QuestionCircleOutlined />
          </Tooltip>
        </>
      ),
      dataIndex: 'package_name',
      hide: type === 'studentSearch',
      render: (package_name: string, record: any) => <DiffColorClasses studentInfo={record} />,
      ellipse: true,
      width: 180,
    },
    {
      title: '学员状态',
      dataIndex: 'status',
      hide: type === 'studentSearch',
      render: (status: any) => stuStatusHash[status],
      width: 100,
    },
    {
      title: '学员类型',
      dataIndex: 'studenttype',
      render: (studenttype: any) => studentTypeHash[studenttype],
      width: 100,
      hide: type === 'studentSearch',
    },
    {
      title: '合同签订状态',
      dataIndex: 'contractflag',
      hide: type === 'studentSearch',
      width: 120,
      render: (contractflag: any, record: any) => {
        if (contractflag === '0') {
          return contractflagHash[contractflag];
        } else {
          return (
            <div
              style={{ color: PRIMARY_COLOR }}
              className="pointer"
              onClick={() => {
                _previewContractFile(
                  {
                    sid: _get(record, 'sid'),
                  },
                  { customSchoolId },
                ).then((res) => {
                  window.open(_get(res, 'data'));
                });
              }}
            >
              {contractflagHash[contractflag]}
            </div>
          );
        }
      },
    },
    {
      title: '备案状态',
      dataIndex: 'registered_Flag',
      hide: type === 'studentSearch',
      render: (registered_Flag: any, record: any) => {
        if (registered_Flag === '2') {
          return (
            <Tooltip title={record['message']}>
              <span style={{ color: PRIMARY_COLOR }}>{recordStatusTypeHash[registered_Flag]}</span>
            </Tooltip>
          );
        }
        return recordStatusTypeHash[registered_Flag];
      },
      width: 100,
    },
    {
      title: '统一编码',
      dataIndex: 'registered_NationalFlag',
      hide: type === 'studentSearch',
      render: (registered_NationalFlag: any) => registeredNationalFlagHash[registered_NationalFlag],
      width: 100,
    },
    {
      title: '学员来源',
      dataIndex: 'data_source',
      hide: type === 'studentSearch',
      width: 100,
      render: (data_source: any) => studentSourceHash[data_source],
    },
    {
      title: '学习证明',
      dataIndex: 'study_certificate_push_status',
      hide: !useAuth('student/studentInfo:btn44') || type === 'studentSearch',
      width: 100,
      render: (cert: any, record: any) => {
        return (
          <div
            onClick={() => {
              setCertEdit(true);
              setCurrentId(_get(record, 'sid'));
              setCertTitle('查看学习驾驶证明');
              setCertFileVisible();
            }}
            className="pointer color-primary"
          >
            {cert === '0' ? '未上传' : '已上传'}
          </div>
        );
      },
    },
    {
      title: '操作',
      disableCheckbox: true,
      // width: type === 'studentInfo' ? 270 : 100,
      fixed: 'right',
      dataIndex: 'operate',
      render: (_: void, record: any) => {
        const idauthcloseddeadline = _get(record, 'idauthcloseddeadline');
        const isExpire = idauthcloseddeadline
          ? moment(moment().format('YYYY-MM-DD')).diff(moment(idauthcloseddeadline)) > 0
          : true;
        return (
          // 00：'报名',01：'学驾中',02：'退学',03：'结业',04：'注销',
          <div className="operate" style={{ minWidth: '30px' }}>
            <AuthButton
              authId={detailAuthId}
              onClick={() => {
                _switchDetailsVisible();
                setCurrentRecord(record);
                setCurrentId(_get(record, 'sid', ''));
              }}
              className="operation-button"
            >
              详情
            </AuthButton>

            <AuthButton
              insertWhen={
                type === 'studentInfo' && (_get(record, 'status') === '00' || _get(record, 'status') === '01')
              }
              authId="student/studentInfo:btn3"
              onClick={() => _handleEdit(record, _get(record, 'sid', ''))}
              className="operation-button"
            >
              编辑
            </AuthButton>
            {type === 'studentInfo' && (
              <>
                <MoreOperation moreButtonName="合 同">
                  {/*    1.2 ”生成合同“按钮出现的条件(满足下面之一即可)：
                            1.2.1  ”未生成”+后台自定义参数school_report_auth开启
                            1.2.2 “未生成”+ 后台自定义参数school_report_auth关闭
                  */}
                  <AuthButton
                    insertWhen={
                      _get(record, 'contractflag') === '0' &&
                      _get(record, 'status') !== '99' &&
                      _get(record, 'status') !== '03'
                    }
                    authId="student/studentInfo:btn5"
                    onClick={() => {
                      _setGenerateVisible();
                      setCurrentRecord(record);
                      setTitle('生成合同');
                    }}
                    className="operation-button"
                    isInline
                  >
                    生成合同
                  </AuthButton>
                  {/*
                  重新生成合同“按钮出现的条件(满足下面之一即可)：
                    1.3.1  未签订/已签订”+后台自定义参数school_report_auth开启
                    1.3.2 “未签订/已签订”+ 后台自定义参数school_report_auth关闭
                  */}
                  <AuthButton
                    authId="student/studentInfo:btn5"
                    insertWhen={
                      (_get(record, 'contractflag') === '1' || _get(record, 'contractflag') === '2') &&
                      _get(record, 'status') !== '99' &&
                      _get(record, 'status') !== '03'
                    }
                    onClick={() => {
                      _setGenerateVisible();
                      setCurrentRecord(record);
                      setTitle('重新生成合同');
                    }}
                    className="operation-button"
                    isInline
                  >
                    重新生成合同
                  </AuthButton>

                  {/*根据后台自定义参数，是否允许驾校自己上传合同，0为否，1为是，默认0;参数为1，合同状态!=已上传3，出现【上传合同】。 */}
                  <AuthButton
                    authId="student/studentInfo:btn26"
                    insertWhen={
                      _get(record, 'contractflag', '') !== '3' &&
                      uploadContract === '1' &&
                      _get(record, 'status') !== '99' &&
                      _get(record, 'status') !== '03'
                    }
                    onClick={() => {
                      _setUploadVisible();
                      setCurrentRecord(record);
                      setTitle('上传合同');
                    }}
                    className="operation-button"
                    isInline
                  >
                    上传合同
                  </AuthButton>
                </MoreOperation>

                {/* status 报名，1学驾驶中 ，bankaccountflag：0 未开户 开户中,stuchargemode: 1-托管一次性 缴费  2-托管分批缴费 3-单笔冻结 5- 多笔冻结 */}
                <AuthButton
                  loading={_get(currentRecord, 'sid') === _get(record, 'sid') && openAccountLoading}
                  authId="student/studentInfo:btn12"
                  onClick={() => {
                    _showConfirm({
                      title: '您将为学员创建资金账户，是否继续？',
                      handleOk: async () => {
                        openAccountRun({ sid: _get(record, 'sid', '') });
                      },
                    });
                  }}
                  className="operation-button"
                  insertWhen={
                    (_get(record, 'status') === '00' || _get(record, 'status') === '01') &&
                    (_get(record, 'bankaccountflag') === '0' || _get(record, 'bankaccountflag') === '2') &&
                    (_get(record, 'stuchargemode') === '1' || _get(record, 'stuchargemode') === '2')
                  }
                >
                  开户
                </AuthButton>
                {/* statu：0 报名，1学驾驶中 ，bankaccountflag：1未开户 , ispay:0 stuchargemode:   2-托管分批缴费 3-单笔冻结 5- 多笔冻结 未支付 为在报名或学驾中且未开户和未支付的学员开通充值功能 */}
                <AuthButton
                  authId="student/studentInfo:btn13"
                  onClick={() => {
                    setCurrentRecord(record);
                    setReChargeVisible();
                  }}
                  className="operation-button"
                  insertWhen={
                    (_get(record, 'status') === '00' || _get(record, 'status') === '01') &&
                    _get(record, 'bankaccountflag') === '1' &&
                    _get(record, 'ispay') === '0' &&
                    ['2', '3', '5'].includes(_get(record, 'stuchargemode'))
                  }
                >
                  充值
                </AuthButton>

                <MoreOperation>
                  {/* {_get(record, 'status') === '00' && (
                    <AuthButton
                      authId="student/studentInfo:btn4"
                      onClick={() =>
                        _showConfirm({
                          handleOk: async () => {
                            const res = await _deleteStudent({ id: _get(record, 'sid') });
                            if (_get(res, 'code') === 200) {
                              setPagination({ ...pagination, current: 1 });
                              forceUpdate();
                            }
                          },
                          title: '确定要注销这条数据吗？',
                        })
                      }
                      className="operation-button"
                    >
                      注销
                    </AuthButton>
                  )} */}
                  <AuthButton
                    authId="student/studentInfo:btn45"
                    loading={updateStuDepLoading}
                    insertWhen={_get(record, 'stuNumChangeFlag') === '1'}
                    onClick={() => {
                      updateStuDepoInfo({ id: _get(record, 'sid') });
                    }}
                    className="operation-button"
                    isInline
                  >
                    更新学员建档基本信息
                  </AuthButton>
                  <AuthButton
                    loading={_get(currentRecord, 'sid') === _get(record, 'sid') && recordLoading}
                    authId="student/studentInfo:btn6"
                    onClick={async () => {
                      setCurrentRecord(record);
                      recordRun({ id: _get(record, 'sid') });
                    }}
                    className="operation-button"
                    isInline
                    insertWhen={
                      (_get(record, 'status') === '00' || _get(record, 'status') === '01') &&
                      _get(record, 'registered_Flag') !== '1'
                    }
                  >
                    备案
                  </AuthButton>

                  <AuthButton
                    authId="student/studentInfo:btn7"
                    onClick={async () => {
                      setCurrentRecord(record);
                      bindCard();
                    }}
                    className="operation-button"
                    isInline
                    insertWhen={_get(record, 'status') === '01' && _get(record, 'registered_Flag') === '1'}
                  >
                    绑定二代证
                  </AuthButton>

                  {/* '0':"未获取" ,'1':"已获取" */}
                  <AuthButton
                    loading={_get(currentRecord, 'sid') === _get(record, 'sid') && transLoading}
                    authId="student/studentInfo:btn8"
                    onClick={async () => {
                      const { sid } = record;
                      const res = await beforeIsReduceCard(sid, 'C2');
                      const isContinue = _get(res, 'isContinue');
                      if (!isContinue) return;
                      const isNeedReduceCard = _get(res, 'isNeedReduceCard');
                      const raw = (extra: React.ReactNode) => <>学员更换车型，需要重新备案，{extra}确认仍要继续吗？</>;
                      const extraText = (
                        <>
                          <span style={{ color: PRIMARY_COLOR }}>{'并再次消耗一张点卡'}</span>
                          {', '}
                        </>
                      );
                      const content = raw(isNeedReduceCard ? extraText : '');

                      _showConfirm({
                        title: content,
                        handleOk: () => {
                          handleChangeTrainType('toC2', record);
                        },
                      });
                    }}
                    className="operation-button"
                    isInline
                    insertWhen={isShowTransFromCar(record, 'C1')}
                  >
                    转C2车型
                  </AuthButton>

                  {/* 12-8 C2转C1 未产生学时 */}
                  <AuthButton
                    authId="student/studentInfo:btn35"
                    className="operation-button"
                    loading={_get(currentRecord, 'sid') === _get(record, 'sid') && C2ToC1Loading}
                    onClick={async () => {
                      const { sid } = record;
                      const res = await beforeIsReduceCard(sid, 'C1');
                      const isContinue = _get(res, 'isContinue');
                      if (!isContinue) return;
                      const isNeedReduceCard = _get(res, 'isNeedReduceCard');
                      const raw = (extra: React.ReactNode) => <>学员更换车型，需要重新备案，{extra}确认仍要继续吗？</>;
                      const extraText = (
                        <>
                          <span style={{ color: PRIMARY_COLOR }}>{'并再次消耗一张点卡'}</span>
                          {', '}
                        </>
                      );
                      const content = raw(isNeedReduceCard ? extraText : '');

                      _showConfirm({
                        title: content,
                        handleOk: async () => {
                          handleChangeTrainType('toC1', record);
                        },
                      });
                    }}
                    isInline
                    insertWhen={isShowTransFromCar(record, 'C2')}
                  >
                    转C1车型
                  </AuthButton>

                  {/* 判断免签日期过期则显示免签；身份认证关闭标志(免签)  0-开启, 1-关闭 */}
                  <AuthButton
                    insertWhen={
                      (isExpire || _get(record, 'idauthclosed', '') !== '1') &&
                      _get(record, 'registered_Flag') === '1' &&
                      _get(record, 'status') === '01'
                    }
                    authId="student/studentInfo:btn16"
                    className="operation-button"
                    onClick={() => {
                      setCurrentRecord(record);
                      setNoVerifyVisible();
                    }}
                    isInline
                  >
                    免签
                  </AuthButton>

                  <AuthButton
                    insertWhen={
                      !isExpire &&
                      _get(record, 'idauthclosed', '') === '1' &&
                      _get(record, 'registered_Flag') === '1' &&
                      _get(record, 'status') === '01'
                    }
                    authId="student/studentInfo:btn17"
                    loading={_get(currentRecord, 'sid') === _get(record, 'sid') && cancelLoading}
                    className="operation-button"
                    onClick={() => {
                      setCurrentRecord(record);
                      cancelRun({ sid: _get(currentRecord, 'sid'), idauthclosed: '0' });
                    }}
                    isInline
                  >
                    取消免签
                  </AuthButton>
                  {/*
                    该学员需要审核，且审核状态为待审核，显示该按钮。转入学员申报状态
                    trainTimeApplyStatus:  0-待申请  ；1-待审核   2-审核通过  3-审核未通过
                  */}
                  <AuthButton
                    authId="student/studentInfo:btn20"
                    insertWhen={_get(record, 'status') === '81' && schoolAudit === '1'} //status:81 待审核，schoolAudit查询转校审核开关 "1":开
                    loading={_get(currentRecord, 'sid') === _get(record, 'sid') && reviewLoading}
                    className="operation-button"
                    onClick={() => {
                      schoolResultRun({ sid: _get(record, 'sid') });
                    }}
                    isInline
                  >
                    获取转入审核结果
                  </AuthButton>
                  {/* status：80待上报 82：审核拒绝 schoolAudit查询转校审核开关 "1":开 */}
                  <AuthButton
                    authId="student/studentInfo:btn21"
                    insertWhen={
                      (_get(record, 'status') === '80' || _get(record, 'status') === '82') && schoolAudit === '1'
                    }
                    loading={_get(currentRecord, 'sid') === _get(record, 'sid') && changeSchoolApplyLoading}
                    className="operation-button"
                    onClick={() => {
                      changeSchoolApply({ sid: _get(record, 'sid') });
                    }}
                    isInline
                  >
                    转校申请
                  </AuthButton>

                  <AuthButton
                    authId="student/studentInfo:btn24"
                    insertWhen={
                      _get(record, 'status') !== '99' &&
                      _get(record, 'status') !== '03' &&
                      _get(record, 'isTransferrecord', '') === '1' // 拉取学时标志
                    } // studenttype:1转入
                    loading={_get(currentRecord, 'sid') === _get(record, 'sid') && transTimeLoading}
                    className="operation-button"
                    onClick={() => {
                      setCurrentRecord(record);
                      transTime({ sid: _get(record, 'sid') });
                    }}
                    isInline
                  >
                    获取监管平台学时
                  </AuthButton>
                  <AuthButton
                    insertWhen={
                      (_get(record, 'status') === '99' || _get(record, 'status') === '03') &&
                      _get(record, 'unregisteredFlag') === '1'
                    } //status=99:已归档；unregisteredFlag 监管是否删除1：未删除
                    loading={_get(currentRecord, 'sid') === _get(record, 'sid') && cancelationLoading}
                    authId="student/studentInfo:btn25"
                    onClick={() => {
                      const interfaceType = _get(record, 'interfaceType'); // 1-解除备案 2-注销
                      if (interfaceType === '0') {
                        return message.info('无需进行监管注销');
                      }
                      setCurrentRecord(record);
                      _showConfirm({
                        title:
                          interfaceType === '1'
                            ? '监管平台将解除学员备案，学员跨驾校学习学时信息将被保留，确认继续吗？'
                            : '监管平台将删除学员信息，学员跨驾校学习学时信息将不被保留，确认继续吗？',
                        handleOk: () => {
                          run({ sid: _get(record, 'sid') });
                        },
                      });
                    }}
                    className="operation-button"
                    isInline
                  >
                    监管注销
                  </AuthButton>
                  <AuthButton
                    authId="student/studentInfo:btn27"
                    insertWhen={_get(record, 'studenttype', '') === '2' && _get(record, 'status') === '03'}
                    className="operation-button"
                    onClick={() => {
                      setCurrentRecord(record);
                      setPushVisible();
                    }}
                    isInline
                  >
                    重推鸿阳
                  </AuthButton>
                  {/* 已开户或销户中 显示销户按钮 */}
                  <AuthButton
                    insertWhen={
                      (_get(record, 'bankaccountflag') === '1' || _get(record, 'bankaccountflag') === '3') &&
                      _get(record, 'status') !== '99' &&
                      _get(record, 'status') !== '03'
                    }
                    authId="student/studentInfo:btn30"
                    onClick={() => {
                      setCloAccVisible();
                      setCurrentRecord(record);
                    }}
                    className="operation-button"
                    isInline
                  >
                    销户
                  </AuthButton>

                  <AuthButton
                    insertWhen={
                      _get(record, 'bankaccountflag') === '0' &&
                      _get(record, 'status') !== '99' &&
                      _get(record, 'status') !== '03'
                    }
                    authId="student/studentInfo:btn31"
                    onClick={() => {
                      setChangeClassVisible();
                      setCurrentRecord(record);
                    }}
                    className="operation-button"
                    isInline
                  >
                    更换班级
                  </AuthButton>
                  <AuthButton
                    authId="student/studentInfo:btn33"
                    insertWhen={
                      _get(record, 'isZlbType') === '0' &&
                      _get(record, 'status') !== '99' &&
                      _get(record, 'status') !== '03'
                    }
                    loading={_get(currentRecord, 'sid') === _get(record, 'sid') && clearLoading}
                    onClick={() => {
                      setCurrentRecord(record);
                      _showConfirm({
                        title: '请确认是否要清空学员统一编码，清空后学员会变成未备案',
                        handleOk: () => {
                          clearCode(_get(record, 'sid', ''));
                        },
                      });
                    }}
                    className="operation-button"
                    isInline
                  >
                    清空统一编码
                  </AuthButton>

                  <AuthButton
                    authId="student/studentInfo:btn34"
                    insertWhen={
                      _get(record, 'isZlbType') === '0' &&
                      _get(record, 'status') !== '99' &&
                      _get(record, 'status') !== '03'
                    }
                    loading={_get(currentRecord, 'sid') === _get(record, 'sid') && zlbLoading}
                    onClick={() => {
                      setCurrentRecord(record);
                      _showConfirm({
                        title: '选择浙里办模式后，该学员自动切换浙里办学员并完成，切换后不可逆。',
                        handleOk: () => {
                          zlbRun({ id: _get(record, 'sid', '') });
                        },
                      });
                    }}
                    className="operation-button"
                    isInline
                  >
                    浙里办模式
                  </AuthButton>
                  <AuthButton
                    authId="student/studentInfo:btn40"
                    loading={devClearVisible}
                    onClick={() => {
                      setDevClearVisible();
                      _clearDeviceCache({
                        clearType: '0',
                        sid: _get(record, 'sid'),
                        stunum: _get(record, 'stunum'),
                      })
                        .then((res: any) => {
                          if (res.code !== 200) {
                            setDevClearVisible();
                          } else {
                            _refreshTable();
                            setDevClearVisible();
                          }
                        })
                        .catch((res) => {
                          setDevClearVisible();
                        });
                    }}
                    className="operation-button"
                    isInline
                  >
                    设备同步
                  </AuthButton>
                  <AuthButton
                    authId="student/studentInfo:btn43"
                    onClick={() => {
                      setChangeAppPhoneVisible();
                      setCurrentId(_get(record, 'sid'));
                    }}
                    insertWhen={!!_get(record, 'userid') && _get(record, 'userid') !== '-1'} //学员未认证
                    className="operation-button"
                    isInline
                  >
                    修改APP登录手机号
                  </AuthButton>
                  <AuthButton
                    authId="student/studentInfo:btn44"
                    onClick={() => {
                      setCurrentId(_get(record, 'sid'));
                      setCertFileVisible();
                    }}
                    className="operation-button"
                    isInline
                  >
                    上传学习证明
                  </AuthButton>
                </MoreOperation>
              </>
            )}
          </div>
        );
      },
    },
  ];

  // useEffect(() => {
  //   setColumn(lastColumns);
  // }, [businessTypeHash]);

  // 学员状态 查询转校审核开关 "1":开 使用stu_drivetrain_status 枚举字段 "0":关 使用stu_drivetrain_status_old枚举字段
  const stuDrivetrainStatusOptions = useOptions('stu_drivetrain_status');
  const stuDrivetrainStatusOldOptions = useOptions('stu_drivetrain_status_old');
  const studentStatusOptions = schoolAudit === '1' ? stuDrivetrainStatusOptions : stuDrivetrainStatusOldOptions;

  const studentSearchFilter: FiltersType = [
    { type: 'Input', field: 'name', placeholder: '学员姓名' },
    { type: 'Input', field: 'idcard', placeholder: '证件号码' },
    {
      type: 'Select',
      field: 'busitype',
      options: [{ label: '业务类型(全部)', value: '' }, ...useOptions('businessType')],
    },
    {
      type: 'Select',
      field: 'traintype',
      options: [
        { value: '', label: '培训车型(全部)' },
        ...useOptions('business_scope', false, '-1', [], {
          query: { customHeader: { customSchoolId } },
          depends: [customSchoolId],
          forceUpdate: true,
        }),
      ],
    },
    {
      type: 'RangePicker',
      field: ['applydatebegin', 'applydateend'],
      placeholder: ['报名日期起', '报名日期止'],
    },
  ];
  const studentInfoFilter: FiltersType = [
    { type: 'Input', field: 'name', placeholder: '学员姓名' },
    { type: 'Input', field: 'idcard', placeholder: '证件号码' },
    { type: 'Input', field: 'phone', placeholder: '联系电话' },
    {
      type: 'SimpleSelectOfCoach',
      field: 'cid',
    },
    {
      type: 'Select',
      field: 'registered_Flag',
      options: [{ label: '备案状态(全部)', value: '' }, ...useOptions('stu_record_status_type')],
    },
    {
      type: 'Select',
      field: 'status',
      options: [{ label: '学员状态(全部)', value: '' }, ...studentStatusOptions],
    },
    {
      type: 'Select',
      field: 'traintype',
      options: [
        { value: '', label: '培训车型(全部)' },
        ...useOptions('business_scope', false, '-1', [], {
          query: { customHeader: { customSchoolId } },
          depends: [customSchoolId],
          forceUpdate: true,
        }),
      ],
    },
    {
      type: 'Select',
      field: 'package_id',
      options: [{ value: '', label: '学员班级(全部)' }, ...classOptions],
    },
    {
      type: 'RangePicker',
      field: ['applydatebegin', 'applydateend'],
      placeholder: ['报名日期起', '报名日期止'],
    },
    {
      type: 'Select',
      field: 'busitype',
      options: [{ label: '业务类型(全部)', value: '' }, ...useOptions('businessType')],
    },
    {
      type: 'Select',
      field: 'contractflag',
      options: [{ label: '合同签订(全部)', value: '' }, ...useOptions('stu_contract_status')],
    },
    {
      type: 'Select',
      field: 'studenttype',
      options: [{ label: '学员类型(全部)', value: '' }, ...useOptions('student_type')],
    },
    {
      type: 'Select',
      field: 'data_source',
      options: [{ label: '学员来源(全部)', value: '' }, ...useOptions('stu_data_source')],
    },
  ];

  const [autoFilterForSelect, setAutoFilterForSelect] = useState<InputRule[]>([]);

  // 自输入信息
  const { data: autoInput = [] } = useFetch({
    request: _getInputRule,
    depends: [$companyId],
    query: { schoolId: $companyId },
    forceCancel: !$companyId,
    callback(data) {
      if (Array.isArray(data)) {
        const selectedAuto = data.filter((item) => item.queryType === '2');
        setAutoFilterForSelect(selectedAuto);
      }
    },
  });

  let autoFilter = autoInput && autoInput.length && autoInput.filter((item) => item.selectStatus === '1');

  useEffect(() => {
    if (!autoFilterForSelect.length) {
      return;
    }

    autoFilterForSelect.forEach((item) => {
      if (item.codeType) {
        customerFetch(item.codeType);
      }
    });
  }, [autoFilterForSelect]);

  //搜索项
  let filter =
    type === 'studentInfo'
      ? studentInfoFilter.concat(
          autoFilter
            ? autoFilter.map((item) => {
                if (item.queryType === '2') {
                  return {
                    type: 'Select',
                    field: item.name,
                    options: [
                      { value: ``, label: `${item.nameValue}(全部)` },
                      ...(optionStore[`-1${item.codeType}`] || []),
                    ],
                  };
                } else {
                  return { type: 'Input', field: item.name, placeholder: item.nameValue };
                }
              })
            : [],
        )
      : studentSearchFilter;

  //表头
  const columnsList = autoFilter
    ? autoFilter.map((item) => {
        if (item.queryType === '2') {
          return {
            title: item.nameValue,
            dataIndex: item.name,
            disableCheckbox: true,
            width: 80,
            render: (text: string) => {
              return _get(hashStore, [`-1${item.codeType}`, text], '');
            },
          };
        } else {
          return {
            title: item.nameValue,
            dataIndex: item.name,
            disableCheckbox: true,
            width: 80,
          };
        }
      })
    : [];

  const lastColumns = columns
    // .filter((index) => {
    //   return index.hide !== true;
    // })
    .map((x, index) => {
      return { ...x, value: index };
    });
  const [column, setColumn] = useState(lastColumns);

  const tableHeight = () => {
    return (
      document.body.clientHeight -
      Number(searchRef?.current?.clientHeight || 168) - //search组件三行的高度
      Number(document.querySelector('.ant-tabs-nav')?.clientHeight || 0) -
      Number(document.querySelector('.ant-layout-header')?.clientHeight || 0) -
      200
    );
  };

  const output = async () => {
    try {
      const query = {
        ...search,
        name: _get(search, 'name'),
        idcard: _get(search, 'idcard'),
        cid: _get(search, 'cid'),
        traintype: _get(search, 'traintype'),
        package_id: _get(search, 'package_id'),
        busitype: _get(search, 'busitype'),
        contractflag: _get(search, 'contractflag'),
        registered_Flag: _get(search, 'registered_Flag'),
        status: _get(search, 'status'),
        applydatebegin: _get(search, 'applydatebegin'),
        applydateend: _get(search, 'applydateend'),
        sid: _get(search, 'sid'),
        studenttype: _get(search, 'studenttype'),
      };

      const res = await _exportStudentBefore(query);

      if (_get(res, 'code') === 200) {
        _export(query).then((res: any) => {
          downloadFile(res, '学员名单', 'application/vnd.ms-excel', 'xlsx');
        });
      } else {
        message.error(_get(res, 'message'));
      }
    } catch {}
  };

  // 同步监管阶段
  async function syncInfoForJGReportAuditRecords(sid: string) {
    try {
      const errList: { type: string; message: string }[] = [];
      setSyncLoading(true);
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
    } catch (err) {
      console.log(err);
    } finally {
      setSyncLoading(false);
    }
  }

  // 批量理论审核
  async function batchTheoryReview() {
    const total = selectedRows.length;
    if (!total) return message.error('请选择至少一条记录');
    const isAllowReview = selectedRows.every(
      (row) => _get(row, 'registered_Flag') === '1' && _get(row, 'user_define3') !== '已审核',
    );
    if (!isAllowReview) return message.error('请选择已备案且理论审核状态为未审核的学员');
    const sids = selectedRows.map((row: any) => row.sid);
    _showConfirm({
      title: `该操作将消耗${total}张理论点卡，确认仍要继续吗？`,
      handleOk: async () => {
        try {
          setBatchTheoryReviewLoading(true);
          const result = await _checkTheoryBatch({ sids });
          const code = _get(result, 'code');
          let errHashList: Record<string, { msg: string; total: number }> = {};
          let errorTotal = 0;
          if (code !== 200) {
            const successTotal = _get(result, 'data', 0);
            errorTotal = total - successTotal;
            const msg = _get(result, 'message');
            errHashList = {
              [code]: {
                total: errorTotal,
                msg,
              },
            };
          }
          showBatchProcessResult(total, errorTotal, errHashList);
          clearSelects();
        } catch (e) {
          console.log(e);
        } finally {
          setBatchTheoryReviewLoading(false);
        }
      },
    });
  }

  function clearSelects() {
    setSelectedRowKeys([]);
    setSelectedRows([]);
    _refreshTable();
  }

  function showBatchProcessResult(
    total: number,
    errorTotal: number,
    errHashList: { [code: string]: { total: number; msg: string } },
  ) {
    _showInfo({
      content: (
        <BatchProcessResult
          total={total}
          successTotal={total - errorTotal}
          errorTotal={errorTotal}
          errHashList={errHashList}
        />
      ),
    });
  }

  const beforeIsReduceCard = async (
    sid: string,
    trainType: string,
  ): Promise<{ isNeedReduceCard: boolean; isContinue: boolean }> => {
    const res = await _checkChangeCarNeedDeductCard({
      sid,
      trainType,
    });
    const code = _get(res, 'code');
    if (code === 200) {
      const data = _get(res, 'data')!;
      return {
        isNeedReduceCard: data,
        isContinue: true,
      };
    } else {
      const msg = _get(res, 'message')!;
      message.error(msg);
      return {
        isNeedReduceCard: false,
        isContinue: false,
      };
    }
  };

  return (
    <div>
      <ChangeAppPhone
        visible={changeAppPhoneVisible}
        handleCancel={() => {
          setChangeAppPhoneVisible();
          _refreshTable();
          setCurrentId(null);
        }}
        recordId={currentId}
        type="student"
      />
      {syncLoading && <UploadArrLoading message={'监管平台接收速度限制，请耐心等待'} />}
      {settlementRecordsVisible && (
        <Drawer
          destroyOnClose
          visible
          width={900}
          title={'结算记录'}
          onClose={setSettlementRecordsVisible}
          maskClosable={false}
        >
          <SettlementRecords
            idcard={_get(currentRecord, 'idcard')}
            sid={_get(currentRecord, 'sid')}
            type="studentInfo"
          />
        </Drawer>
      )}

      {noVerifyVisible && (
        <NoVerify
          onCancel={setNoVerifyVisible}
          onOk={() => {
            setNoVerifyVisible();
            _refreshTable();
          }}
          sid={_get(currentRecord, 'sid')}
        />
      )}
      {cerFileVisible && (
        <StudentCert
          sid={currentId}
          setVisible={setCertFileVisible}
          title={certTitle}
          certEdit={cerEdit}
          onOk={() => {
            setCertFileVisible();
            _refreshTable();
          }}
        />
      )}
      <div id="search">
        <Search
          loading={tableProps.loading}
          filters={filter}
          search={search}
          _handleSearch={_handleSearch}
          refreshTable={() => {
            if (type === 'studentSearch' && !customSchoolId) {
              return message.info('请先选择培训机构');
            }
            _refreshTable();
          }}
          simpleCoachRequest={_getCoachListData}
          showSearchButton={false}
          ref={searchRef}
        />
      </div>
      <ButtonContainer
        showSearchButton={true}
        refreshTable={() => {
          if (type === 'studentSearch' && !customSchoolId) {
            return message.info('请先选择培训机构');
          }
          _refreshTable();
        }}
        // renderTable={forceRender}
        loading={tableProps.loading}
        searchRef={searchRef}
        setColumn={setColumn}
        column={column}
        showOpenBtn={type !== 'studentSearch'}
        update={[JSON.stringify(autoFilter)]} //更新折叠
        // showCustomColumn
      >
        <AuthButton
          insertWhen={type === 'studentInfo'}
          authId="student/studentInfo:btn1"
          type="primary"
          onClick={_handleAdd}
          style={{ margin: '0 20px 20px 0' }}
        >
          新增
        </AuthButton>
        <ReadIdCard
          insertWhen={type === 'studentInfo'}
          authId="student/studentInfo:btn10"
          setInfo={setInfo}
          setUpdatePluginVisible={setUpdatePluginVisible}
          _handleSearch={_handleSearch}
          setIdCard={setIdCard}
        />

        <AuthButton
          insertWhen={type === 'studentInfo'}
          authId="student/studentInfo:btn14"
          danger
          onClick={_switchTransferVisible}
          style={{ margin: '0 20px 20px 0' }}
        >
          转入
        </AuthButton>

        <AuthButton
          insertWhen={type === 'studentInfo'}
          authId="student/studentInfo:btn11"
          // type="primary"
          icon={<DownloadOutlined />}
          onClick={output}
          className="mb20"
        >
          导出
        </AuthButton>
        <MoreOperation moreButtonName="批量操作" type="button">
          <AuthButton
            insertWhen={type === 'studentInfo'}
            className="operation-button"
            authId="student/studentInfo:btn37"
            onClick={() => {
              if (selectedRowKeys.length === 0) {
                return message.error('请选择需要打印的数据');
              }
              setBatchPrintVisible();
            }}
          >
            档案批量打印
          </AuthButton>
          <AuthButton
            insertWhen={type === 'studentInfo'}
            className="operation-button"
            authId="student/studentInfo:btn41"
            loading={batchLoad}
            onClick={() => {
              if (selectedRowKeys.length === 0) {
                return message.error('请选择需要备案的学员');
              }
              if (!selectedRows.every((record) => _get(record, 'registered_Flag') !== '1')) {
                return message.error('存在已备案的学员信息，请重新选择');
              }
              if (!selectedRows.every((record) => _get(record, 'status') === '00' || _get(record, 'status') === '01')) {
                return message.error('学员状态为报名或学驾中才允许备案，请重新选择');
              }

              batchRecord(selectedRows, {
                priKeyValMap: [{ key: 'id', value: 'sid' }],
                otherParams: { withFeedback: false },
              });
            }}
          >
            学员批量备案
          </AuthButton>
          <AuthButton
            insertWhen={type === 'studentInfo'}
            className="operation-button"
            authId={'student/studentInfo:btn42'}
            onClick={batchTheoryReview}
            loading={batchTheoryReviewLoading}
          >
            批量理论审核
          </AuthButton>
        </MoreOperation>

        <RowSetting columns={columns} show={type === 'studentInfo'} pageType="student_info" />
      </ButtonContainer>
      {isAddOrEditVisible && (
        <AddOrEdit
          onCancel={_switchIsAddOrEditVisible}
          onOk={_handleOk}
          currentRecord={currentRecord}
          isEdit={isEdit}
          title={isEdit ? '编辑学员信息' : '新增学员信息'}
          keyInfos={_get(currentRecord, 'unregisteredFlag', '') === '1' ? keyInfos : []} //监管已备案才需要传入敏感信息，未备案不需要，所有信息都可以编辑
          regInfos={regInfos}
          isShowRobot={isShowRobot}
          courseList={robotCourse}
          isStudents={true}
          autoInput={autoInput}
          optionStore={optionStore}
        />
      )}

      {transferVisible && (
        <Transfer
          onCancel={_switchTransferVisible}
          onOk={() => {
            _refreshTable();
          }}
          setName={setName}
          setStutransareatype={setStutransareatype}
          _switchTransferAddVisible={_switchTransferAddVisible}
        />
      )}
      {transferAddVisible && (
        <AddOrEdit
          onCancel={_switchTransferAddVisible}
          onOk={() => {
            _switchTransferAddVisible();
            _refreshTable();
          }}
          currentRecord={{}}
          isEdit={false}
          title={name}
          studenttype={'1'}
          stutransareatype={stutransareatype}
          isStudents={true}
        />
      )}
      {updatePluginVisible && <UpdatePlugin onCancel={setUpdatePluginVisible} info={info} />}
      {detailsVisible && (
        <Details
          type={type}
          currentRecord={currentRecord}
          customSchoolId={customSchoolId}
          showBtn={isShowDistanceEducationBtn}
          isShowRobot={isShowRobot}
          isShowExamInfo={isShowExamInfo}
          isFrozenStudent={isFrozenStudent}
          sid={_get(currentRecord, 'sid')}
          idcard={_get(currentRecord, 'idcard')}
          userId={_get(currentRecord, 'userid', '')}
          onCancel={_switchDetailsVisible}
          autoInput={autoInput}
          hashStore={hashStore}
        />
      )}

      {generateVisible && (
        <GenerateContract
          onCancel={_setGenerateVisible}
          onOk={() => {
            _setGenerateVisible();
            _refreshTable();
          }}
          currentRecord={currentRecord}
          title={title}
        />
      )}

      {/* 上传合同 */}
      {uploadVisible && (
        <UploadContract
          onCancel={_setUploadVisible}
          onOk={() => {
            _setUploadVisible();
            _refreshTable();
          }}
          currentRecord={currentRecord}
          title={title}
        />
      )}

      {bindIdCardVisible && (
        <BindIdCard
          onCancel={setBindIdCardVisible}
          onOk={() => {
            setBindIdCardVisible();
            _refreshTable();
          }}
          currentRecord={currentRecord}
          idCardId={idCardId}
          certNum={certNum}
          setNoSoftWareVisible={setNoSoftWareVisible}
          loading={loading}
        />
      )}
      {noSoftWareVisible && <NoCardSoftWare onCancel={setNoSoftWareVisible} />}
      {reChargeVisible && (
        <Recharge
          onCancel={setReChargeVisible}
          onOk={() => {
            setReChargeVisible();
            _refreshTable();
          }}
          currentRecord={currentRecord}
        />
      )}
      {pushVisible && (
        <Push
          onCancel={setPushVisible}
          currentData={currentRecord}
          onOk={() => {
            setPushVisible();
            _refreshTable();
          }}
          cardtype={_get(currentRecord, 'cardtype')}
        />
      )}

      {changeClassVisible && (
        <ChangeClass
          handleCancel={setChangeClassVisible}
          handleOk={() => {
            _refreshTable();
            setChangeClassVisible();
          }}
          customSchoolId={customSchoolId}
          sid={_get(currentRecord, 'sid')}
          cid={_get(currentRecord, 'cid')}
          visible={changeClassVisible}
        />
      )}
      {changeClassAndTrainTypeVisible && (
        <ChangeClassAndTrainType
          handleCancel={setChangeClassAndTrainTypeVisible}
          handleOk={() => {
            _refreshTable();
            setChangeClassAndTrainTypeVisible();
          }}
          sid={_get(currentRecord, 'sid')}
          currentRecord={currentRecord}
          classList={classList}
          type={changeType}
        />
      )}
      {cloAccVisible && (
        <CloseAccountModal
          visible={cloAccVisible}
          handleCancel={setCloAccVisible}
          handleOk={() => {
            setCloAccVisible();
            _refreshTable();
          }}
          customSchoolId={customSchoolId}
          sid={_get(currentRecord, 'sid')}
          setSettlementRecordsVisible={setSettlementRecordsVisible}
          currentData={currentRecord}
        />
      )}
      {batchPrintVisible && <BatchPrint onCancel={setBatchPrintVisible} selectedRows={selectedRows} />}
      <CustomTable
        {...tableProps}
        columns={lastColumns}
        columnsList={type === 'studentSearch' ? [] : columnsList}
        rowKey={(record: any) => _get(record, 'sid')}
        scroll={
          type === 'studentSearch'
            ? undefined
            : { x: tableProps.dataSource.length ? 'max-content' : 2000, y: tableHeight() }
        }
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        sort
        pageType={type === 'studentInfo' ? 'student_info' : type}
      />
    </div>
  );
}

export default StudentInfo;
