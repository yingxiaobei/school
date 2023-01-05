//新增编辑栏目
import { useEffect, useState } from 'react';
import { _get } from 'utils';
import { Drawer, Form, Input, Button, Spin, Select, Row } from 'antd';
import { useRequest, useFetch, useForceUpdate, useOptions } from 'hooks';
import { _addTopic, _updateTopic, _getMockDetail, _addItemConfig, _editItemConfig } from './_api';
import { ItemCol } from 'components';
import OrgSelect from './OrgSelect';
import { RULES } from 'constants/rules';

interface IProps {
  visible: boolean;
  onCancel(): void;
  onOk(): void;
  currentId: any;
  isEdit: boolean;
  title: string;
  currentRecord?: any;
}

export default function AddTemCfg(props: IProps) {
  const [form] = Form.useForm();
  const [ignore, forceUpdate] = useForceUpdate();
  const pageSiteOptions = useOptions('page_site');
  const itemTypeOptions = useOptions('item_type');
  const showTypeOptions = useOptions('show_type');
  const { visible, onCancel, onOk, title, currentId, isEdit, currentRecord } = props;
  const [selectedLabel, setSelectedLabel] = useState('');
  const [selectedOrgIds, setSelectedOrgIds] = useState('');
  const { loading: confirmLoading, run } = useRequest(_editItemConfig, {
    onSuccess: onOk,
  });

  function handleSubmit() {
    form.validateFields().then(async (values) => {
      const query = {
        name: selectedLabel,
        itemId: selectedOrgIds,
        type: values.type,
        site: values.site,
        serialNumber: values.serialNumber,
        showType: values.showType,
      };

      Object.assign(query, { id: _get(currentRecord, 'id', '') });

      run(query);
    });
  }

  return (
    <Drawer
      title={title}
      width={800}
      key={ignore}
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
      <Spin spinning={confirmLoading}>
        <Form
          form={form}
          initialValues={{
            name: _get(currentRecord, 'name', ''),
            type: _get(currentRecord, 'type', ''),
            site: _get(currentRecord, 'site', ''),
            showType: _get(currentRecord, 'showType', ''),
            serialNumber: String(_get(currentRecord, 'serialNumber', '')),
          }}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <ItemCol label="上级栏目">
            <OrgSelect
              callbackFun={() => {
                setSelectedOrgIds(_get(currentRecord, 'itemId', ''));
                setSelectedLabel(_get(currentRecord, 'name', ''));
              }}
              onChange={(val: any) => {
                setSelectedOrgIds(val.value);
                setSelectedLabel(val.label);
              }}
              value={selectedOrgIds}
            />
          </ItemCol>
          <ItemCol label={'栏目分类'} name="type" rules={[{ whitespace: true, required: true }]}>
            <Select placeholder={'栏目分类'} options={itemTypeOptions} />
          </ItemCol>
          <ItemCol label={'页面位置'} name="site" rules={[{ whitespace: true, required: true }]}>
            <Select placeholder={'页面位置'} options={pageSiteOptions} />
          </ItemCol>
          <ItemCol label={'页面类型'} name="showType" rules={[{ whitespace: true, required: true }]}>
            <Select placeholder={'页面类型'} options={showTypeOptions} />
          </ItemCol>
          <ItemCol label={'排序'} name="serialNumber" rules={[{ whitespace: true, required: true }, RULES.SCORE]}>
            <Input placeholder={'排序'} />
          </ItemCol>
        </Form>
      </Spin>
    </Drawer>
  );
}
