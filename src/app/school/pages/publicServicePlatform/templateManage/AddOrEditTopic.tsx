//新增编辑栏目
import { useEffect, useState } from 'react';
import { _get } from 'utils';
import { Drawer, Form, Input, Button, Spin, message } from 'antd';
import { useRequest, useFetch, useForceUpdate } from 'hooks';
import { _addTopic, _updateTopic } from './_api';
import OrgSelect from './OrgSelect';

interface IProps {
  visible: boolean;
  onCancel(): void;
  onOk(): void;
  currentId: any;
  currentRecord: any;
  isEdit: boolean;
  title: string;
  selectedId?: any;
}

export default function AddOrEdit(props: IProps) {
  const [form] = Form.useForm();
  const { visible, onCancel, onOk, title, currentId, isEdit = false, currentRecord, selectedId } = props;
  const { loading: confirmLoading, run } = useRequest(isEdit ? _updateTopic : _addTopic, {
    onSuccess: onOk,
  });
  const [selectedLabel, setSelectedLabel] = useState('');
  const [selectedOrgIds, setSelectedOrgIds] = useState('');
  const [loading, setLoading] = useState(true);
  // 编辑模式切换时重置Form表单初始值
  useEffect(() => {
    setLoading(false);
  }, [currentRecord]);
  function handleSubmit() {
    form.validateFields().then(async (values) => {
      const query = {
        name: values.name,
        superId: selectedOrgIds ? selectedOrgIds : '-1',
        superName: selectedLabel ? selectedLabel : _get(currentRecord, 'parentName', ''),
      };
      if (isEdit) {
        Object.assign(query, { id: _get(currentRecord, 'id') });
      }
      run(query);
    });
  }
  return (
    <Drawer
      title={title}
      width={800}
      visible={visible}
      onClose={onCancel}
      destroyOnClose
      maskClosable={false}
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
      <Spin spinning={confirmLoading || loading}>
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 10 }}
          form={form}
          key={_get(currentRecord, 'id', '')}
          autoComplete="off"
          initialValues={{
            name: isEdit ? _get(currentRecord, 'name', '') : '',
          }}
        >
          <Form.Item label="栏目名称" name="name" rules={[{ required: true, message: '栏目名称不能为空' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="上级栏目">
            <OrgSelect
              callbackFun={() => {
                if (isEdit) {
                  const superId = _get(currentRecord, 'superId', '');
                  return setSelectedOrgIds(superId === '-1' ? '' : superId);
                }
                console.log(selectedId);
                selectedId && setSelectedOrgIds(selectedId);
              }}
              onChange={(val: any) => {
                if (isEdit && _get(currentRecord, 'id', '') === _get(val, 'value', '')) {
                  message.info('请勿选择当前栏目作为上级栏目');
                  return;
                }
                setSelectedOrgIds(_get(val, 'value', ''));
                setSelectedLabel(_get(val, 'label', ''));
              }}
              value={selectedOrgIds}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Drawer>
  );
}
