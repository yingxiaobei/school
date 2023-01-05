import { _get } from 'utils';
import { Modal, Form, Input, DatePicker, Select } from 'antd';
import { _addTechnologyRate, _updateTechnologyRate } from '../_api';
import moment from 'moment';
import { useOptions } from 'hooks';

export default function AddTechnologyRate(props: any) {
  const { onCancel, onOk, currentRecord, isEdit, title, carid } = props;
  const [form] = Form.useForm();

  const techlevel_typeOptions = useOptions('techlevel_type'); // 技术等级

  return (
    <Modal
      visible
      width={600}
      title={title}
      maskClosable={false}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then(async (values) => {
          const query = {
            techlevelcode: _get(values, 'techlevelcode'),
            techlevel: _get(values, 'techlevel'),
            auditdate: moment(_get(values, 'auditdate')).format('YYYY-MM-DD'),
            auditenddate: moment(_get(values, 'auditenddate')).format('YYYY-MM-DD'),
            auditdept: _get(values, 'auditdept'),
            carid,
          };
          const res = isEdit
            ? await _updateTechnologyRate({ ...query, id: _get(currentRecord, 'id') })
            : await _addTechnologyRate(query);
          if (_get(res, 'code') === 200) {
            onOk();
          }
        });
      }}
    >
      <Form
        form={form}
        autoComplete="off"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={{
          techlevelcode: _get(currentRecord, 'techlevelcode'),
          techlevel: _get(currentRecord, 'techlevel'),
          auditdate: moment(_get(currentRecord, 'auditdate')),
          auditenddate: moment(_get(currentRecord, 'auditenddate')),
          auditdept: _get(currentRecord, 'auditdept'),
        }}
      >
        <Form.Item
          label="技术等级证书编号"
          name="techlevelcode"
          rules={[{ whitespace: true, required: true, message: '技术等级证书编号不能为空' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="技术等级" name="techlevel">
          <Select options={techlevel_typeOptions} />
        </Form.Item>
        <Form.Item label="评定时间" name="auditdate" rules={[{ required: true, message: '评定时间不能为空' }]}>
          <DatePicker allowClear={false} />
        </Form.Item>
        <Form.Item label="评定单位" name="auditdept">
          <Input />
        </Form.Item>
        <Form.Item label="评定到期时间" name="auditenddate">
          <DatePicker allowClear={false} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
