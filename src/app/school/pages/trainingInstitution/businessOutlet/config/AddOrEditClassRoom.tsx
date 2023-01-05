import { Modal, Form, Input, Radio, message } from 'antd';
import { _updateClassRoom, _addClassRoom } from '../_api';
import { _get } from 'utils';
import { useRequest } from 'hooks';
import { RULES } from 'constants/rules';

export default function AddOrEditClassRoom(props: any) {
  const { onCancel, currentRecord, isEdit, title, onOk, sbnid } = props;
  const [form] = Form.useForm();

  const { loading: confirmLoading, run } = useRequest(isEdit ? _updateClassRoom : _addClassRoom, {
    onSuccess: onOk,
  });

  return (
    <Modal
      visible
      title={title}
      confirmLoading={confirmLoading}
      maskClosable={false}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then(async (values) => {
          const query = {
            sbnid,
            classroom: _get(values, 'classroom'),
            seatnum: _get(values, 'seatnum'),
            traincode: _get(values, 'traincode').toString(),
            remark: _get(values, 'remark'),
          };
          run(isEdit ? { ...query, classid: _get(currentRecord, 'classid') } : query);
        });
      }}
    >
      <Form
        form={form}
        autoComplete="off"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={{
          classroom: _get(currentRecord, 'classroom', ''),
          seatnum: String(_get(currentRecord, 'seatnum', '')),
          traincode: _get(currentRecord, 'traincode') ? _get(currentRecord, 'traincode') : '',
          remark: _get(currentRecord, 'remark', ''),
        }}
      >
        <Form.Item label="教室号" name="classroom" rules={[{ whitespace: true, required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="座位数" name="seatnum" rules={[{ whitespace: true, required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="可培训类型" name="traincode" rules={[{ required: true, message: '请选择可培训类型' }]}>
          <Radio.Group>
            <Radio value={'3'}>模拟</Radio>
            <Radio value={'2'}>理论</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="备注" name="remark" rules={[RULES.MEMO]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
