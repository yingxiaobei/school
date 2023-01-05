import { useState } from 'react';
import { _get } from 'utils';
import { Form, Input, Modal, Rate, Select } from 'antd';
import { _addEvaluation, _getFinalAssess } from './_api';
import { _getStudentList } from 'api';
import { useFetch, useOptions } from 'hooks';
import { RULES } from 'constants/rules';

interface IProps {
  onCancel(): void;
  onOk(): void;
  isTrainingInstitution?: boolean;
}

export default function Add(props: IProps) {
  const { onCancel, onOk, isTrainingInstitution = false } = props;
  const [btnLoading, setBtnLoading] = useState(false);
  const [studentOptionData, setStudentOptionData] = useState([]);
  const [coachOptionData, setCoachOptionData] = useState([]);
  const [form] = Form.useForm();
  const width = { width: '80%' };
  const [overallVal, setOverallVal] = useState();
  useFetch({
    request: _getFinalAssess, //查询教练员列表-下拉框
    callback: (data) => {
      setCoachOptionData(data);
    },
  });
  const desc = ['一星', '二星', '三星', '四星', '五星'];
  function handleChange(val: any) {
    setOverallVal(val);
  }
  const { Option } = Select;
  const trainPartOptions = useOptions('trans_part_type');
  let title = isTrainingInstitution ? '新增驾校评价信息表信息' : '新增教练员评价信息表信息';

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
            cid: _get(values, 'cid'),
            overall: _get(values, 'overall'),
            part: _get(values, 'part'),
            srvmanner: _get(values, 'srvmanner'),
            teachlevel: _get(values, 'teachlevel'),
            type: isTrainingInstitution ? '2' : '1', //评价对象类型，1:教练员 2:培训机构
          };

          let customHeader = isTrainingInstitution
            ? {
                menuId: 'trainingInstitutionEvaluation',
                elementId: 'trainingInstitution/trainingInstitutionEvaluation:btn1',
              }
            : { menuId: 'coachEvaluation', elementId: 'coach/coachEvaluation:btn1' };
          setBtnLoading(true);
          const res = await _addEvaluation(query, customHeader);
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
                {x.name + x.idcard}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {!isTrainingInstitution && ( //培训机构页面不显示
          <Form.Item label="教练姓名" name="cid" rules={[{ required: true, message: '请输入教练姓名' }]}>
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
        <Form.Item label="总体满意度" name="overall" rules={[{ required: true, message: '请评价' }]}>
          <Rate
            style={width}
            tooltips={desc}
            onChange={(val) => {
              handleChange(val);
            }}
            value={overallVal}
          />
        </Form.Item>
        <Form.Item label="培训部分" name="part" rules={[{ required: true, message: '请选择培训部分' }]}>
          <Select style={width} placeholder="请选择培训部分" options={trainPartOptions} />
        </Form.Item>
        <Form.Item label="评价用语列表" name="srvmanner" rules={[RULES.EVALUATION]}>
          <Input.TextArea style={width} />
        </Form.Item>

        <Form.Item label="个性化评价" name="teachlevel" rules={[RULES.EVALUATION]}>
          <Input.TextArea style={width} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
