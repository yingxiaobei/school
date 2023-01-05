import { _get } from 'utils';
import { Modal, Form, DatePicker, message } from 'antd';
import { _addDetect, _updateDetect } from '../_api';
import moment from 'moment';

export default function AddOrEditDetect(props: any) {
  const { onCancel, onOk, currentRecord, isEdit, title, carid } = props;
  const [form] = Form.useForm();
  const config = {
    rules: [{ type: 'object' as const, required: true }],
  };

  return (
    <Modal
      visible
      title={title}
      maskClosable={false}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then(async (values) => {
          if (moment(_get(values, 'detectdate')).diff(_get(values, 'detectexpiredate'), 'day') >= 0) {
            return message.error('检测到期时间需要大于检测时间');
          }
          const query = {
            carid,
            detectdate: moment(_get(values, 'detectdate')).format('YYYY-MM-DD'),
            // TODO: 11-10 镇江
            detectexpiredate: moment(_get(values, 'detectexpiredate')).format('YYYY-MM-DD'),
          };
          const res = isEdit
            ? await _updateDetect({ ...query, id: _get(currentRecord, 'id') })
            : await _addDetect(query);
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
          detectdate: _get(currentRecord, 'detectdate') ? moment(_get(currentRecord, 'detectdate')) : null,
          detectexpiredate: _get(currentRecord, 'detectexpiredate')
            ? moment(_get(currentRecord, 'detectexpiredate'))
            : null,
        }}
      >
        <Form.Item label="检测时间" name="detectdate" {...config}>
          <DatePicker allowClear={false} />
        </Form.Item>

        {/* 11-10 镇江 */}
        <Form.Item label="检测到期时间" name="detectexpiredate" {...config}>
          <DatePicker allowClear={false} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
