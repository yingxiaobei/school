// 阶段报审管理
import { useEffect, useRef, useState } from 'react';
import { Tooltip, message, Modal, Button } from 'antd';
import Review from './Review';
import InputPIN from './InputPIN';
import PushPolice from './pushPolice';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  useFetch,
  useTablePagination,
  useSearch,
  useVisible,
  useForceUpdate,
  useOptions,
  useHash,
  useRequest,
  useConfirm,
  useInfo,
  useBulkStatisticsResult,
} from 'hooks';
import {
  _getFinalAssess,
  _cancelFinalAssess,
  _updateStuIsApply,
  _getResult,
  _getReport,
  _getReportType,
  _getUKeyData,
  _uploadByKeyAndSignature,
  _export,
  _exportStageApplyBefore,
  _submitSignature,
  _submitSupervisorPlatform,
  _editAbnormalData,
  _reSignName,
  _reloadApp,
  _checkSignExist,
  _viewReport,
} from './_api';
import { _getCoachList, _getCustomParam, _getStudentList, _uploadImg } from 'api';
import {
  AuthButton,
  Search,
  Signature,
  CustomTable,
  ButtonContainer,
  BatchProcessResult,
  MoreOperation,
} from 'components';
import {
  Auth,
  previewPdf,
  _getReaderName,
  _readSignature,
  base64ConvertFile,
  _doSign,
  _get,
  getTableMaxHeightRef,
  b64Decode,
  _handleIdCard,
} from 'utils';
import { downloadFile, printingBatch } from 'utils';
import { DownloadOutlined } from '@ant-design/icons';
import { UpdatePlugin } from 'components';
import { _requestGJ } from 'utils/cardUtil';
import AllocatedHours from './AllocatedHours';

function PhasedReview() {
  const [search, _handleSearch] = useSearch();
  const [visible, _switchVisible] = useVisible();
  const [pinVisible, _switchPinVisible] = useVisible();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [currentRecord, setCurrentRecord] = useState({});
  const [currentId, setCurrentId] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [uKeyLoading, setUKLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [batch, setBatch] = useState(false);
  const [_showConfirm] = useConfirm();
  const [_showInfo] = useInfo();
  const [signVisible, setSignVisible] = useVisible();
  const [printUrls, setPrintUrls] = useState<any>([]);
  const [isPrint, setIsPrint] = useState(false);
  const [isPreview, setIsPreview] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [noSoftwareVisible, setNoSoftwareVisible] = useVisible();
  const [ukeyFactory, setUKeyFactory] = useState('1');
  const [keySn, setKeySn] = useState('');
  const searchRef = useRef(null);
  const [fzUkeyUpdatePluginVisible, setFzUkeyUpdatePluginVisible] = useVisible();
  const [gjUkeyUpdatePluginVisible, setGjUkeyUpdatePluginVisible] = useVisible();

  const [errHashList, setHashList] = useState({});
  const [isAdditionalSignatures, setIsAdditionalSignatures] = useState(false); //
  const [selectedRow, setSelectedRow] = useState([] as any);

  const [allocatedHoursVisible, setAllocatedVisible] = useVisible();
  const [signType, setSignType] = useState('1');
  const [pushPoliceVisible, setPushPoliceVisible] = useVisible();
  // 国交设备链接
  const devGJReady = async (batch: boolean) => {
    const res: any = await _requestGJ({
      function: 'SOF_LoadLibrary',
      Path: 'ShuttleCsp11_3000GM.dll'.replace(/\\/g, '\\\\'),
      Vendor: '',
    });
    if (_get(res, 'RETURN', '') !== 1) {
      setGjUkeyUpdatePluginVisible();
      setUKLoading(false);
      setReportLoading(false);
      return;
    }
    const resp = await _requestGJ({ function: 'SOF_GetAllDeviceSN' });
    if (!_get(resp, 'RETURN', '')) {
      message.error('请确认UKey是否插入');
      setUKLoading(false);
      setReportLoading(false);
      return;
    }
    Auth.set('devSn', _get(resp, 'RETURN', ''));
    setKeySn(_get(resp, 'RETURN', ''));
    const pin = Auth.get('gjpin');
    if (!pin) {
      return _switchPinVisible();
    } else {
      const loginRes: any = await _requestGJ({
        function: 'SOF_Login',
        CertOptID: _get(resp, 'RETURN', ''),
        PassWd: pin,
      });
      if (!_get(loginRes, 'RETURN', '')) {
        message.error('PIN不正确');
        _switchPinVisible();
      } else {
        gjReporte(batch);
      }
    }
  };

  // 国交上报
  const gjReporte = async (batch: boolean) => {
    let fileName = 'yinzhang.png'; //文件名称
    let yzRes: any = await _requestGJ({
      function: 'SOF_ReadFile',
      DevSn: Auth.get('devSn'),
      FileName: fileName,
    }); //电子印章base64

    const file = base64ConvertFile('data:image/png;base64,' + _get(yzRes, 'RETURN', '')); //base64转文件
    let formData = new FormData();
    formData.append('file', file);

    const imgRes = await _uploadImg(formData); // 上传签章图片

    if (_get(imgRes, 'code') !== 200) {
      message.error('签章上传失败');
      return;
    }

    //获取证书列表
    let listRes = (await _requestGJ({ function: 'SOF_GetUserList' })).RETURN.split('||')[1];

    const report = async (id: string) => {
      const UKeyData = await _getUKeyData({ id: id }); // 获取盖章所需的报文原始数据
      if (_get(UKeyData, 'code') !== 200) {
        return UKeyData;
      }
      //加签
      let signValue = await _requestGJ({
        function: 'SOF_SignData',
        CertOptID: listRes,
        InData: b64Decode(_get(UKeyData, 'data', '')),
      });
      // 加签失败
      if (_get(signValue, 'Success', '') !== 1) {
        return (signValue = { code: 1, message: '加签失败' });
      }
      // 获取证书
      // let base64Cert = (await _request({ function: 'SOF_ExportUserCert', CertOptID: listRes })).RETURN;

      //设置签名算法
      // let signData = (await _request({ function: 'SOF_SetSignMethod', SignMethod: SGD_SHA1_RSA })).RETURN;

      // UKey盖章与签字内容提交报审
      return await _uploadByKeyAndSignature({
        id,
        fileId: _get(imgRes, 'data.id', ''),
        signatureData: _get(signValue, 'RETURN', '').replace(/\r|\n/gi, ''), //去除空行回车，否则监管不过
        ukeyFactory: '1',
      });
    };
    if (batch) {
      let errCount = 0;
      let errList: any = {};
      Promise.all(
        selectedRowKeys.map(async (item: string) => {
          const respon: any = await report(item);
          if (_get(respon, 'code', 0) !== 200) {
            errCount += 1;

            if (!errList?.[_get(respon, 'code', 0)]) {
              errList[_get(respon, 'code', 0)] = {
                total: 1,
                msg: _get(respon, 'message', '未知错误'),
              };
            } else {
              errList[_get(respon, 'code', 0)]['total']++;
            }
          }
          return respon;
        }),
      )
        .then(() => {
          batchReport(selectedRowKeys.length, errCount, errList);
        })
        .then(
          () => _requestGJ({ function: 'SOF_FreeLibrary' }), //断开连接
        );
    } else {
      const respon: any = await report(currentId);
      if (_get(respon, 'code', 0) !== 200) message.error(_get(respon, 'message'));
      _requestGJ({ function: 'SOF_FreeLibrary' }); //断开连接
      setUKLoading(false);
    }
  };

  const { isLoading, data } = useFetch({
    request: _getFinalAssess,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      subject: _get(search, 'subject'),
      isapply: _get(search, 'isapply'),
      sdate: _get(search, 'sdate'),
      edate: _get(search, 'edate'),
      sid: _get(search, 'sid'),
      cid: _get(search, 'cid'),
    },
    depends: [ignore, pagination.current, pagination.pageSize, _get(search, 'isapply')],
    callback: (data) => {
      setSelectedRowKeys([]);
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  useEffect(() => {
    if (isPrint) {
      if (_get(printUrls, 'length', 0) > 0) {
        const res = printingBatch(printUrls, isPreview);
        if (res === 'NO_SOFTWARE') {
          setNoSoftwareVisible();
        }
      } else {
        message.error('当前没有可打印的文件');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPrint, isPreview, printUrls]);

  const SubjectApplyStatusHash = useHash('SubjectApplyStatus'); // 核实状态
  const subjectHash = useHash('SchoolSubjectApply'); // 报审类型
  const { loading: cancelLoading, run: cancelRun } = useRequest(_cancelFinalAssess, {
    onSuccess: () => {
      forceUpdate();
    },
  });

  const { loading: getResultLoading, run: getResultRun } = useRequest(_getResult, {
    onSuccess: () => {
      forceUpdate();
    },
  });

  // 重新上传培训记录单到省监管平台
  const { loading: getSupervisorPlatformLoading, run: getSupervisorPlatformRun } = useRequest(
    _submitSupervisorPlatform,
    {
      onSuccess: () => {
        forceUpdate();
      },
    },
  );

  // 修正异常学时
  const { loading: editAbnormalDataLoading, run: editAbnormalDataRun } = useRequest(_editAbnormalData, {
    onSuccess: () => {
      forceUpdate();
    },
  });

  // 补学员签名
  const { run: reSignNameRun } = useRequest(_reSignName, {
    onSuccess(data) {
      forceUpdate();
    },
  });

  /**验证插件是否下载或更新或服务开启*/
  async function isSoftWareNotRun() {
    const res = await _getReaderName();
    return _get(res, 'result', '') === false;
  }

  /**验证USBKey设备连接状态 */
  async function isUKeyExist() {
    const res = await _getReaderName();
    return _get(res, 'readerName', '') && _get(res, 'readerName', '') !== -1;
  }

  const uKeyReport = async function (id: any, index?: any, errorCount?: any, isBatch?: any) {
    const pin = Auth.get('pin');
    const softWareNotRun = await isSoftWareNotRun();
    const isExist = await isUKeyExist();

    if (softWareNotRun) {
      message.error('请确认插件是否开启或已下载最新插件');
      if (isBatch) {
        setErrorCount((err) => err + 1);
        setIndex((index) => index + 1);
        index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1);
      }
      return;
    }
    // UKey未插入
    if (!isExist) {
      message.error('请确认UKey是否插入');
      if (isBatch) {
        setErrorCount((err) => err + 1);
        setIndex((index) => index + 1);
        index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1);
      }

      return;
    }

    // pin码不存在
    if (!pin) {
      return _switchPinVisible();
    }

    // UKey已插入 && pin码存在
    if (isBatch) {
      setIndex((index) => index + 1);
    }
    const signatureRes = await _readSignature(); // 获取签章

    // 获取签章失败
    if (_get(signatureRes, 'return', '') === -1) {
      return;
    }

    const file = base64ConvertFile('data:image/png;base64,' + _get(signatureRes, 'result', ''));
    let formData = new FormData();
    formData.append('file', file);

    const imgRes = await _uploadImg(formData); // 上传签章图片
    if (_get(imgRes, 'code') !== 200) {
      if (isBatch) {
        setErrorCount((err) => err + 1);
        index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1);
      }

      return message.error('签章上传失败');
    }

    const imgResId = _get(imgRes, 'data.id', '');
    const UKeyData = await _getUKeyData({ id }); // 获取UKey签字所需的报文原始数据
    // 获取数据失败
    if (_get(UKeyData, 'code') !== 200) {
      if (isBatch) {
        setErrorCount((err) => err + 1);
        index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1);
      }

      return message.error('获取数据失败');
    }

    // 加签
    const doSignRes = await _doSign({
      Content: _get(UKeyData, 'data', ''),
      len: _get(UKeyData, 'data.length', 0),
      PassWord: pin,
    });

    // 加签失败
    if (_get(doSignRes, 'result', '') === -1) {
      if (isBatch) {
        setErrorCount((err) => err + 1);
        index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1);
      }

      return message.error('加签失败');
    }

    // UKey盖章与签字内容提交报审
    const res = await _uploadByKeyAndSignature({
      id,
      fileId: imgResId,
      signatureData: _get(doSignRes, 'result', ''),
      ukeyFactory: '1',
    });

    if (isBatch) {
      if (_get(res, 'code') !== 200) {
        setErrorCount((err) => err + 1);
        index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1);
      } else {
        index < selectedRowKeys.length && batchReport(index + 1, errorCount);
      }
    }

    return res;
  };
  async function getSealfromKey(isBatch: any) {
    var capability = window.createCapability();
    var iwebAssist = new window.iWebAssist({ cilentType: '0' });
    Promise.all([iwebAssist.promise])
      .then(function () {
        return iwebAssist.getKeyInfo();
      })
      .then(function (data) {
        capability.resolve(data);
      })
      .catch(() => {
        if (isBatch) {
          message.error('请确认Ukey插件服务是否开启或已下载最新插件');
          setReportLoading(false);
          forceUpdate();
          return;
        } else {
          setUKLoading(false);
          setFzUkeyUpdatePluginVisible();
        }
        return;
      });
    return capability.promise;
  }
  //福州地区Ukey模式
  const fzUkReport = async (id: any, index?: any, errorCount?: any, isBatch?: any) => {
    const pin = Auth.get('pin');
    const res = await getSealfromKey(isBatch);
    const errorOjb: any = {
      '-1': '未安装组件',
      '1': '未插入UKey',
      '2': '非法为授权的UKey',
      '3': '没有找到UKey驱动文件',
      '4': '插入太多的UKey',
      '8': '非法授权',
      '11': '没有印章',
      '12': '获取印章信息失败',
    };

    if (_get(res, 'errcode', '')) {
      message.error(errorOjb[_get(res, 'errcode', '')] || data.errmsg || '未知异常');
      if (isBatch) {
        setErrorCount((err) => err + 1);
        setIndex((index) => index + 1);
        index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1);
      }
      return;
    }
    // pin码不存在
    if (!pin) {
      setKeySn(_get(res, 'keysn', ''));
      return _switchPinVisible();
    }

    // UKey已插入
    if (isBatch) {
      setIndex((index) => index + 1);
    }

    // UKey盖章与签字内容提交报审
    const uploadRes = await _uploadByKeyAndSignature({
      id,
      fileId: '456',
      signatureData: '123',
      ukeyFactory: '2',
      keysn: res.keysn,
      orgname: res.orgname,
      seal: _get(res, 'seals.0'),
    });
    if (isBatch) {
      if (_get(uploadRes, 'code') !== 200) {
        setErrorCount((err) => err + 1);
        index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1);
      } else {
        index < selectedRowKeys.length && batchReport(index + 1, errorCount);
      }
    }
    return uploadRes;
  };

  const { data: paramData } = useFetch({
    request: _getCustomParam, //启用学员培训阶段记录签字标志（1-启用 0-未启用）
    query: { paramCode: 'enable_stu_subject_signature', schoolId: Auth.get('schoolId') },
  });
  const isSign = _get(paramData, 'paramValue', '0') === '1';
  const warningText = isSign
    ? '请先查询核实状态为学员已签字或上报中的学员，选择后，再点击批量上报'
    : '请先查询核实状态为已初审学员或上报中，选择后，再点击批量上报';
  const buttonDisabled = isSign
    ? _get(search, 'isapply') !== '7' && _get(search, 'isapply') !== '5'
    : _get(search, 'isapply') !== '0' && _get(search, 'isapply') !== '5';

  const columns: any = [
    {
      title: '报审类型',
      dataIndex: 'subject',
      render: (subject: any) => subjectHash[subject],
      width: 100,
    },
    {
      title: '初审日期',
      dataIndex: 'createtime',
      width: 100,
    },
    {
      title: '学号',
      dataIndex: 'studentnum',
      width: 170,
    },
    {
      title: '学员姓名',
      dataIndex: 'name',
      width: 140,
    },
    {
      title: '证件号码',
      dataIndex: 'idcard',
      width: 180,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '学驾车型',
      dataIndex: 'traintype',
      width: 80,
    },
    {
      title: '教练姓名',
      dataIndex: 'coachname',
      width: 80,
    },
    {
      title: '核实状态',
      dataIndex: 'isapply',
      render: (isapply: any) => SubjectApplyStatusHash[isapply],
      width: 100,
    },
    {
      title: '提交人',
      dataIndex: 'applyname',
      width: 180,
    },
    {
      title: '提交时间',
      dataIndex: 'applytime',
      width: 180,
    },
    {
      title: '核实日期',
      dataIndex: 'resptime',
      width: 180,
    },
    {
      title: '备注',
      dataIndex: 'respmsg',
      width: 180,
      render: (respmsg: any) => {
        if (respmsg === '监管') {
          return <Tooltip title="监管下发消息或向监管拉取到的报审记录">{respmsg}</Tooltip>;
        }
        return <Tooltip title={respmsg}>{respmsg}</Tooltip>;
      },
    },
    {
      title: '三联单显示',
      dataIndex: 'preivewFlag',
      render: (preivewFlag: string, record: any) =>
        // preivewFlag (string)  0-不展示三联单  1-展示三联单
        preivewFlag === '1' && (
          <span
            className="color-primary pointer"
            onClick={async () => {
              const res = await _getReport({ id: _get(record, 'said') });
              if (_get(res, 'code') !== 200) {
                return;
              }
              previewPdf(_get(res, 'data'), false);
            }}
          >
            查看三联单
          </span>
        ),
    },
    {
      title: '操作',
      dataIndex: 'operate',
      fixed: 'right',
      width: 150,
      render: (_: void, record: any) => (
        <div>
          {record.isapply === '6' && (
            //核实状态：待学员签字才显示
            <AuthButton
              authId="student/phasedReview:btn7"
              onClick={() => {
                setCurrentRecord(record);
                setSignVisible();
                setIsAdditionalSignatures(false);
                setSignType('1');
              }}
              className="operation-button"
            >
              学员签字
            </AuthButton>
          )}
          {/* 已初审：0   已签字：7  上报中：5 */}
          {(record.isapply === '0' || record.isapply === '7' || record.isapply === '5') && (
            <AuthButton
              loading={_get(currentRecord, 'said') === _get(record, 'said') && uKeyLoading}
              authId="student/phasedReview:btn4"
              onClick={async () => {
                setBatch(false);
                setCurrentRecord(record);
                setCurrentId(_get(record, 'said', ''));
                setUKLoading(true);
                const res = await _getReportType({ id: _get(record, 'said'), withFeedbackAll: true }); // 1:ukey盖章     0：传统方式不用ukey
                if (_get(res, 'code', '') !== 200) {
                  setUKLoading(false);
                  return;
                }
                if (_get(res, 'data.useUkey', '') === '1') {
                  // 1:ukey盖章 0：传统方式不用ukey
                  const ukeyFactory = _get(res, 'data.ukeyFactory', '');
                  // 1--传统模式，国交加签模式，通讯报文中需要加签数据，对图章不做签名;
                  // 2--福州地区Ukey模式。 对三联单pdf文件使用金格的组件 盖章，监管侧要对章验签。
                  setUKeyFactory(ukeyFactory);
                  if (ukeyFactory === '1') {
                    setBatch(false);
                    setCurrentId(_get(record, 'said', ''));
                    devGJReady(false);
                  } else {
                    const fzUkey = await fzUkReport(_get(record, 'said'));
                    setUKLoading(false);
                    if (_get(fzUkey, 'code') === 200) {
                      forceUpdate();
                    }
                  }
                } else {
                  const response = await _checkSignExist({ id: _get(record, 'sid') }); //校验签名是否存在
                  if (_get(response, 'code') === 200) {
                    if (_get(response, 'data') === true) {
                      const res = await _updateStuIsApply({ id: _get(record, 'said') }); //签名存在 直接上报
                      setUKLoading(false);
                      if (_get(res, 'code') === 200) {
                        forceUpdate();
                      } else {
                        message.error(_get(res, 'message'));
                        setUKLoading(false);
                      }
                    } else {
                      //签名不存在 先查看三联单 确认在上报2
                      Modal.confirm({
                        icon: <ExclamationCircleOutlined />,
                        title: (
                          <p>
                            学员，教练，考核员签名其中一项为空，可点击
                            <Button
                              onClick={async () => {
                                const resPdf = await _viewReport({ id: _get(record, 'sid') });
                                if (_get(resPdf, 'code') === 200) {
                                  previewPdf(_get(resPdf, 'data'), false);
                                } else {
                                  message.error(_get(resPdf, 'message'));
                                  setUKLoading(false);
                                }
                              }}
                              type="text"
                              danger
                              style={{ fontWeight: 500, fontSize: '16px' }}
                            >
                              此处查看
                            </Button>
                            ，确认仍要上传该培训记录单pdf吗？
                          </p>
                        ),
                        async onOk() {
                          const res = await _updateStuIsApply({ id: _get(record, 'said') });
                          setUKLoading(false);
                          if (_get(res, 'code') === 200) {
                            forceUpdate();
                          }
                        },
                        onCancel() {
                          setUKLoading(false);
                        },
                      });
                    }
                  } else {
                    message.error(_get(response, 'message'));
                    setUKLoading(false);
                  }
                }
              }}
              className="operation-button"
            >
              上报
            </AuthButton>
          )}
          {/* 已初审：0  学员待签字：6  已签字：7   */}
          {(record.isapply === '0' || record.isapply === '6' || record.isapply === '7') && (
            <AuthButton
              loading={_get(currentRecord, 'said') === _get(record, 'said') && cancelLoading}
              authId="student/phasedReview:btn2"
              onClick={async () => {
                _showConfirm({
                  title: '是否要撤销上报本条记录？',
                  handleOk: async () => {
                    setCurrentRecord(record);
                    cancelRun({ id: _get(record, 'said') });
                  },
                });
              }}
              className="operation-button"
              ghost={false}
              type="default"
            >
              撤销
            </AuthButton>
          )}
          {/* 已上报：1 2监管拒绝、3监管同意都显示获取审核结果按钮*/}
          {(Number(record.isapply) === 1 || Number(record.isapply) === 2 || Number(record.isapply) === 3) && (
            <AuthButton
              loading={_get(currentRecord, 'said') === _get(record, 'said') && getResultLoading}
              authId="student/phasedReview:btn3"
              className="operation-button"
              onClick={() => {
                setCurrentRecord(record);
                getResultRun({ id: record.said });
              }}
            >
              获取审核结果
            </AuthButton>
          )}

          {/*修正异常学时： 核实状态为7:学员已签字或0:已初审状态，同时备注字段中存在[异常学时]关键字*/}
          <AuthButton
            insertWhen={
              (_get(record, 'isapply', '') === '0' || _get(record, 'isapply', '') === '7') &&
              _get(record, 'respmsg', '').indexOf('异常学时') > -1
            }
            authId="student/phasedReview:btn11"
            className="operation-button"
            loading={_get(currentRecord, 'said') === _get(record, 'said') && editAbnormalDataLoading}
            onClick={() => {
              setCurrentRecord(record);
              editAbnormalDataRun({ id: record.said });
            }}
          >
            修正异常学时
          </AuthButton>
        </div>
      ),
    },
  ];

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRow: any) => {
      setSelectedRow(selectedRow);
      setSelectedRowKeys(selectedRowKeys);
    },
    selectedRowKeys,
  };

  async function getBatchPdfUrl(index: any) {
    if (index > selectedRowKeys.length) {
      setPreviewLoading(false);
      setPrintLoading(false);
      return;
    }

    if (index === selectedRowKeys.length) {
      setIsPrint(true);
      setPreviewLoading(false);
      setPrintLoading(false);
      return;
    }

    let res: any = {};

    res = await _getReport({ id: selectedRowKeys[index] });

    setIndex((index) => index + 1);
    if (_get(res, 'code') !== 200) {
      setPreviewLoading(false);
      setPrintLoading(false);
      index < selectedRowKeys.length && getBatchPdfUrl(index + 1);
    } else {
      _get(res, 'data', '') &&
        setPrintUrls((printUrls: any) => {
          return [...printUrls, _get(res, 'data', '')];
        });
      index < selectedRowKeys.length && getBatchPdfUrl(index + 1);
    }
  }

  async function batchReport(
    index: any,
    errorCount: number,
    errHashList: { [code: string]: { msg: string; total: number } } = {},
  ) {
    if (index > selectedRowKeys.length) {
      return;
    }

    if (index === selectedRowKeys.length) {
      const total: number = selectedRowKeys.length || 0;
      _showInfo({
        content: (
          <BatchProcessResult
            total={total}
            successTotal={total - errorCount}
            errorTotal={errorCount}
            errHashList={errHashList}
          />
        ),
      });
      setReportLoading(false);
      forceUpdate();
      return;
    }

    const reportTypeRes = await _getReportType({ id: selectedRowKeys[index] }); // 1:ukey盖章     0：传统方式不用ukey
    if (_get(reportTypeRes, 'code') !== 200) {
      setErrorCount((err) => err + 1);
      setIndex((index) => index + 1);

      const code = _get(reportTypeRes, 'code');
      if (!errHashList?.[code]) {
        errHashList[code] = {
          total: 1,
          msg: _get(reportTypeRes, 'message', '未知错误'),
        };
      } else {
        errHashList[code]['total']++;
      }

      index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1, errHashList);
      return;
    }

    let res: any = {};
    if (_get(reportTypeRes, 'data.useUkey', '') === '1') {
      setCurrentId(selectedRowKeys[index]);
      const ukeyFactory = _get(reportTypeRes, 'data.ukeyFactory', '');
      // 1--传统模式，国交加签模式，通讯报文中需要加签数据，对图章不做签名;
      // 2--福州地区Ukey模式。 对三联单pdf文件使用金格的组件 盖章，监管侧要对章验签。
      setUKeyFactory(ukeyFactory);
      if (ukeyFactory === '1') {
        await devGJReady(true);
        //  uKeyReport(selectedRowKeys[index], index, errorCount, true);
      } else {
        await fzUkReport(selectedRowKeys[index], index, errorCount, true);
      }
    } else {
      res = await _updateStuIsApply(
        {
          id: selectedRowKeys[index],
        },
        false,
      );

      setIndex((index) => index + 1);
      if (_get(res, 'code') !== 200) {
        setErrorCount((err) => err + 1);

        const code = _get(res, 'code');
        if (!errHashList?.[code]) {
          errHashList[code] = {
            total: 1,
            msg: _get(res, 'message', '未知错误'),
          };
        } else {
          errHashList[code]['total']++;
        }

        index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1, errHashList);
      } else {
        index < selectedRowKeys.length && batchReport(index + 1, errorCount, errHashList);
      }
    }
  }

  //批量获取审核结果
  const { loading, run } = useBulkStatisticsResult(_getResult, {
    onOk: (data) => {
      const { total, errorTotal, errHashList } = data;
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
      setSelectedRowKeys([]);
      forceUpdate();
    },
  });

  //重新上报
  const { run: batchApp, loading: batchLoad } = useBulkStatisticsResult(_reloadApp, {
    onOk: (data) => {
      const { total, errorTotal, errHashList } = data;
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
      setSelectedRowKeys([]);
      forceUpdate();
    },
  });

  // 配比学时管理
  function allocateHours() {
    setAllocatedVisible();
  }

  return (
    <div>
      {pushPoliceVisible && (
        <PushPolice
          onCancel={() => {
            setPushPoliceVisible();
            forceUpdate();
          }}
        />
      )}
      {noSoftwareVisible && (
        <UpdatePlugin onCancel={setNoSoftwareVisible} info="无法调用打印程序" plugin="print_package.zip" />
      )}
      {fzUkeyUpdatePluginVisible && (
        <UpdatePlugin onCancel={setFzUkeyUpdatePluginVisible} info="无法调用UKey插件服务" plugin="ukey_package.zip" />
      )}
      {gjUkeyUpdatePluginVisible && (
        <UpdatePlugin
          onCancel={() => {
            setGjUkeyUpdatePluginVisible();
            setReportLoading(false);
            setUKLoading(false);
          }}
          info="无法调用UKey插件服务"
          plugin="gj_ukey_package.zip"
        />
      )}
      {signVisible && (
        <Signature
          onCancel={setSignVisible}
          onOk={async (result: any) => {
            const res = await _submitSignature({
              sid: _get(currentRecord, 'sid', ''),
              said: _get(currentRecord, 'said', ''),
              fileid: _get(result, 'data.id', ''),
              filetype: signType,
            });
            if (_get(res, 'code') === 200) {
              // 区分是否是补充签名
              if (isAdditionalSignatures) {
                _viewReport({ id: _get(currentRecord, 'sid') });
                setSignVisible();
                message.success(`签名补签成功，后台正在处理中，请1分钟后再查看三联单`);
              } else {
                message.success(_get(res, 'message'));
                setSignVisible();
                forceUpdate();
              }
              setSelectedRow([]);
              setSelectedRowKeys([]);
            } else {
              message.error(_get(res, 'message'));
            }
          }}
        />
      )}
      {visible && <Review onCancel={_switchVisible} onOk={_handleOk} title="初审信息" />}
      {pinVisible && (
        <InputPIN
          onCancel={() => {
            _switchPinVisible();
            setIndex((index) => index + 1);
            setErrorCount((err) => err + 1);
            setUKLoading(false);
            setReportLoading(false);
            index < selectedRowKeys.length && batchReport(index + 1, errorCount + 1);
          }}
          onOk={() => {
            _switchPinVisible();
            forceUpdate();
          }}
          currentId={currentId}
          uKeyReport={gjReporte}
          index={index}
          errorCount={errorCount}
          batch={batch}
          ukeyFactory={ukeyFactory}
          fzUkReport={fzUkReport}
          keySn={keySn}
        />
      )}
      {allocatedHoursVisible && (
        <AllocatedHours
          onCancel={function (): void {
            setAllocatedVisible();
          }}
          onOk={function (): void {
            setAllocatedVisible();
          }}
        />
      )}
      <Search
        loading={isLoading}
        filters={[
          {
            type: 'RangePicker',
            field: ['sdate', 'edate'],
            placeholder: ['初审日期起', '初审日期止'],
          },
          {
            type: 'SimpleSelectOfStudent',
            field: 'sid',
          },
          {
            type: 'Select',
            field: 'subject',
            options: [{ value: '', label: '报审类型(全部)' }, ...useOptions('SchoolSubjectApply')],
          },
          {
            type: 'Select',
            field: 'isapply',
            options: [{ value: '', label: '核实状态(全部)' }, ...useOptions('SubjectApplyStatus')],
          },
          {
            type: 'SimpleSelectOfCoach',
            field: 'cid',
          },
        ]}
        search={search}
        ref={searchRef}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          setPagination({ ...pagination, current: 1 });
          forceUpdate();
        }}
        simpleStudentRequest={_getStudentList}
        simpleCoachRequest={_getCoachList}
        showSearchButton={false}
      />
      <ButtonContainer
        showSearchButton={true}
        refreshTable={() => {
          setPagination({ ...pagination, current: 1 });
          forceUpdate();
        }}
        loading={isLoading}
      >
        <AuthButton
          authId="student/phasedReview:btn1"
          type="primary"
          onClick={() => _switchVisible()}
          className="mr20 mb20"
        >
          初审
        </AuthButton>
        <AuthButton
          authId="student/phasedReview:btn5"
          type="primary"
          loading={reportLoading}
          onClick={async () => {
            if (selectedRowKeys.length < 1) {
              message.error('当前没有符合上报条件的记录');
              return;
            }
            setBatch(true);
            setReportLoading(true);
            setIndex(0);
            setErrorCount(0);
            batchReport(0, 0);
          }}
          className="mr10 mb20"
          disabled={buttonDisabled}
          tooltip={warningText}
        >
          批量上报
        </AuthButton>
        <AuthButton
          authId="student/phasedReview:btn6"
          icon={<DownloadOutlined />}
          onClick={async () => {
            // 11-10 解除导出 时间的限制
            const query = {
              sdate: _get(search, 'sdate'),
              edate: _get(search, 'edate'),
              subject: _get(search, 'subject'),
              isapply: _get(search, 'isapply'),
              sid: _get(search, 'sid'),
              cid: _get(search, 'cid'),
            };

            const res = await _exportStageApplyBefore(query);

            if (_get(res, 'code') === 200) {
              _export(query).then((res: any) => {
                downloadFile(res, '报审名单', 'application/vnd.ms-excel', 'xlsx');
              });
            } else {
              message.error(_get(res, 'message'));
            }
          }}
          style={{ margin: '0 20px 20px 20px' }}
        >
          导出
        </AuthButton>

        <AuthButton
          authId="student/phasedReview:btn13"
          loading={loading}
          onClick={async () => {
            if (selectedRowKeys.length < 1) {
              message.error('请选中需要获取的审核结果');
              return;
            }
            if (!selectedRow.every((item: any) => ['1', '2', '3'].includes(item?.isapply))) {
              //已上报，监管同意，监管拒绝的才能获取审核结果
              message.error('只能选择已上报、监管拒绝和监管同意的报审记录，请重新选择！');
              return;
            }
            run(selectedRow, {
              priKeyValMap: [{ key: 'id', value: 'said' }],
              otherParams: { withFeedbackAll: false },
            });
          }}
          style={{ margin: '0 20px 20px 20px' }}
        >
          <Tooltip title="获取已经上报到监管的报审记录审核结果">获取审核结果</Tooltip>
        </AuthButton>

        <AuthButton
          authId="student/phasedReview:btn14"
          loading={batchLoad}
          onClick={async () => {
            if (selectedRowKeys.length < 1) {
              message.error('请选中需要重新上报的数据');
              return;
            }
            if (!selectedRow.every((item: any) => ['1', '2'].includes(item?.isapply))) {
              //已上报，监管同意，监管拒绝的才能获取审核结果
              message.error('请选择核实状态为已上报和监管同意的，再点击重新上报！');
              return;
            }
            batchApp(selectedRow, {
              priKeyValMap: [{ key: 'id', value: 'said' }],
            });
          }}
          style={{ margin: '0 20px 20px 20px' }}
        >
          <Tooltip title="已上报，监管同意的重新上报到监管">重新上报</Tooltip>
        </AuthButton>

        <AuthButton className="ml20" authId="student/phasedReview:btn16" onClick={allocateHours}>
          配比学时管理
        </AuthButton>
        <AuthButton authId="student/phasedReview:btn15" className="ml20 mb20 mr20" onClick={setPushPoliceVisible}>
          推送公安
        </AuthButton>
        <MoreOperation moreButtonName="培训记录单管理" type="button">
          <AuthButton
            authId="student/phasedReview:btn20"
            className="operation-button"
            onClick={() => {
              if (selectedRowKeys.length === 0) {
                message.error('请选择一条数据');
                return;
              }
              if (selectedRowKeys.length !== 1) {
                message.error('只能选择一条数据，请重新选择');
                return;
              }
              _showConfirm({
                title: '清空培训记录单将会重置pdf样式，原有数据会保留，确认需要清空吗？',
                handleOk: async () => {
                  const res = await _viewReport({ id: _get(selectedRow, '[0].sid') });
                  if (_get(res, 'code') === 200) {
                    message.success(_get(res, 'message'));
                    forceUpdate();
                    setSelectedRow([]);
                    setSelectedRowKeys([]);
                  } else {
                    message.error(_get(res, 'message'));
                  }
                },
              });
            }}
          >
            清空培训记录单
          </AuthButton>
          <AuthButton
            authId="student/phasedReview:btn12"
            className="operation-button"
            onClick={() => {
              if (selectedRowKeys.length === 0) {
                message.error('请选择一条数据');
                return;
              }
              if (selectedRowKeys.length !== 1) {
                message.error('只能选择一条记录，请重新选择');
                return;
              }
              setCurrentRecord(selectedRow[0]);
              setIsAdditionalSignatures(true);
              setSignVisible();
              setSignType('1');
            }}
          >
            学员签名
          </AuthButton>
          <AuthButton
            authId="student/phasedReview:btn21"
            className="operation-button"
            onClick={() => {
              if (selectedRowKeys.length === 0) {
                message.error('请选择一条数据');
                return;
              }
              if (selectedRowKeys.length !== 1) {
                message.error('只能选择一条记录，请重新选择');
                return;
              }
              setCurrentRecord(selectedRow[0]);
              setIsAdditionalSignatures(true);
              setSignVisible();
              setSignType('2');
            }}
          >
            教练员签名
          </AuthButton>
          <AuthButton
            authId="student/phasedReview:btn22"
            className="operation-button"
            onClick={() => {
              if (selectedRowKeys.length === 0) {
                message.error('请选择一条数据');
                return;
              }
              if (selectedRowKeys.length !== 1) {
                message.error('只能选择一条记录，请重新选择');
                return;
              }
              setCurrentRecord(selectedRow[0]);
              setIsAdditionalSignatures(true);
              setSignType('3');
              setSignVisible();
            }}
          >
            考核员签名
          </AuthButton>
          <AuthButton
            authId="student/phasedReview:btn10"
            className="operation-button"
            onClick={() => {
              if (selectedRowKeys.length === 0) {
                message.error('请选择一条数据');
                return;
              }
              if (selectedRowKeys.length !== 1) {
                message.error('只能选择一条记录，请重新选择');
                return;
              }
              setCurrentRecord(selectedRow[0]);
              getSupervisorPlatformRun({ id: selectedRowKeys[0] });
            }}
          >
            补传培训记录单
          </AuthButton>
        </MoreOperation>
      </ButtonContainer>

      <CustomTable
        scroll={{ x: 2000, y: getTableMaxHeightRef(searchRef) }}
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        rowKey={(record: any) => _get(record, 'said')}
        pagination={tablePagination}
      />
    </div>
  );
}

export default PhasedReview;
