//新增编辑模板
import { useState, useEffect } from 'react';
import { _get } from 'utils';
import { Drawer, Form, Input, Button, Spin } from 'antd';
import { useRequest, useVisible, useTablePro, useOptions, useHash, useConfirm } from 'hooks';
import { _addTemplate, _updateTemplate, _getTplConfigList, _deleteItemConfig, _deleteLogUrl } from './_api';
import Address from '../../student/studentInfo/Address';
import { CustomTable, ItemCol, Search, Title, UploadPro } from 'components';
import AddTemCfg from './AddTemCfg';
import EditTemCfg from './EditTemCfg';

interface IProps {
  visible: boolean;
  onCancel(): void;
  onOk(): void;
  currentId: any;
  currentRecord: any;
  isEdit: boolean;
  title: string;
}

export default function AddOrEdit(props: IProps) {
  const { visible, onCancel, onOk, title, currentId, isEdit, currentRecord } = props;

  const [_showDeleteConfirm] = useConfirm();
  const [form] = Form.useForm();
  const [cityCode, setCityCode] = useState(_get(currentRecord, 'cityCode', ''));
  const [isAddCfgVisible, _switchIsAddCfgVisible] = useVisible();
  const [isEditCfgVisible, _switchIsEditCfgVisible] = useVisible();
  const [imageUrl, setImageUrl] = useState('');
  const [head_img_oss_id, setImgId] = useState('');
  const {
    tableProps: tplConfigTableProps,
    search: tplConfigSearch,
    _refreshTable: _tplConfigRefreshTable,
    currentRecord: tplConfigCurrentRecord,
    _handleSearch: _handleTplConfigSearch,
    _handleAdd: _handleTplConfigAdd,
    isEdit: isTplConfigEdit,
    _handleEdit: _handelTplConfigEdit,
    currentId: tplConfigCurrentId,
    isAddOrEditVisible: isTplConfigAddOrEditVisible,
    _switchIsAddOrEditVisible: _switchTplConfigAddOrEditVisible,
    _handleOk: _handleTplConfigOk,
    setCurrentRecord,
  } = useTablePro({
    request: _getTplConfigList,
    initialSearch: {
      site: [],
    },
  });
  const { loading: confirmLoading, run } = useRequest(isEdit ? _updateTemplate : _addTemplate, {
    onSuccess: onOk,
  });
  const { loading: deleteLoading, run: deleteRun } = useRequest(_deleteItemConfig, {
    onSuccess: _tplConfigRefreshTable,
  });
  useEffect(() => {
    setImageUrl(_get(currentRecord, 'showUrl', ''));
  }, [currentRecord]);
  const { loading: deleteImgLoading, run: deleteImgrun } = useRequest(_deleteLogUrl, {
    onSuccess: () => {
      setImageUrl('');
      setImgId('');
      _tplConfigRefreshTable();
    },
  });
  useEffect(() => {
    _tplConfigRefreshTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pageSiteHash = useHash('page_site');
  const itemTypeHash = useHash('item_type');
  const showTypeHash = useHash('show_type');
  const columns: any = [
    { title: '栏目名称', dataIndex: 'name', ellipsis: true },
    { title: '栏目分类', dataIndex: 'type', render: (type: any) => itemTypeHash[type] },
    { title: '页面位置', dataIndex: 'site', render: (site: any) => pageSiteHash[site] },
    { title: '页面类型', dataIndex: 'showType', render: (site: any) => showTypeHash[site] },
    { title: '排序', dataIndex: 'serialNumber' },
    {
      title: '操作',
      dataIndex: '_',
      render(_: void, record: any) {
        return (
          <>
            <Button
              className="operation-button"
              type="primary"
              ghost
              size="small"
              onClick={() => {
                _switchIsEditCfgVisible();
                setCurrentRecord(record);
              }}
            >
              编辑
            </Button>
            <Button
              className="operation-button"
              type="primary"
              ghost
              size="small"
              loading={_get(currentRecord, 'id') === _get(record, 'id') && deleteLoading}
              onClick={() => {
                deleteRun({ id: record.id });
              }}
            >
              删除
            </Button>
          </>
        );
      },
    },
  ];
  function handleSubmit() {
    form.validateFields().then(async (values) => {
      const query = {
        name: values.name,
        cityCode,
        provinceCode: cityCode.slice(0, 2) + '0000',
        tempId: head_img_oss_id,
      };
      if (isEdit) {
        Object.assign(query, { id: currentId });
      }
      run(query);
    });
  }

  return (
    <Drawer
      title={title}
      width={1000}
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
      {isAddCfgVisible && (
        <AddTemCfg
          title={'新增模板配置'}
          isEdit={false}
          key={Math.random()}
          // visible={isAddCfgVisible}
          onCancel={_switchIsAddCfgVisible}
          onOk={() => {
            _switchIsAddCfgVisible();
            _tplConfigRefreshTable();
          }}
          currentId={currentId}
          currentRecord={tplConfigCurrentRecord}
        />
      )}
      <EditTemCfg
        title={'编辑模板配置'}
        isEdit={false}
        key={Math.random()}
        visible={isEditCfgVisible}
        onCancel={_switchIsEditCfgVisible}
        onOk={() => {
          _switchIsEditCfgVisible();
          _tplConfigRefreshTable();
        }}
        currentId={currentId}
        currentRecord={tplConfigCurrentRecord}
      />
      <Spin spinning={confirmLoading}>
        <Form
          form={form}
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 18 }}
          initialValues={{
            name: isEdit ? _get(currentRecord, 'name', '') : '',
          }}
        >
          <Form.Item label="平台名称" name="name" rules={[{ required: true, message: '平台名称不能为空' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="适用地区">
            <Address cityCode={cityCode} setCityCode={setCityCode} />
          </Form.Item>
          <Form.Item label="平台logo">
            <UploadPro imageUrl={imageUrl} setImageUrl={setImageUrl} setImgId={setImgId} />
            {(head_img_oss_id !== '' || imageUrl !== '') && (
              <Button
                loading={deleteImgLoading}
                onClick={() => {
                  _showDeleteConfirm({
                    handleOk: () => {
                      deleteImgrun({ id: _get(currentRecord, 'id') });
                    },
                    title: '确定要删除这张图片吗？',
                  });
                  setImgId('');
                  setImageUrl('');
                }}
                className="mr20 "
              >
                删除
              </Button>
            )}
            <span>请选择报图片文件，仅限png/jpg文件，最大10MB</span>
          </Form.Item>
          <Title>模板配置</Title>
          <Search
            loading={tplConfigTableProps.loading}
            filters={[
              {
                type: 'Select',
                field: 'site',
                options: [...useOptions('page_site')],
                otherProps: {
                  placeholder: '页面位置(全部)',
                  mode: 'multiple',
                  allowClear: true,
                  defaultValue: [],
                },
              },
            ]}
            search={tplConfigSearch}
            _handleSearch={_handleTplConfigSearch}
            refreshTable={_tplConfigRefreshTable}
          />

          <Button type="primary" className="ml20" onClick={_switchIsAddCfgVisible}>
            增加
          </Button>
          <CustomTable columns={columns} {...tplConfigTableProps} rowKey="id" className="mt20" />
        </Form>
      </Spin>
    </Drawer>
  );
}
