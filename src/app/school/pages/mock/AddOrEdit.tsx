/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { _get } from 'utils';
import { Drawer, Form, Input, Button, Spin } from 'antd';
import { useRequest, useFetch } from 'hooks';
import { _addMock, _updateMock, _getMockDetail } from './_api';

interface IProps {
  visible: boolean;
  onCancel(): void;
  onOk(): void;
  currentId: any;
  isEdit: boolean;
  title: string;
}

export default function AddOrEdit(props: IProps) {
  const [form] = Form.useForm();
  const { visible, onCancel, onOk, title, currentId, isEdit } = props;
  const { loading: confirmLoading, run } = useRequest(isEdit ? _updateMock : _addMock, {
    onSuccess: onOk,
  });

  const { data, isLoading } = useFetch({
    request: _getMockDetail,
    query: { id: currentId },
    depends: [currentId],
    requiredFields: ['id'],
    callback: () => {
      form.resetFields();
    },
  });

  // 编辑模式切换时重置Form表单初始值
  useEffect(() => {
    form.resetFields();
  }, [isEdit]);

  function handleSubmit() {
    form.validateFields().then(async (values) => {
      const query = { title: values.title, author: values.author };
      if (isEdit) {
        Object.assign(query, { id: currentId });
      }
      run(query);
    });
  }

  return (
    <Drawer
      title={title}
      width={400}
      visible={visible}
      onClose={onCancel}
      destroyOnClose
      footerStyle={{ display: 'flex', justifyContent: 'flex-end' }}
      footer={
        <>
          <Button className="mr20" onClick={onCancel}>
            取消
          </Button>
          <Button type="primary" onClick={handleSubmit} disabled={confirmLoading}>
            确定
          </Button>
        </>
      }
    >
      <Spin spinning={confirmLoading || isLoading}>
        <Form
          form={form}
          initialValues={{
            title: isEdit ? _get(data, 'title', '') : '',
            author: isEdit ? _get(data, 'author', '') : '',
          }}
        >
          <Form.Item label="标题" name="title">
            <Input />
          </Form.Item>
          <Form.Item label="作者" name="author">
            <Input />
          </Form.Item>
        </Form>
      </Spin>
    </Drawer>
  );
}
