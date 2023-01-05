import { useState } from 'react';
import { Button } from 'antd';
import { _get } from 'utils';
import { useFetch, useTablePagination, useForceUpdate, useConfirm, useVisible } from 'hooks';
import { _getProtect, _deleteProtect } from '../_api';
import AddOrEditProtect from './AddOrEditProtect';
import moment from 'moment';
import { CustomTable } from 'components';

function Protect(props: any) {
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [_showDeleteConfirm] = useConfirm();
  const [visible, _switchVisible] = useVisible();
  const [isEdit, setIsEdit] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const columns = [
    {
      title: '维护开始时间',
      dataIndex: 'starttime',
      render: (starttime: any) => moment(starttime).format('YYYY-MM-DD'),
    },
    {
      title: '维护到期时间',
      dataIndex: 'endtime',
      render: (endtime: any) => moment(endtime).format('YYYY-MM-DD'),
    },
    {
      title: '操作人',
      dataIndex: 'createuserid',
    },
    {
      title: '创建日期',
      dataIndex: 'createtime',
      render: (createtime: any) => moment(createtime).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <Button onClick={() => _handleEdit(record)} className="operation-button" type="primary" ghost size="small">
            编辑
          </Button>
          <Button
            onClick={() =>
              _showDeleteConfirm({
                handleOk: async () => {
                  const res = await _deleteProtect({ id: _get(record, 'id') });
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
    request: _getProtect,
    query: { carid: props.carid, page: pagination.current, limit: pagination.pageSize },
    requiredFields: ['carid'],
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  return (
    <div>
      {visible && (
        <AddOrEditProtect
          currentRecord={currentRecord}
          onCancel={_switchVisible}
          onOk={_handleOk}
          isEdit={isEdit}
          title={isEdit ? '编辑二级维护' : '新增二级维护'}
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
export default Protect;
