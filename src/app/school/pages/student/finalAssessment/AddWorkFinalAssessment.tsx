import { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Upload, message } from 'antd';
import { useFetch, useOptions, useRequest } from 'hooks';
import {
  _addFinalAssess,
  _getCoaList,
  _editFinalAssess,
  _getFinalAssessDetail,
  _isExamcertOutputsNeedFile,
  _getStuNetStudyTestRecordVOBySid,
} from './_api';
import { _getStudentList } from 'api';
import moment from 'moment';
import { RULES } from 'constants/rules';
import { UploadOutlined } from '@ant-design/icons';
import { Auth, previewPdf, _get, imgToPdf, base64ConvertFile } from 'utils';
import { USER_CENTER_URL } from 'constants/env';
import { debounce, isEmpty } from 'lodash';
// TODO:
// import { LabeledValue } from '_antd@4.15.0@antd/lib/select';

const { Option } = Select;
interface AddWorkFinalAssessmentProps {
  onCancel: () => void;
  onOk: () => void;
  currentId?: string;
  isEdit: boolean;
  paramValue: string;
  currentRecord: any;
}
export default function AddWorkFinalAssessment({
  onCancel,
  onOk,
  currentId,
  isEdit,
  paramValue,
}: AddWorkFinalAssessmentProps) {
  const [form] = Form.useForm();
  const [student, setStudent] = useState({});
  const [appraise, setAppraise] = useState({});
  const [studentOptionData, setStudentOptionData] = useState([]);
  const examResultOptionsOnly = useOptions('appraisalresult_type', false, '-1', ['0']);
  const examResultOptions = useOptions('appraisalresult_type'); // 考核结果
  const [fileid, setFileid] = useState();
  const [imageUrl, setImageUrl] = useState('');
  const [isUpLoadLoading, setIsUpLoadLoading] = useState(false);
  const [coaOptionData, setCoaOptionData] = useState([]);
  const [studentValue, setStudentValue] = useState(undefined as any | any[] | undefined);

  const studentShow = isEdit || paramValue === '1'; // 当编辑或者自定义参数为1的时候，学员信息只能单选

  // 考核员数据
  useFetch({
    request: _getCoaList,
    callback: (data) => {
      setCoaOptionData(data.rows);
    },
  });

  useEffect(() => {
    if (paramValue !== '1') {
      return;
    }
    if (!isEmpty(student)) {
      const aa = async () => {
        const res = await _getStuNetStudyTestRecordVOBySid({
          courseType: '2',
          stuid: studentShow ? _get(student, 'stuids', '') : _get(student, 'stuids', []).join(','),
          subjectcode: '5',
        });
        form.setFieldsValue({ appraisalresult: String(_get(res, 'data.appraisalresult', '0')) }); // appraisalresult:0 不合格 默认不合格
        form.setFieldsValue({ achievement: String(_get(res, 'data.achievement', '0')) });
      };
      aa();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);

  // 根据id获取详情
  const { data, isLoading } = useFetch({
    request: _getFinalAssessDetail,
    query: { id: currentId },
    depends: ['id'],
    requiredFields: ['id'],
    callback: async (data) => {
      setStudent({ studentnames: _get(data, 'studentname', ''), stuids: _get(data, 'stuid', '') });
      setAppraise({ appraisername: _get(data, 'appraisername', ''), appraiserid: _get(data, 'appraiserid', '') });

      // 学员姓名下拉数据默认初始值 // status:01'学驾中' 此处始终获取学驾中的学员
      const res = await _getStudentList({ name: _get(data, 'studentname', ''), status: '01' });
      if (_get(res, 'code') === 200) {
        setStudentOptionData(_get(res, 'data.rows', []));
        setStudentValue(
          studentShow
            ? {
                value: _get(data, 'stuid', ''),
                label: `${_get(res, 'data.rows.0.name', '')}-${_get(res, 'data.rows.0.idcard', '')} `,
              }
            : undefined,
        );
      }
    },
  });

  function _changeStudent(students: any) {
    let studentnames: any = [];
    let stuids: any = [];
    if (studentShow) {
      setStudent({ studentnames: students.label, stuids: students.value });
    } else {
      for (let item of students) {
        studentnames.push(item.label.split('-')[0]); //label中包含name-身份证号，传参只需要name
        stuids.push(item.value);
      }
      setStudent({ studentnames, stuids });
    }
  }

  function _changeAppraise(appraise: any) {
    setAppraise({ appraisername: appraise.label, appraiserid: appraise.value });
  }

  const { loading: confirmLoading, run } = useRequest(isEdit ? _editFinalAssess : _addFinalAssess, {
    onSuccess: onOk,
  });

  // 考核成绩单是否要上传
  const { data: isExamFile } = useFetch({
    request: _isExamcertOutputsNeedFile,
  });

  const simpleFetchOptions = (value: string) => {
    const trimValue = value.trim();
    if (_get(trimValue, 'length', 0) < 2) return;
    const isIdCard = /\d/.test(trimValue);
    const query = isIdCard ? { idcard: trimValue } : { name: trimValue };
    // status:01'学驾中' 此处始终获取学驾中的学员
    _getStudentList({ ...query, status: '01' }, {}, true).then((res: any) => {
      setStudentOptionData(_get(res, 'data.rows', []));
    });
  };

  const simpleFetchOptionsDebounce = debounce(simpleFetchOptions, 600);

  return (
    <>
      {isLoading && null}
      {!isLoading && (
        <>
          <Form
            form={form}
            autoComplete="off"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{
              appraisaltime: moment(_get(data, 'appraisaltime')),
              appraisername: { key: _get(data, 'appraiserid', ''), label: _get(data, 'appraisername', '') },
              appraisalresult: '1',
              achievement: isEdit ? String(_get(data, 'achievement', '')) : '90',
            }}
          >
            <Form.Item label="考核时间" name="appraisaltime" rules={[{ required: true, message: '考核时间不能为空' }]}>
              <DatePicker
                allowClear={false}
                disabledDate={(current: any): any => {
                  return current >= moment().subtract(0, 'days');
                }}
                disabled={isEdit && paramValue === '1'}
              />
            </Form.Item>

            <Form.Item label="学员姓名" required>
              <Select
                showSearch
                disabled={isEdit}
                mode={studentShow ? undefined : 'multiple'}
                value={studentValue}
                placeholder={'学员姓名/证件号码'}
                labelInValue
                filterOption={false}
                onSearch={(value) => {
                  simpleFetchOptionsDebounce(value);
                }}
                onChange={_changeStudent}
              >
                {studentOptionData.map((x: any, index: number) => (
                  <Option key={index} value={x.sid}>
                    {x.name + '-' + x.idcard}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              required
              label="考核员"
              name="appraisername"
              rules={[
                {
                  validator: (rule, value, callback) => {
                    if (!value.label || !value.key) {
                      callback('考核员不能为空');
                    }
                    callback();
                  },
                },
              ]}
            >
              <Select
                labelInValue
                onChange={_changeAppraise}
                filterOption={false}
                showSearch
                onSearch={(value) => {
                  const query = { coachname: value }; //显示已备案的考核员数据。
                  _getCoaList(query).then((res: any) => {
                    setCoaOptionData(_get(res, 'data.rows', []));
                  });
                }}
              >
                {coaOptionData.map((item: any) => {
                  return (
                    <Option key={item.cid} value={item.cid}>
                      {item.coachname}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item label="考核科目">从业资格</Form.Item>

            <Form.Item
              label="考核结果"
              name="appraisalresult"
              rules={[{ required: true, message: '考核结果不能为空' }]}
            >
              {/* NOTE: 下拉框 默认合格 不可选*/}
              <Select
                options={paramValue !== '1' ? examResultOptionsOnly : examResultOptions}
                disabled={paramValue === '1'}
              />
            </Form.Item>

            <Form.Item
              label="考核成绩"
              name="achievement"
              rules={[{ whitespace: true, required: true, message: '考核成绩不能为空' }, RULES.SCORE]}
            >
              <Input disabled={paramValue === '1'} />
            </Form.Item>
            {isExamFile && (
              <Form.Item label="考试成绩单" required>
                <Upload
                  name={'file'}
                  accept=".pdf,image/png, image/jpeg"
                  beforeUpload={(file, fileList) => {
                    const isAlowed =
                      file.type !== 'application/pdf' && file.type !== 'image/png' && file.type !== 'image/jpeg';
                    if (isAlowed) {
                      message.error(`文件类型为${file.type},不符合上传规则`);
                      return false || Upload.LIST_IGNORE;
                    }
                    if (file.type === 'application/pdf') {
                      return file;
                    }
                    return new Promise((resolve) => {
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = () => {
                        const img = document.createElement('img') as any;
                        img.src = reader.result;
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          canvas.width = img.naturalWidth;
                          canvas.height = img.naturalHeight;
                          const ctx = canvas.getContext('2d') as any;
                          ctx.drawImage(img, 0, 0);
                          resolve(base64ConvertFile(imgToPdf(canvas), '考试成绩单'));
                        };
                      };
                    });
                  }}
                  action={USER_CENTER_URL + '/api/video-face/tmpFile/upload'}
                  headers={{
                    token: String(Auth.get('token')),
                    Authorization: 'bearer' + Auth.get('token'),
                    username: String(Auth.get('username')),
                    schoolId: String(Auth.get('schoolId')),
                  }}
                  showUploadList={false}
                  maxCount={1}
                  onChange={(info: any) => {
                    if (info.file.status === 'uploading') {
                      setIsUpLoadLoading(true);
                    }
                    if (info.file.status === 'done') {
                      setIsUpLoadLoading(false);
                      message.success(`${info.file.name} 文件上传成功`);
                      setImageUrl(_get(info, 'file.response.data.url', ''));
                      setFileid(_get(info, 'file.response.data.id', ''));
                    } else if (info.file.status === 'error') {
                      message.error(`${info.file.name} 文件上传失败`);
                    }
                    if (info.file.status === 'error') {
                      message.error('上传失败');
                      setIsUpLoadLoading(false);
                    }
                  }}
                >
                  {isEdit && _get(data, 'fileurl') ? (
                    <>
                      <Button loading={isUpLoadLoading} icon={<UploadOutlined />}>
                        重新上传
                      </Button>
                    </>
                  ) : (
                    <Button loading={isUpLoadLoading} icon={<UploadOutlined />}>
                      上传文件
                    </Button>
                  )}
                </Upload>
                {/**fileid：本地上传拿到的fileid，本地上传后展示文件名称，接口返回的信息没有文件名称，展示默认名称：考试成绩单 */}
                {isEdit && _get(data, 'fileurl') && !fileid && (
                  <div
                    className="mt10 pointer"
                    onClick={() => {
                      previewPdf(_get(data, 'fileurl'), false);
                    }}
                  >
                    考试成绩单
                  </div>
                )}
                {imageUrl && (
                  <div className="mt10">
                    <span
                      className="pointer"
                      onClick={() => {
                        previewPdf(imageUrl, false);
                        // window.open();
                      }}
                    >
                      考试成绩单
                    </span>
                  </div>
                )}
              </Form.Item>
            )}
          </Form>
          <div className="text-center mt20">
            <Button
              className="mr20"
              type="primary"
              loading={confirmLoading}
              onClick={() => {
                form.validateFields().then(async (values) => {
                  if (!isEdit && !fileid && isExamFile) {
                    message.error('请上传考试成绩单');
                    return;
                  }
                  if (_get(student, 'stuids', '').length === 0) {
                    message.error('请选择学员');
                    return;
                  }
                  const query = {
                    appraisaltime: moment(_get(values, 'appraisaltime')).format('YYYY-MM-DD'),
                    appraiserid: _get(appraise, 'appraiserid'),
                    subjectcode: '5',
                    appraisername: _get(appraise, 'appraisername'),
                    // appraisalresult: '1',
                    appraisalresult: form.getFieldValue('appraisalresult'),
                    achievement: parseInt(_get(values, 'achievement')),
                    traincode: '1', // yapi中没定义的，属于bug。后端做了限制，后续要修正。作废的。实际不用传，但表结构设计了有这个字段
                    fileid,
                  };
                  let studentId = studentShow ? _get(student, 'stuids', '') : _get(student, 'stuids', []).join(',');
                  let studentName = studentShow
                    ? _get(student, 'studentnames', '').split('-')[0]
                    : _get(student, 'studentnames', []).join(',');
                  const queryFinal = isEdit
                    ? {
                        ...query,
                        id: currentId,
                        stuid: studentId,
                        studentname: studentName,
                      }
                    : {
                        ...query,
                        stuids: studentId,
                        studentnames: studentName,
                      };
                  run(queryFinal);
                });
              }}
            >
              确定
            </Button>
            <Button onClick={onCancel}>取消</Button>
          </div>
        </>
      )}
    </>
  );
}
