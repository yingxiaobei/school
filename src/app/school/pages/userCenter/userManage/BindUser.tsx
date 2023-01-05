import { useState } from 'react';
import { _get } from 'utils';
import { Input, Form, Modal } from 'antd';
import { _bindUser } from './_api';
import OrgSelect from '../roleManage/OrgSelect';
import { useRequest } from 'hooks';
import { RULES } from 'constants/rules';

export default function BindUser(props: any) {
  const { visible, onCancel, onOk, currentUserName } = props;
  const [form] = Form.useForm();
  const [selectedId, setSelectedId] = useState([]);
  const { loading: confirmLoading, run } = useRequest(_bindUser, {
    onSuccess: onOk,
  });

  return (
    <Modal
      title={'关联用户'}
      visible={visible}
      maskClosable={false}
      confirmLoading={confirmLoading}
      onOk={() => {
        form.validateFields().then(async (values) => {
          run({
            orgIds: selectedId,
            userName: _get(values, 'userName'),
          });
        });
      }}
      onCancel={onCancel}
    >
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        autoComplete="off"
        initialValues={{
          userName: currentUserName,
        }}
      >
        {
          <Form.Item label="所属组织" name="orgIds" rules={[{ required: true, message: '请选择组织' }]}>
            <OrgSelect
              onChange={(val: any) => {
                let valueArr = val.map((obj: any) => {
                  return obj.value;
                });
                setSelectedId(valueArr);
              }}
            />
          </Form.Item>
        }
        <Form.Item
          label="用户名"
          name="userName"
          rules={[{ whitespace: true, required: true, message: '请输入正确的用户名' }, RULES.USER_NAME]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
