import { useState } from 'react';
import { Button } from 'antd';
import { _get } from 'utils';
import { useFetch, useTablePagination, useForceUpdate, useConfirm, useVisible } from 'hooks';
import { _getDetect, _deleteDetect } from '../_api';
import AddOrEditDetect from './AddOrEditDetect';
import { CustomTable, Loading } from 'components';

function Detect(props: any) {
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [_showDeleteConfirm] = useConfirm();
  const [visible, _switchVisible] = useVisible();
  const [isEdit, setIsEdit] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const columns = [
    {
      title: '检测时间',
      dataIndex: 'detectdate',
    },
    {
      //  TODO: 11-10 镇江
      title: '检测到期时间',
      dataIndex: 'detectexpiredate',
    },
    {
      title: '操作人',
      dataIndex: 'updateuserid',
    },
    {
      title: '创建日期',
      dataIndex: 'createtime',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          {/* 编辑按钮 */}
          {/* <Button onClick={() => _handleEdit(record)} className="operation-button" type="primary" ghost size="small">
            编辑
          </Button> */}
          <Button
            onClick={() =>
              _showDeleteConfirm({
                handleOk: async () => {
                  const res = await _deleteDetect({ id: _get(record, 'id') });
                  if (_get(res, 'code') === 200) {
                    setPagination({ ...pagination, current: 1 });
                    forceUpdate();
                  }
                },
              })
            }
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  function _handleEdit(record: any) {
    _switchVisible();
    setIsEdit(true);
    setCurrentRecord(record);
  }

  function _handleAdd() {
    _switchVisible();
    setIsEdit(false);
    setCurrentRecord(null);
  }

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  // FIXME:wy
  const { data, isLoading } = useFetch<any>({
    request: _getDetect,
    query: { carid: props.carid, page: pagination.current, limit: pagination.pageSize },
    requiredFields: ['carid'],
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      {visible && (
        <AddOrEditDetect
          currentRecord={currentRecord}
          onCancel={_switchVisible}
          onOk={_handleOk}
          isEdit={isEdit}
          title={isEdit ? '编辑检测记录' : '新增检测记录'}
          carid={props.carid}
        />
      )}

      <Button type="primary" className="mb20" onClick={() => _handleAdd()}>
        新增
      </Button>

      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record: any) => _get(record, 'id')}
        pagination={tablePagination}
      />
    </div>
  );
}

export default Detect;
