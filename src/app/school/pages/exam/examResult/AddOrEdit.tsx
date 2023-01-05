import { useState } from 'react';
import { Modal, Form, Input, DatePicker, Row, Button, Col, Select } from 'antd';
import { _addExam } from './_api';
import { _getStudentList } from 'api';
import { _get } from 'utils';
import moment from 'moment';
import ChoosePerson from './ChoosePerson';
import { useVisible, useOptions } from 'hooks';

interface IProps {
  onCancel(): void;
  onOk(): void;
}

export default function AddOrEdit(props: IProps) {
  const { onCancel, onOk } = props;
  const [form] = Form.useForm();
  const [idCard, setIdCard] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [visible, _switchVisible] = useVisible();

  const studentInfo = [
    { label: '姓名', value: _get(studentData, 'name', '') },
    { label: '账号', value: _get(studentData, 'phone', '') },
    { label: '驾照类型', value: _get(studentData, 'traintype', '') },
    {
      label: '报名日期',
      value: _get(studentData, 'applydate') ? moment(_get(studentData, 'applydate')).format('YYYY-MM-DD') : '',
    },
  ];

  const statistic_exam_resultOptionData = useOptions('statistic_exam_result'); // 考试成绩

  return (
    <>
      {visible && <ChoosePerson onCancel={_switchVisible} studentList={studentList} setStudentData={setStudentData} />}

      <Modal
        visible
        title={'新增考试'}
        maskClosable={false}
        onCancel={onCancel}
        onOk={() => {
          form.validateFields().then(async (values) => {
            const res = await _addExam({
              testDate: moment(_get(values, 'testDate')).format('YYYY-MM-DD'),
              idNumber: idCard,
              studentName: _get(studentData, 'name'),
              testSubject: _get(values, 'testSubject'),
              testCarModel: _get(studentData, 'traintype', ''),
              testResult: _get(values, 'testResult'),
            });
            if (_get(res, 'code') === 200) {
              onOk();
            }
          });
        }}
      >
        <Form form={form} autoComplete="off" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
          <Row style={{ marginBottom: 20, textAlign: 'center' }} justify="center">
            <Input
              style={{ width: 240 }}
              placeholder="请输入五位以上证件号"
              onChange={(e) => {
                setIdCard(e.target.value);
              }}
            />
            <Button
              type="primary"
              className="ml20"
              onClick={async () => {
                const res = await _getStudentList({ idcard: idCard });
                const length = _get(res, 'data.rows', []).length;
                if (length === 1) {
                  setStudentData(_get(res, 'data.rows.0'));
                }
                if (length > 1) {
                  _switchVisible();
                  setStudentList(_get(res, 'data.rows'));
                }
              }}
            >
              搜索
            </Button>
          </Row>
          {studentData && (
            <Row style={{ width: 320, marginLeft: 75 }}>
              {studentInfo.map((x: IOption, index: number) => {
                return (
                  <Col key={index} span={12} className="mb20">
                    {x.label}:{x.value}
                  </Col>
                );
              })}
            </Row>
          )}
          <Form.Item label="考试科目" name="testSubject" rules={[{ required: true, message: '请选择考试科目' }]}>
            {/* TODO 暂时写死 */}
            <Select
              options={[
                { value: '科目二', label: '科目二' },
                { value: '科目三', label: '科目三' },
              ]}
            />
          </Form.Item>
          <Form.Item label="考试日期" name="testDate" rules={[{ required: true, message: '请选择考试日期' }]}>
            <DatePicker
              style={{ width: 240 }}
              // TODO: TS
              disabledDate={(current: any): boolean => {
                return current.diff(moment(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'days')) > 0;
              }}
            />
          </Form.Item>
          <Form.Item label="考试成绩" name="testResult" rules={[{ required: true, message: '请选择考试成绩' }]}>
            <Select options={statistic_exam_resultOptionData} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
