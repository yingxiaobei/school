import React, { useRef, useState } from 'react';
import { Form, message, Modal, Select, Space, Spin } from 'antd';
import { useConfirm, useFetch, useOptions } from 'hooks';
import { Auth, formatTime, _get } from 'utils';
import { useStudentsSearch } from '../hooks';
import {
  ApplicationDetail,
  ApplyDate,
  TrainTypeChange,
  _getApplicationDetail,
  _insertApplicationInfo,
  _updateApplicationInfo,
} from '../_api';
import ApplicationDate from './ApplicationDate';
import CarTypeChange from './CarTypeChange';
import InlineUploadPdf from './InlineUploadPdf';
import { _checkChangeCarNeedDeductCard, _getDetails } from '../../studentInfo/_api';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import moment, { Moment } from 'moment';

const { Item } = Form;

interface JGAddOrEditProps {
  isEdit: boolean;
  onCancel: () => void;
  onOk: () => void;
  currentRecord: {
    id: string;
  };
  isReSub: boolean;
}

export type StudentInfo = {
  carType?: string; // 服务端返回的字段是traintype
  applydate?: string; // 服务端返回的字段 applydate

  sid?: string;
};

type BaseInfo = {
  studentName: string;
  idCard: string;
  sid: string;
  applyType: string;
};

type FormValue = {
  applyType: string;
  sid: string;
  // 车型修改
  carType?: string;
  // 报名日期修改
  applydate?: Moment;
};

type Body = Parameters<typeof _insertApplicationInfo>[0];

export default function JGAddOrEdit({ isReSub, isEdit, onCancel, onOk, currentRecord }: JGAddOrEditProps) {
  const [_showConfirm] = useConfirm();
  const [form] = Form.useForm<FormValue>();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isAllowCarTypeChange, setIsAllowCarTypeChange] = useState(false);
  const [applicationType, setApplicationType] = useState('');

  const [pdfId, setPdfId] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  const [studentInfo, setStudentInfo] = useState<StudentInfo>({} as StudentInfo);
  const [baseInfo, setBaseInfo] = useState<BaseInfo>({} as BaseInfo);
  const { handleStudentSearchMemo, studentSearchLoading, studentOptions } = useStudentsSearch();
  const oldApplicationType = useRef<string | undefined>();
  const applyOptions = useOptions('stu_apply_type', false, '10');

  const { data, isLoading }: { data: ApplicationDetail; isLoading: boolean } = useFetch({
    request: _getApplicationDetail,
    query: {
      id: _get(currentRecord, 'id', ''),
    },
    requiredFields: ['id'],
    forceCancel: !_get(currentRecord, 'id'),
    callback(applicationDetail: ApplicationDetail) {
      const { applyType = '', sid = '', idCard = '', studentName = '' } = _get(applicationDetail, [
        'stuApplyFormTotalVO',
      ]);

      setBaseInfo({
        studentName,
        idCard,
        applyType,
        sid,
      });

      const pdfUrl: string = _get(applicationDetail, ['stuApplyFormTotalVO', 'applyFileUrls', 0], '');
      setPdfUrl(pdfUrl);
      const pdfId: string = _get(applicationDetail, ['stuApplyFormTotalVO', 'applyTempId', 0], '');
      setPdfId(pdfId);

      setApplicationType(applyType);
      // form.setFieldsValue({
      //   applyType,
      //   sid,
      // });
      switch (applyType) {
        case '4':
          handleDetailForStuCarType(_get(applicationDetail, ['stuChangeTraintypeDetailVo'], {}), sid);
          break;
        case '5':
          handleDetailForStuApplicationDate(_get(applicationDetail, ['stuChangeApplydateDetailVo'], {}));
          break;
        default:
          break;
      }
    },
  });

  const handleDetailForStuCarType = (trainTypeChange: TrainTypeChange, sid: string) => {
    const { oldTrainType, newTrainType } = trainTypeChange;

    // NOTE: 实际不会进入该分支
    if (oldTrainType !== 'C1' && oldTrainType !== 'C2') {
      setIsAllowCarTypeChange(true);
    }
    setStudentInfo({
      carType: oldTrainType,
      sid,
    });
    form.setFieldsValue({
      carType: newTrainType,
    });
  };

  const handleDetailForStuApplicationDate = (applyDate: ApplyDate) => {
    const { oldApplyDate, newApplyDate } = applyDate;
    setStudentInfo({
      applydate: oldApplyDate,
    });
    form.setFieldsValue({
      applydate: moment(newApplyDate),
    });
  };

  const handleSubmit = (type: string, { applyType, sid }: { applyType: string; sid: string }) => {
    let body: Body = {} as Body;

    if (isEdit || isReSub) {
      const { sid, applyType } = baseInfo;
      body = {
        stuApplyFormTotalVO: {
          sid,
          applyType,
          schoolId: Auth.get('schoolId') || '',
        },
      };
    } else {
      body = {
        stuApplyFormTotalVO: {
          sid,
          applyType,
          schoolId: Auth.get('schoolId') || '',
        },
      };
    }

    switch (type) {
      case '4':
        handleCarTypeChangeBeforeSubmit(body);
        break;
      case '5':
        handleApplicationDateBeforeSubmit(body);
        break;
      default:
        break;
    }
  };

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

  const handleCarTypeChangeBeforeSubmit = async (body: Body) => {
    let baseBody: Body = JSON.parse(JSON.stringify(body));
    let carTypeBody: TrainTypeChange = {};
    if (isAllowCarTypeChange) {
      return;
    }
    if (!pdfId) {
      return message.error('请上传申请文件');
    }

    const { carType: newTrainType } = form.getFieldsValue();
    const { carType: oldTrainType, sid } = studentInfo;
    carTypeBody = {
      oldTrainType,
      newTrainType,
    };
    if (isEdit) {
      // 编辑
      const stuApplyFormTotalVO = _get(data, ['stuApplyFormTotalVO'], {});
      const stuChangeTraintypeDetailVo = _get(data, ['stuChangeTraintypeDetailVo'], {});
      baseBody = {
        stuApplyFormTotalVO: {
          ...stuApplyFormTotalVO,
          applyTempId: [pdfId],
        },
        stuChangeTraintypeDetailVo: {
          ...stuChangeTraintypeDetailVo,
          ...carTypeBody,
        },
      };
    } else {
      // 新增
      baseBody = {
        stuApplyFormTotalVO: {
          ...baseBody['stuApplyFormTotalVO'],
          applyTempId: [pdfId],
        },
        stuChangeTraintypeDetailVo: {
          ...carTypeBody,
        },
      };
    }

    if (newTrainType === oldTrainType) {
      fetchApplicationInfo(baseBody);
    } else {
      const res = await beforeIsReduceCard(sid!, newTrainType!);
      const isContinue = _get(res, 'isContinue');
      if (!isContinue) return;
      const isNeedReduceCard = _get(res, 'isNeedReduceCard');
      if (isNeedReduceCard) {
        const raw = (extra: string | React.ReactNode) => <>学员更换车型，{extra}确认仍要继续吗？</>;
        const extraText = (
          <>
            <span style={{ color: PRIMARY_COLOR }}>{'需再次消耗一张点卡'}</span>
            {'，'}
          </>
        );
        const content = raw(isNeedReduceCard ? extraText : '');
        _showConfirm({
          title: content,
          handleOk: () => {
            fetchApplicationInfo(baseBody);
          },
        });
      } else {
        fetchApplicationInfo(baseBody);
      }
    }
  };

  const handleApplicationDateBeforeSubmit = (body: Body) => {
    let baseBody: Body = JSON.parse(JSON.stringify(body));
    let applicationBody: ApplyDate = {};
    if (!pdfId) {
      return message.error('请上传申请文件');
    }

    const { applydate: newApplyDate } = form.getFieldsValue();
    const { applydate: oldApplyDate } = studentInfo;

    applicationBody = {
      oldApplyDate: formatTime(oldApplyDate, 'NORMAL') as string,
      newApplyDate: formatTime(newApplyDate, 'NORMAL') as string,
    };

    if (isEdit) {
      const stuApplyFormTotalVO = _get(data, ['stuApplyFormTotalVO'], {});
      const stuChangeApplydateDetailVo = _get(data, ['stuChangeApplydateDetailVo'], {});
      // 编辑
      baseBody = {
        stuApplyFormTotalVO: {
          ...stuApplyFormTotalVO,
          applyTempId: [pdfId],
        },
        stuChangeApplydateDetailVo: {
          ...stuChangeApplydateDetailVo,
          ...applicationBody,
        },
      };
    } else {
      // 新增
      baseBody = {
        stuApplyFormTotalVO: {
          ...baseBody['stuApplyFormTotalVO'],
          applyTempId: [pdfId],
        },
        stuChangeApplydateDetailVo: {
          ...applicationBody,
        },
      };
    }

    fetchApplicationInfo(baseBody);
  };

  const fetchApplicationInfo = async (body: Body) => {
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

  const OtherComponent = (type: string) => {
    switch (type) {
      case '4':
        return <CarTypeChange studentInfo={studentInfo} />; // 修改车型
      case '5':
        return (
          <ApplicationDate studentInfo={studentInfo} /> // 修改报名日期
        );
      default:
        return null;
    }
  };

  // 搜索学员的基础信息
  const getStudentInfo = async (id: string) => {
    try {
      setConfirmLoading(true);
      const response = await _getDetails({ id }, { customSchoolId: Auth.get('schoolId') || '' });
      const code = _get(response, 'code');
      const mes = _get(response, 'message');
      if (code === 200) {
        const data: StudentInfo = _get(response, 'data', {});
        const applyType = form.getFieldValue('applyType');
        const carType = _get(data, 'traintype', '');
        const applydate = _get(data, 'applydate', '');
        const sid = _get(data, 'sid', '');
        if (applyType === '4') {
          setStudentInfo({
            carType,
            applydate,
            sid,
          });
          if (carType !== 'C1' && carType !== 'C2') {
            setIsAllowCarTypeChange(true);
          } else {
            setIsAllowCarTypeChange(false);
          }
        } else if (applyType === '5') {
          setStudentInfo({
            carType,
            applydate,
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

  const clearStatus = () => {
    setIsAllowCarTypeChange(false);
  };

  return (
    <Modal
      visible
      title={isReSub ? '重新提交' : isEdit ? '编辑' : '申请监管审核'}
      okText={'提交'}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            handleSubmit(applicationType, values);
          })
          .catch((e) => {
            console.log(e);
          });
      }}
      maskClosable={false}
      confirmLoading={confirmLoading}
    >
      <Spin spinning={isLoading}>
        <Form form={form} wrapperCol={{ span: 8 }} labelCol={{ span: 8 }}>
          {isEdit || isReSub ? (
            <Item label={'学员姓名'}>{_get(baseInfo, 'studentName', '')}</Item>
          ) : (
            <Item label={'学员姓名'} name="sid" rules={[{ required: true }]}>
              <Select
                disabled={isEdit || isReSub}
                placeholder={'请输入学员姓名'}
                showSearch
                allowClear
                filterOption={false}
                options={studentOptions}
                loading={studentSearchLoading}
                onSearch={(value) => {
                  handleStudentSearchMemo(value);
                }}
                onChange={(value: string) => {
                  clearStatus();
                  if (form.getFieldValue('applyType') && value) {
                    getStudentInfo(value);
                  }
                }}
              />
            </Item>
          )}

          {isEdit || isReSub ? (
            <Item label={'证件号码'}>{_get(baseInfo, 'idCard', '')}</Item>
          ) : (
            <Item
              label={'申请类型'}
              required
              style={{
                marginBottom: 0,
              }}
            >
              <Space direction="vertical">
                <Item
                  required
                  name="applyType"
                  rules={[
                    {
                      required: true,
                      message: '请选择申请类型',
                    },
                  ]}
                >
                  <Select
                    disabled={isEdit || isReSub}
                    placeholder={'请选择申请类型'}
                    options={applyOptions}
                    onChange={(value: string) => {
                      clearStatus();
                      if (!form.getFieldValue('sid')) {
                        Promise.resolve().then(() => {
                          form.setFieldsValue({
                            applyType: oldApplicationType.current,
                          });
                        });
                        return message.info('请先选择学员');
                      }
                      if (value) {
                        getStudentInfo(form.getFieldValue('sid'));
                      }

                      setApplicationType(value);
                      oldApplicationType.current = value;
                    }}
                  />
                </Item>
                {isAllowCarTypeChange && (
                  <div style={{ marginTop: -30, marginBottom: -20, color: PRIMARY_COLOR }}>
                    该学员学驾车型不支持更换车型
                  </div>
                )}
              </Space>
            </Item>
          )}

          {OtherComponent(applicationType)}

          {/* 申请文件  */}
          {applicationType && (
            <Item label="申请文件" required wrapperCol={{ span: 12 }}>
              <InlineUploadPdf
                setConfirmLoading={setConfirmLoading}
                imageUrl={pdfUrl}
                setImageUrl={setPdfUrl}
                setImgId={setPdfId}
                title={'预览'}
              />
            </Item>
          )}
        </Form>
      </Spin>
    </Modal>
  );
}
