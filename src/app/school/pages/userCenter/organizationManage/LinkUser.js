import { useState } from 'react';
import { _get } from 'utils';
import { Form, Modal, Select } from 'antd';
import { useFetch } from 'hooks';
import { _getUnbindUsers, _bindUser } from './_api';

const { Option } = Select;

export default function LinkUser(props) {
  const [form] = Form.useForm();
  const { title, onOk, onCancel, currentRecord } = props;
  const [isLoading, setIsLoading] = useState(false);
  const { data } = useFetch({
    request: _getUnbindUsers,
    query: { id: _get(currentRecord, 'id') },
  });
  const options = _get(data, 'rows', []);

  return (
    <Modal
      title={title}
      visible
      confirmLoading={isLoading}
      maskClosable={false}
      onOk={() => {
        form.validateFields().then(async (values) => {
          setIsLoading(true);
          const res = await _bindUser({
            id: _get(currentRecord, 'id'),
            userIds: _get(values, 'userIds'),
          });
          if (_get(res, 'code') === 200) {
            onOk();
          }
          setIsLoading(false);
        });
      }}
      onCancel={onCancel}
    >
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item
          label="选择关联用户"
          name="userIds"
          rules={[
            {
              required: true,
              message: '请选择关联用户的名称!',
            },
          ]}
        >
          <Select
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
            mode="multiple"
            placeholder="请选择关联用户的名称"
          >
            {options.map((x) => (
              <Option key={x.id}>{x.username}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
