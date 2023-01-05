import { _get } from 'utils';
import { Input, Form, Modal } from 'antd';
import { _addOrganization, _editOrganization } from './_api';
import { RULES } from 'constants/rules';
import { useRequest } from 'hooks';

export default function Add(props) {
  const [form] = Form.useForm();
  const { title, onOk, onCancel, currentRecord, isEdit } = props;

  const { loading: confirmLoading, run } = useRequest(isEdit ? _editOrganization : _addOrganization, {
    onSuccess: onOk,
  });

  return (
    <Modal
      title={title}
      visible
      maskClosable={false}
      confirmLoading={confirmLoading}
      onOk={async () => {
        form.validateFields().then(async (values) => {
          const query = {
            parentId: _get(currentRecord, 'parentId'),
            orgName: _get(values, 'orgName'),
            orgCode: _get(values, 'orgCode'),
          };
          run(isEdit ? { ...query, id: _get(currentRecord, 'id') } : query);
        });
      }}
      onCancel={onCancel}
    >
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={{
          orgName: _get(currentRecord, 'label'),
          orgCode: _get(currentRecord, 'orgCode'),
        }}
      >
        <Form.Item
          label="组织名称"
          name="orgName"
          rules={[
            {
              required: true,
              whitespace: true,
              message: '请输入组织名称!',
            },
            RULES.ORG_NAME,
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="组织编码"
          name="orgCode"
          rules={[
            {
              required: true,
              whitespace: true,
              message: '请输入组织编码!',
            },
            RULES.ORG_CODE,
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
