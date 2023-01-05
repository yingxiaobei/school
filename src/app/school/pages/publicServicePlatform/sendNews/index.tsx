import { Switch } from 'antd';
import { useState } from 'react';
import { _getCoachList, _getSearchText, _getStudentList } from 'api';
import { ButtonContainer, CustomTable, Search } from 'components';
import { useTablePro, useVisible, useRequest, useConfirm, useFetch } from 'hooks';
import { _get } from 'utils';
import { _getPageList, _delete, _portalArticleTop, _getListByType } from './_api';
import AddOrEdit from './AddOrEdit';
import { AuthButton } from 'components';
import Preview from './Preview';
import { _getSearchList } from '../templateManage/_api';

export default function SendNews() {
  const [previewVisible, _setPreviewVisible] = useVisible(); // 预览弹框是否展示

  const [portalSubjectTypeOptions, setPortalSubjectTypeOptions] = useState<any>([]);

  // const portalArticleTypeHash = useHash('portal_article_type'); // 资讯类型
  // const portalArticleTypeOptions = useOptions('portal_article_type'); // 资讯类型
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
    initialSearch: {
      isHomepageQuery: '0', // 是否首页查询 0：否 1：是
    },
  });

  const { loading, run } = useRequest(_delete, {
    onSuccess: () => {
      _refreshTable();
    },
  });
  const { data: listData = [] } = useFetch({
    request: _getListByType,
  });
  const portalArticleTypeHash = listData
    .map((x: any) => {
      return { label: x.categoryValue, value: x.categoryKey };
    })
    .reduce((acc: any, x: IOption) => Object.assign(acc, { [x.value]: x.label }), {});
  const portalArticleTypeOptions = listData.map((x: any) => {
    return { label: x.categoryValue, value: x.categoryKey };
  });
  const { loading: topLoading, run: topRun } = useRequest(_portalArticleTop, {
    onSuccess: _refreshTable,
  });
  useFetch({
    request: _getSearchList,
    query: { type: 'information' },
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
      // render: (type: string) => portalArticleTypeHash[type],
      render: (type: string) => getHash(portalSubjectTypeOptions)[type],
    },
    {
      title: '标题',
      ellipsis: true,
      dataIndex: 'title',
    },
    {
      title: '置顶状态',
      dataIndex: 'isTop',
      render: (isTop: string, record: any) => {
        return (
          <Switch
            checked={isTop == '1'}
            onChange={async (checked) => {
              setCurrentRecord(record);
              topRun({
                id: _get(record, 'id'),
                type: _get(record, 'type'),
                isTop: checked ? '1' : '0',
              });
            }}
          />
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
    },
    {
      title: '创建者',
      dataIndex: 'creator',
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId="publicServicePlatform/sendNews:btn2"
            onClick={() => {
              setCurrentRecord(record);
              _setPreviewVisible();
            }}
            className="operation-button"
          >
            预览
          </AuthButton>
          <AuthButton
            authId="publicServicePlatform/sendNews:btn3"
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
            authId="publicServicePlatform/sendNews:btn4"
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

      {/* 预览 */}
      {previewVisible && <Preview richtextContent={_get(currentRecord, 'content')} onCancel={_setPreviewVisible} />}

      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'Select',
            field: 'type',
            options: [{ label: '栏目名称(全部)', value: '' }, ...portalSubjectTypeOptions],
          },
          {
            type: 'RangePicker',
            field: ['publishTimeStart', 'publishTimeEnd'],
            placeholder: ['发布时间起', '发布时间止'],
            otherProps: { allowClear: true },
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          _refreshTable();
        }}
        showSearchButton={false}
      />
      <ButtonContainer loading={tableProps.loading} showSearchButton={true} refreshTable={_refreshTable}>
        <AuthButton
          authId="publicServicePlatform/sendNews:btn1"
          onClick={() => {
            _handleAdd();
          }}
          className="mb20"
          type="primary"
        >
          发布信息
        </AuthButton>
      </ButtonContainer>

      <CustomTable columns={columns} {...tableProps} rowKey="id" />
    </>
  );
}
