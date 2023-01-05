import { Drawer, Button } from 'antd';
import { _getClassList } from './_api';
import { useHash, useTablePro } from 'hooks';
import { CustomTable, Search } from 'components';
import AddOrEditClass from './AddOrEditClass';
import { _get } from 'utils';

interface Iprops {
  onCancel(): void;
}

export default function ClassManage(props: Iprops) {
  const { onCancel } = props;
  const {
    tableProps,
    search,
    _refreshTable,
    _handleSearch,
    currentId,
    isEdit,
    _handleAdd,
    _handleEdit,
    isAddOrEditVisible,
    _switchIsAddOrEditVisible,
    _handleOk,
  } = useTablePro({
    request: _getClassList,
  });

  const isEffectiveTypeHash = useHash('is_effective_type'); // 是否有效

  const columns = [
    {
      title: '班次',
      dataIndex: 'classFrequency',
    },
    {
      title: '开班名称',
      dataIndex: 'className',
    },
    {
      title: '开班日期',
      dataIndex: 'startDate',
    },
    {
      title: '总人数',
      dataIndex: 'totalNum',
    },
    {
      title: '审核通过人数',
      dataIndex: 'approvedNum',
    },
    {
      title: '未审核人数',
      dataIndex: 'notReviewedNum',
    },
    {
      title: '是否有效',
      dataIndex: 'isEffective',
      render: (isEffective: string) => isEffectiveTypeHash[isEffective],
    },
    {
      title: '备注',
      dataIndex: 'memo',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: object) =>
        _get(record, 'notReviewedNum', '') === 0 &&
        _get(record, 'approvedNum', '') === 0 && (
          <Button
            type="ghost"
            size="small"
            onClick={() => {
              _handleEdit(record, _get(record, 'classId', ''));
            }}
          >
            编辑
          </Button>
        ),
    },
  ];

  return (
    <Drawer destroyOnClose visible width={800} title={'班次管理'} onClose={onCancel} footer={null}>
      {isAddOrEditVisible && (
        <AddOrEditClass
          onCancel={_switchIsAddOrEditVisible}
          onOk={_handleOk}
          isEdit={isEdit}
          currentId={currentId as string}
        />
      )}
      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'Input',
            field: 'className',
            placeholder: '开班名称',
          },
          {
            type: 'DatePicker',
            field: 'startDate',
            placeholder: '开班日期',
            otherProps: {
              allowClear: true,
            },
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
      />
      <Button type="primary" className="mb20" onClick={_handleAdd}>
        新增
      </Button>
      <CustomTable {...tableProps} columns={columns} rowKey="classId" />
    </Drawer>
  );
}
