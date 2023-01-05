import { useState } from 'react';
import { Form, Input, Modal, Select } from 'antd';
import { _addComplaints, _getFinalAssess } from './_api';
import { _getStudentList } from 'api';
import { useFetch } from 'hooks';
import { Auth, _get } from 'utils';
import { RULES } from 'constants/rules';

interface IProps {
  onCancel(): void;
  onOk(): void;
  isTrainingInstitution: boolean;
}

export default function Add(props: IProps) {
  const { onCancel, onOk, isTrainingInstitution } = props;
  const [btnLoading, setBtnLoading] = useState(false);
  const [studentOptionData, setStudentOptionData] = useState([]);
  const [coachOptionData, setCoachOptionData] = useState([]);
  const [form] = Form.useForm();
  const width = { width: '80%' };
  useFetch({
    request: _getFinalAssess,
    callback: (data) => {
      setCoachOptionData(data);
    },
  });
  useFetch({
    request: _getStudentList,
    callback: (data) => {
      setStudentOptionData(data);
    },
  });

  const { Option } = Select;

  let title = isTrainingInstitution ? '新增驾校投诉信息表信息' : '新增教练员投诉信息表信息';

  return (
    <Modal
      visible
      width={600}
      title={title}
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={btnLoading}
      onOk={() => {
        form.validateFields().then(async (values) => {
          const query = {
            sid: _get(values, 'sid'),
            type: isTrainingInstitution ? '2' : '1', //投诉对象类型，1:教练员 2:培训机构
            content: _get(values, 'content'),
            depaopinion: _get(values, 'depaopinion'),
            objectnum: isTrainingInstitution ? Auth.get('schoolId') : _get(values, 'objectnum'), //投诉对象ID，教练员或培训机构ID
            schopinion: _get(values, 'schopinion'),
          };
          let customHeader = isTrainingInstitution
            ? {
                menuId: 'trainingInstitutionComplaints',
                elementId: 'trainingInstitution/trainingInstitutionComplaints:btn1',
              }
            : { menuId: 'coachComplaints', elementId: 'coach/coachComplaints:btn1' };
          setBtnLoading(true);
          const res = await _addComplaints(query, customHeader);
          if (_get(res, 'code') === 200) {
            onOk();
          }
          setBtnLoading(false);
        });
      }}
    >
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item label="评价人" name="sid" rules={[{ required: true, message: '请输入评价人' }]}>
          <Select
            style={width}
            placeholder="请选择评价人"
            showSearch
            filterOption={false}
            onSearch={(value) => {
              const query = { name: value };
              _getStudentList(query).then((res: any) => {
                setStudentOptionData(_get(res, 'data.rows', []));
              });
            }}
          >
            {studentOptionData.map((x: any, index: number) => (
              <Option key={index} value={x.sid}>
                {x.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {!isTrainingInstitution && ( //培训机构页面不显示
          <Form.Item label="教练姓名" name="objectnum" rules={[{ required: true, message: '请输入教练姓名' }]}>
            <Select
              style={width}
              placeholder="请选择教练"
              showSearch
              filterOption={false}
              onSearch={(value) => {
                const query = { coachname: value };
                _getFinalAssess(query).then((res: any) => {
                  setCoachOptionData(_get(res, 'data', []));
                });
              }}
            >
              {coachOptionData.map((x: any, index: number) => (
                <Option key={index} value={x.cid}>
                  {x.coachname}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
        <Form.Item
          label="投诉内容"
          name="content"
          rules={[{ whitespace: true, required: true, message: '请输入投诉内容' }, RULES.EVALUATION]}
        >
          <Input.TextArea style={width} />
        </Form.Item>
        <Form.Item
          label="部门意见"
          name="depaopinion"
          rules={[{ whitespace: true, required: true, message: '请输入部门意见' }, RULES.EVALUATION]}
        >
          <Input.TextArea style={width} />
        </Form.Item>
        <Form.Item
          label="驾校意见"
          name="schopinion"
          rules={[{ whitespace: true, required: true, message: '请输入驾校意见' }, RULES.EVALUATION]}
        >
          <Input.TextArea style={width} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
