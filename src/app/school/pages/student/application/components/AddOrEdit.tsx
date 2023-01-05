import { memo, useEffect, useRef, useState } from 'react';
import { Modal, Form, Select, message, Spin, Row } from 'antd';

import ApplicationForReview from './ApplicationForReview';
import AdvanceSettlement from './AdvanceSettlement';
import ClassChange from './ClassChange';
import { Auth, formatTime, _get } from 'utils';
import { useStudentsSearch } from '../hooks';
import { useConfirm, useFetch, useOptions } from 'hooks';
import { ItemCol } from 'components';
import {
  ApplicationDetail,
  PackageChange,
  ReportRecord,
  Settlement,
  _checkBeforeAdvanceSettlement,
  _getApplicationDetail,
  _insertApplicationInfo,
  _updateApplicationInfo,
} from '../_api';
import moment, { Moment } from 'moment';
import MultipleUpload from '../../applicationReview/MultipleUpload';
import { UploadFile, UploadFileStatus } from 'antd/lib/upload/interface';
import { _getDetails, _queryAccountInfo } from '../../studentInfo/_api';

const { Item } = Form;
type PartTime = Moment | null | undefined;
export type PackInfo = {
  package_name?: string;
  package_id?: string;
  bankchannelid?: string;
  bankchannelname?: string;
  traintype?: string;
};
interface Props {
  isReSub: boolean; // 是否是重新提交 当用户重新提交的时候 调用的其实是新增接口 但是比新增接口方便 仅仅是为了不重新填写数据
  isEdit: boolean;
  onCancel: () => void;
  onOk: () => void;
  currentRecord: {
    id: string;
  };
}

type FormValue = {
  applyType: string;
  sid: string;

  // 报审补录
  firstPartTime?: Moment;
  secondPartTime?: Moment;
  thirdPartTime?: Moment;
  fourthPartTime?: Moment;

  // 更换班级
  pack_id?: string;

  // 提前结算

  secondPartMileage?: string;
  thirdPartMileage?: string;
};

export type FileRes = { data: { id: string; url: string } };

function AddOrEdit({ isReSub, isEdit, onOk, onCancel, currentRecord }: Props) {
  const [form] = Form.useForm<FormValue>();
  const { handleStudentSearchMemo, studentSearchLoading, studentOptions, setStudentOptions } = useStudentsSearch();
  const [applicationType, setApplicationType] = useState('');
  const [fileList, setFileList] = useState<UploadFile<FileRes>[]>([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirm] = useConfirm();
  const oldApplicationType = useRef<string | undefined>(undefined);

  // 更换班级的原因（可控）
  const [applyMessage, setApplyMessage] = useState('');
  const [newPackName, setNewPackAgeName] = useState('');

  const [sid, setSid] = useState<null | string>(null);
  const [studentType, setStudentType] = useState<string | undefined>(undefined); // 编辑

  const [packInfo, setPackInfo] = useState<PackInfo>({
    package_name: undefined,
    package_id: undefined,
    bankchannelid: undefined,
    bankchannelname: undefined,
    traintype: undefined,
  });

  const [amountInfo, setAmountInfo] = useState<Settlement>({
    packageamount: undefined,
    rechargeamount: undefined,
    currentbalance: undefined,
    settledamount: undefined,
    tobesettledamount: undefined,
  });

  const { data, isLoading }: { data: ApplicationDetail; isLoading: boolean } = useFetch({
    request: _getApplicationDetail,
    query: {
      id: _get(currentRecord, 'id', ''),
    },
    requiredFields: ['id'],
    forceCancel: !_get(currentRecord, 'id'),
    callback(applicationDetail: ApplicationDetail) {
      const applyType = _get(applicationDetail, ['stuApplyFormTotalVO', 'applyType'], '');
      const sid = _get(applicationDetail, ['stuApplyFormTotalVO', 'sid'], '');
      const idCard = _get(applicationDetail, ['stuApplyFormTotalVO', 'idCard'], '');
      const studentName = _get(applicationDetail, ['stuApplyFormTotalVO', 'studentName'], '');
      const mockStudentOptions = [{ value: sid, label: `${studentName} ${idCard}` }];

      setStudentOptions(mockStudentOptions);
      setApplicationType(applyType);
      form.setFieldsValue({
        applyType,
        sid,
      });
      switch (applyType) {
        case '1': // 报审补录
          handleDetailForStuReportRecord(_get(applicationDetail, ['stuReportRecordDetailVo'], {}));
          handleFiles(
            _get(applicationDetail, ['stuApplyFormTotalVO', 'applyTempId'], []),
            _get(applicationDetail, ['stuApplyFormTotalVO', 'applyFileUrls'], []),
          );
          break;
        case '2': // 更换班级
          handleDetailForStuPackageChange({
            sid: _get(applicationDetail, ['stuApplyFormTotalVO', 'sid'], ''),
            packageChange: _get(applicationDetail, 'stuPackageChangeApplyVo', {}),
            traintype: _get(applicationDetail, ['stuApplyFormTotalVO', 'carType'], ''),
            applyMessage: _get(applicationDetail, ['stuApplyFormTotalVO', 'applyMessage'], ''),
          });
          break;
        case '3': // 提前结清
          handleDetailForStuSettlement(_get(applicationDetail, 'stuSettlementDetailVo', {}));
          handleFiles(
            _get(applicationDetail, ['stuApplyFormTotalVO', 'applyTempId'], []),
            _get(applicationDetail, ['stuApplyFormTotalVO', 'applyFileUrls'], []),
          );
          break;
        default:
          break;
      }
    },
  });

  const handleFiles = (imgIds: string[], imgUrls: string[]) => {
    const tempList = [...imgIds];
    const fileList = imgUrls.map((file, index) => ({
      name: file || `image_${index}`,
      status: 'done' as UploadFileStatus,
      url: file,
      uid: tempList[index],
      thumbUrl: file,
      id: tempList[index],
    }));
    setFileList(fileList);
  };

  const handleDetailForStuReportRecord = (reportRecord: ReportRecord) => {
    const formField: Record<string, Moment> = {};
    if (_get(reportRecord, 'id', '')) {
      delete reportRecord['id'];
    }
    for (const key in reportRecord) {
      if (Object.prototype.hasOwnProperty.call(reportRecord, key)) {
        const element = reportRecord[key];
        if (
          moment(element).isValid() &&
          (key === 'firstPartTime' || key === 'secondPartTime' || key === 'thirdPartTime' || key === 'fourthPartTime')
        ) {
          formField[key] = moment(element);
        }

        if (key === 'secondPartMileage' || key === 'thirdPartMileage') {
          formField[key] = element;
        }
      }
    }
    form.setFieldsValue({ ...formField });
  };

  const handleDetailForStuPackageChange = ({
    packageChange,
    sid,
    traintype,
    applyMessage,
  }: {
    packageChange: PackageChange;
    sid: string;
    traintype: string;
    applyMessage: string;
  }) => {
    const { newPackId, oldPackId, oldBankChannelName, oldBankChannelId, oldPackName, newPackName } = packageChange;
    setPackInfo({
      package_id: oldPackId,
      package_name: oldPackName,
      bankchannelid: oldBankChannelId,
      bankchannelname: oldBankChannelName,
      traintype: traintype,
    });
    setSid(sid);
    setApplyMessage(applyMessage);
    setNewPackAgeName(String(newPackName));
    form.setFieldsValue({
      pack_id: newPackId,
    });
  };

  const handleDetailForStuSettlement = (settlement: Settlement) => {
    const {
      bankChannelId,
      bankChannelName,
      tobesettledamount,
      packageamount,
      rechargeamount,
      currentbalance,
      settledamount,
    } = settlement;

    setPackInfo({
      bankchannelid: bankChannelId,
      bankchannelname: bankChannelName,
    });

    setAmountInfo({
      packageamount,
      rechargeamount,
      currentbalance,
      settledamount,
      tobesettledamount,
    });
  };

  const OtherComponent = (type: string) => {
    switch (type) {
      case '1':
        return <ApplicationForReview />;
      case '2':
        return (
          <ClassChange
            sid={sid}
            studentType={studentType}
            packInfo={packInfo}
            applyMessage={applyMessage}
            setNewPackName={setNewPackAgeName}
            setApplyMessage={setApplyMessage}
          />
        );
      case '3':
        return (
          <AdvanceSettlement
            amountInfo={isEdit || isReSub ? _get(data, 'stuSettlementDetailVo', amountInfo) : amountInfo}
            packInfo={packInfo}
          />
        );
      default:
        return null;
    }
  };

  const fetchApplicationInfo = async (body: Parameters<typeof _insertApplicationInfo>['0']) => {
    try {
      setConfirmLoading(true);
      let response;
      if (isEdit) {
        response = await _updateApplicationInfo(body);
      } else {
        response = await _insertApplicationInfo(body);
      }
      const code = _get(response, 'code');
      const mes = _get(response, 'message');
      if (code === 200) {
        message.info({
          content: '申请已提交，请耐心等待',
          icon: () => null,
        });
        onOk();
      } else {
        message.error(mes);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleSubmit = (type: string, { sid, applyType }: FormValue) => {
    let body: Parameters<typeof _insertApplicationInfo>[0] = {
      stuApplyFormTotalVO: {
        sid,
        applyType,
        schoolId: Auth.get('schoolId') || '',
      },
    };
    switch (type) {
      case '1':
        handleReportRecordBeforeSubmit(body);
        break;
      case '2':
        handleClassChangeBeforeSubmit(body);
        break;
      case '3':
        handleSettlementBeforeSubmit(body);
        break;
      default:
        break;
    }
  };

  const handleReportRecordBeforeSubmit = (body: Parameters<typeof _insertApplicationInfo>[0]) => {
    let baseBody = { ...body };
    let timeBody: ReportRecord = {};

    const handleTime = (Time: unknown, key: string) => {
      const formatter = formatTime(Time, 'NORMAL');
      const isValidTime = moment(formatter).isValid();
      return {
        isValidTime,
        formatter,
        key,
      };
    };

    const foreachTime = ({
      firstPartTime,
      secondPartTime,
      thirdPartTime,
      fourthPartTime,
    }: {
      firstPartTime: PartTime;
      secondPartTime: PartTime;
      thirdPartTime: PartTime;
      fourthPartTime: PartTime;
    }) => {
      const arr: ReturnType<typeof handleTime>[] = [];
      const formatTimeForFirstPartTime = handleTime(firstPartTime, 'firstPartTime');
      arr.push(formatTimeForFirstPartTime);
      const formatTimeForSecondPartTime = handleTime(secondPartTime, 'secondPartTime');
      arr.push(formatTimeForSecondPartTime);
      const formatTimeForThirdPartTime = handleTime(thirdPartTime, 'thirdPartTime');
      arr.push(formatTimeForThirdPartTime);
      const formatTimeForFourthPartTime = handleTime(fourthPartTime, 'fourthPartTime');
      arr.push(formatTimeForFourthPartTime);
      return arr.filter((item) => item.isValidTime);
    };

    const { firstPartTime, secondPartTime, thirdPartTime, fourthPartTime } = form.getFieldsValue();
    if (firstPartTime || secondPartTime || thirdPartTime || fourthPartTime) {
      const handleTimeArr = foreachTime({ firstPartTime, secondPartTime, thirdPartTime, fourthPartTime });
      handleTimeArr.forEach((time) => {
        timeBody[time.key] = time.formatter;
      });
    } else {
      return message.error('至少有一科报审日期不为空');
    }

    // 证明文件的处理
    const files = handleFilesBeforeSubmit();
    if (!Array.isArray(files)) return;
    if (isEdit) {
      const stuReportRecordDetailVo = _get(data, ['stuReportRecordDetailVo'], {});
      const stuApplyFormTotalVO = _get(data, ['stuApplyFormTotalVO'], {});

      const handleStuReportRecord = {
        ...stuReportRecordDetailVo,
        ...timeBody,
      };

      // 在编辑的是清空部分 parTime
      const allPartTimeKey = ['firstPartTime', 'secondPartTime', 'thirdPartTime', 'fourthPartTime'];
      const needEmptyPartTime = allPartTimeKey.filter((partTimeKey) => !timeBody[partTimeKey]);

      needEmptyPartTime.forEach((needEmptyPartTime) => {
        delete handleStuReportRecord[needEmptyPartTime];
      });
      const { secondPartMileage, thirdPartMileage } = form.getFieldsValue();
      baseBody = {
        stuReportRecordDetailVo: Object.assign(handleStuReportRecord, { secondPartMileage, thirdPartMileage }),
        stuApplyFormTotalVO: {
          ...stuApplyFormTotalVO,
          applyTempId: files.map((file) => file.id),
        },
      };
    } else {
      const { secondPartMileage, thirdPartMileage } = form.getFieldsValue();
      baseBody = {
        stuReportRecordDetailVo: Object.assign(timeBody, {
          secondPartMileage: Number(secondPartMileage),
          thirdPartMileage: Number(thirdPartMileage),
        }),
        stuApplyFormTotalVO: {
          ...baseBody['stuApplyFormTotalVO'],
          applyTempId: files.map((file) => file.id),
        },
      };
    }

    fetchApplicationInfo(baseBody);
  };

  const handleClassChangeBeforeSubmit = (body: Parameters<typeof _insertApplicationInfo>[0]) => {
    let baseBody = { ...body };
    let classBody: PackageChange = {};
    const { pack_id } = form.getFieldsValue();
    const { package_id, package_name, bankchannelid, bankchannelname } = packInfo;
    classBody = {
      oldPackId: package_id,
      oldPackName: package_name,
      oldBankChannelId: bankchannelid,
      oldBankChannelName: bankchannelname,
      newPackName,
      newPackId: pack_id,
    };
    if (isEdit) {
      const stuPackageChangeApplyVo = _get(data, ['stuPackageChangeApplyVo'], {});
      const stuApplyFormTotalVO = _get(data, ['stuApplyFormTotalVO'], {});
      baseBody = {
        stuApplyFormTotalVO: {
          ...stuApplyFormTotalVO,
          applyMessage,
        },
        stuPackageChangeApplyVo: {
          ...stuPackageChangeApplyVo,
          ...classBody,
        },
      };
    } else {
      baseBody = {
        stuApplyFormTotalVO: {
          ...baseBody['stuApplyFormTotalVO'],
          applyMessage,
        },
        stuPackageChangeApplyVo: {
          ...classBody,
        },
      };
    }

    fetchApplicationInfo(baseBody);
  };

  const handleSettlementBeforeSubmit = (body: Parameters<typeof _insertApplicationInfo>[0]) => {
    let baseBody = { ...body };
    const { bankchannelid, bankchannelname } = packInfo;
    const { packageamount, rechargeamount, currentbalance, settledamount, tobesettledamount } = amountInfo;
    let settleBody: Settlement = {
      packageamount,
      rechargeamount,
      currentbalance,
      settledamount,
      tobesettledamount,
      bankChannelId: bankchannelid,
      bankChannelName: bankchannelname,
    };

    const files = handleFilesBeforeSubmit();
    if (!Array.isArray(files)) return;
    if (isEdit) {
      const stuSettlementDetailVo = _get(data, 'stuSettlementDetailVo', {});
      const stuApplyFormTotalVO = _get(data, 'stuApplyFormTotalVO', {});
      baseBody = {
        stuApplyFormTotalVO: {
          ...stuApplyFormTotalVO,
          applyTempId: files.map((file) => file.id),
        },
        stuSettlementDetailVo: {
          ...stuSettlementDetailVo,
          ...settleBody,
        },
      };
    } else {
      baseBody = {
        stuApplyFormTotalVO: {
          ...baseBody['stuApplyFormTotalVO'],
          applyTempId: files.map((file) => file.id),
        },
        stuSettlementDetailVo: {
          ...settleBody,
        },
      };
    }
    checkBeforeAdvanceSettlement(form.getFieldValue('sid'), () => {
      confirm({
        title: `确认要将剩余金额结算到【${bankchannelname}钱包】`, // TODO: (不要忘记这个)动态钱包名字
        handleOk() {
          fetchApplicationInfo(baseBody);
        },
      });
    });
  };

  // 证明文件的处理
  const handleFilesBeforeSubmit = () => {
    const files = fileList
      .map((file) => {
        return file.response
          ? {
              id: _get<UploadFile<FileRes>, 'response'>(file, ['response'])?.data?.id,
              url: _get<UploadFile<FileRes>, 'response'>(file, ['response'])?.data?.url,
            }
          : { id: _get(file, 'id'), url: _get(file, 'url') };
      })
      .filter((file) => file.id);

    if (!files.length) {
      return message.error('请上传证明文件');
    }
    return files;
  };

  // 提前结算的校验
  const checkBeforeAdvanceSettlement = async (sid: string, callback?: () => void) => {
    try {
      if (callback) {
        setConfirmLoading(true);
      }
      const response = await _checkBeforeAdvanceSettlement({
        sid,
      });
      const code = _get(response, 'code');
      const mes = _get(response, 'message', '');

      setConfirmLoading(false);
      if (code === 200) {
        if (callback) {
          callback(); // 提交前的校验
        } else {
          getAmountInfo(sid as string); // 当学员选择申请类型为 “提前结清”的时候校验
        }
      } else {
        message.error(mes);

        // Promise.resolve().then(() => {
        //   form.setFieldsValue({
        //     applyType: oldApplicationType.current,
        //   });
        // });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 专门获取学员类型
  useEffect(() => {
    if (_get(currentRecord, 'applyType') === '2') {
      getStudentInfo(_get(currentRecord, 'sid', ''), true); // 针对用户编辑的时候 更换班级的
    }
  }, [currentRecord]);

  // 搜索学员的基础信息
  const getStudentInfo = async (id: string, isEdit: boolean = false) => {
    try {
      setConfirmLoading(true);
      const response = await _getDetails({ id }, { customSchoolId: Auth.get('schoolId') || '' });
      const code = _get(response, 'code');
      const mes = _get(response, 'message');
      if (code === 200) {
        const data: PackInfo = _get(response, 'data', {});
        const studenttype = _get(data, 'studenttype');
        setStudentType(studenttype);
        if (!isEdit) {
          // 更换班级和提前结算需要用到的
          const package_name = _get(data, 'package_name', '');
          const package_id = _get(data, 'package_id', '');
          const bankchannelid = _get(data, 'bankchannelid', '');
          const bankchannelname = _get(data, 'bankchannelname', '');
          const traintype = _get(data, 'traintype');
          setSid(id);
          setPackInfo({
            package_name,
            package_id,
            bankchannelid,
            bankchannelname,
            traintype,
          });
        }
      } else {
        message.error(mes);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const getAmountInfo = async (sid: string) => {
    try {
      const response = await _queryAccountInfo({
        sid,
      });
      const code = _get(response, 'code');
      const mes = _get(response, 'message', '');
      if (code === 200) {
        const data = _get(response, 'data', {});
        const { packageAmount, rechargeAmount, currentBalance, settledAmount, toBeSettledAmount } = data;
        setAmountInfo({
          packageamount: packageAmount,
          rechargeamount: rechargeAmount,
          currentbalance: currentBalance,
          settledamount: settledAmount,
          tobesettledamount: toBeSettledAmount,
        });
      } else {
        message.error(mes);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      visible
      title={isReSub ? '重新提交' : isEdit ? '编辑申请' : '新增申请'}
      okText={'提交'}
      onOk={() => {
        form.validateFields().then((values) => {
          const { applyType } = values;
          handleSubmit(applyType, values);
        });
      }}
      onCancel={onCancel}
      maskClosable={false}
      confirmLoading={confirmLoading}
      width={800}
    >
      <Spin spinning={isLoading}>
        <Form form={form} wrapperCol={{ span: 8 }} labelCol={{ span: 8 }}>
          <Row>
            {/* 基础的选项 */}
            <ItemCol span={12} label={'学员姓名'} name="sid" rules={[{ required: true }]}>
              <Select
                disabled={isEdit || isReSub}
                placeholder={'学员姓名/证件号码'}
                showSearch
                allowClear
                filterOption={false}
                options={studentOptions}
                loading={studentSearchLoading}
                onSearch={(value) => {
                  handleStudentSearchMemo(value);
                }}
                onChange={(value) => {
                  if (value) {
                    getStudentInfo(value as string); // 去调用该学员的详情接口 获取申请类型为“更换班级” “提前结清”中需要的参数
                  }
                  if (form.getFieldValue('applyType') === '3' && value) {
                    checkBeforeAdvanceSettlement(value as string);
                  }
                }}
              />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol
              label={'申请类型'}
              span={12}
              required
              name="applyType"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                disabled={isEdit || isReSub}
                placeholder={'请选择申请类型'}
                options={useOptions('stu_apply_type').filter((item) => item.value !== '6')}
                onChange={(value: string) => {
                  if (!form.getFieldValue('sid')) {
                    Promise.resolve().then(() => {
                      form.setFieldsValue({
                        applyType: oldApplicationType.current,
                      });
                    });
                    return message.info('请先选择学员');
                  }
                  if (value === '3') {
                    checkBeforeAdvanceSettlement(form.getFieldValue('sid'));
                  }
                  setApplicationType(value);
                  oldApplicationType.current = value;
                }}
              />
            </ItemCol>
          </Row>
          {OtherComponent(applicationType)}

          <Row>
            {/* 类型为报审补录或者提前结算的时候需要填写证明文件 */}
            {(applicationType === '1' || applicationType === '3') && (
              <ItemCol label="证明文件" required span={12}>
                <MultipleUpload
                  limit={10}
                  setFileList={setFileList}
                  fileList={(fileList as unknown) as UploadFile[]}
                  disabled={false}
                  setConfirmLoading={setConfirmLoading}
                />
              </ItemCol>
            )}
          </Row>
        </Form>
      </Spin>
    </Modal>
  );
}

export default memo(AddOrEdit);
