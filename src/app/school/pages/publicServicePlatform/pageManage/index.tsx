import { Switch } from 'antd';
import { useState } from 'react';
import { CustomTable, Search } from 'components';
import { useHash, useOptions, useTablePro, useRequest, useConfirm, useFetch } from 'hooks';
import { _get } from 'utils';
import { _getPageList, _delete, _updateByKey } from './_api';
import AddOrEdit from './AddOrEdit';
import { AuthButton, PopoverImg } from 'components';
import { _getSearchList } from '../templateManage/_api';

export default function PageManage() {
  const portalSubjectTypeHash = useHash('portal_subject_type'); // 资讯类型
  // const portalSubjectTypeOptions_old = useOptions('portal_subject_type'); // 资讯类型
  const [_showDeleteConfirm] = useConfirm();
  const {
    search,
    _handleSearch,
    tableProps,
    _refreshTable,
    isEdit,
    setIsEdit,
    currentId,
    setCurrentId,
    currentRecord,
    setCurrentRecord,
    isAddOrEditVisible,
    _switchIsAddOrEditVisible,
    _handleOk,
    _handleAdd,
  } = useTablePro({
    request: _getPageList,
    initialSearch: {},
  });

  const { loading, run } = useRequest(_delete, {
    onSuccess: () => {
      _refreshTable();
    },
  });
  const [portalSubjectTypeOptions, setPortalSubjectTypeOptions] = useState<any>([]);

  useFetch({
    request: _getSearchList,
    query: { type: 'home_page' },
    callback(data: any) {
      console.log(data);
      const arr = (data || []).map((item: any) => {
        return { label: item.name, value: item.itemId };
      });
      setPortalSubjectTypeOptions(arr);
    },
  });
  function getHash(options: []) {
    const hash = options.reduce((acc: any, x: IOption) => Object.assign(acc, { [x.value]: x.label }), {});
    return hash;
  }
  const columns = [
    {
      title: '栏目名称',
      dataIndex: 'type',
      // render: (type: string) => portalSubjectTypeHash[type],
      render: (type: string) => getHash(portalSubjectTypeOptions)[type],
    },
    {
      title: '标题',
      ellipsis: true,
      dataIndex: 'title',
    },
    {
      title: '图片',
      dataIndex: 'img',
      width: 250,
      render: (img: object) => {
        return <PopoverImg src={_get(img, 'fileUrl')} imgStyle={{ height: 90, width: 200 }} />;
      },
    },
    {
      title: '跳转地址',
      ellipsis: true,
      dataIndex: 'url',
    },
    {
      title: '排序值',
      dataIndex: 'seq',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string, record: object) => {
        return (
          <Switch
            checked={status === '1'}
            onChange={async (checked) => {
              setCurrentRecord(record);
              await _updateByKey({ ...record, status: checked ? '1' : '0' });
              _refreshTable();
            }}
          />
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId="publicServicePlatform/pageManage:btn2"
            onClick={() => {
              _switchIsAddOrEditVisible();
              setIsEdit(true);
              setCurrentId(_get(record, 'id', ''));
            }}
            className="operation-button"
          >
            编辑
          </AuthButton>
          <AuthButton
            authId="publicServicePlatform/pageManage:btn3"
            onClick={() => {
              setCurrentRecord(record);
              _showDeleteConfirm({
                handleOk: () => {
                  run({ id: _get(record, 'id') });
                },
              });
            }}
            loading={_get(currentRecord, 'id') === _get(record, 'id') && loading}
            className="operation-button"
          >
            删除
          </AuthButton>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* 新增、编辑 */}
      {isAddOrEditVisible && (
        <AddOrEdit
          onCancel={_switchIsAddOrEditVisible}
          isEdit={isEdit}
          currentId={currentId as string | undefined}
          onOk={_handleOk}
        />
      )}

      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'Select',
            field: 'type',
            options: [{ label: '栏目名称(全部)', value: '' }, ...portalSubjectTypeOptions],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          _refreshTable();
        }}
      />

      <AuthButton authId="publicServicePlatform/pageManage:btn1" onClick={_handleAdd} className="mb20" type="primary">
        新增
      </AuthButton>

      <CustomTable columns={columns} {...tableProps} rowKey="id" scroll={{ x: 1500, y: 400 }} />
    </>
  );
}
