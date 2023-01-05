import { Button } from 'antd';
import { _get } from 'utils';
import { CustomTable, Search } from 'components';
import { _getList, _deleteMock } from './_api';
import { useRequest, useTablePro, useConfirm } from 'hooks';
import AddOrEdit from './AddOrEdit';

export default function Mock() {
  const [_showDeleteConfirm] = useConfirm();
  const {
    tableProps,
    search,
    _refreshTable,
    currentRecord,
    _handleSearch,
    _handleAdd,
    isEdit,
    _handleEdit,
    currentId,
    isAddOrEditVisible,
    _switchIsAddOrEditVisible,
    _handleOk,
  } = useTablePro({
    request: _getList,
  });

  const { loading: deleteLoading, run } = useRequest(_deleteMock, {
    onSuccess: _refreshTable,
  });

  const columns = [
    { title: '标题', dataIndex: 'title' },
    { title: '作者', dataIndex: 'author' },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <>
          <Button
            onClick={() => _handleEdit(record, _get(record, 'id', ''))}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            编辑
          </Button>
          <Button
            loading={_get(currentRecord, 'id') === _get(record, 'id') && deleteLoading}
            onClick={() => {
              _showDeleteConfirm({
                handleOk: () => {
                  run({ id: _get(record, 'id') });
                },
              });
            }}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" className="mr20 mb20" onClick={_handleAdd}>
        新增
      </Button>

      <Search
        loading={tableProps.loading}
        filters={[
          { type: 'Input', field: 'title', placeholder: '教练姓名' },
          { type: 'Input', field: 'author', placeholder: '证件号码' },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
      />

      <CustomTable {...tableProps} columns={columns} rowKey="id" />

      <AddOrEdit
        title="新增"
        isEdit={isEdit}
        visible={isAddOrEditVisible}
        onCancel={_switchIsAddOrEditVisible}
        onOk={_handleOk}
        currentId={currentId}
      />
    </>
  );
}
