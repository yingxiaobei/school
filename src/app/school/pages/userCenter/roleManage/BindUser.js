import { useState } from 'react';
import { isEmpty } from 'lodash';
import { useFetch, usePagination, useForceUpdate, useRequest } from 'hooks';
import { Input, Modal, Button } from 'antd';
import { _getUnbindUsers, _bindUser } from './_api';
import { _get, _handlePhone } from 'utils';
import { CustomTable } from 'components';

export default function BindUser(props) {
  const { title, onCancel, id } = props;
  const [ignore, forceUpdate] = useForceUpdate();
  const [pagination, setPagination] = usePagination();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [search, setSearch] = useState({ name: '', username: '', mobilePhone: '' });
  const [currentRecord, setCurrentRecord] = useState(null);

  const { data, isLoading } = useFetch({
    request: _getUnbindUsers,
    query: {
      id,
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      name: _get(search, 'name', ''),
      username: _get(search, 'username', ''),
      mobilePhone: _get(search, 'mobilePhone', ''),
    },
    depends: [ignore, pagination.current, pagination.pageSize, search],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 1) });
    },
  });
  const dataSource = _get(data, 'rows', []);

  const rowSelection = {
    selectedRowKeys,
    onChange: _onSelectChange,
  };

  function _onSelectChange(selectedRowKeys) {
    setSelectedRowKeys(selectedRowKeys);
  }

  function _handleSearch(key, e) {
    setSearch({ ...search, [key]: e.target.value });
    setPagination({ ...pagination, current: 1 });
  }
  const { loading: confirmLoading, run } = useRequest(_bindUser, {
    onSuccess: () => {
      setSelectedRowKeys([]);
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });
  const { loading: btnLoading, run: btnRun } = useRequest(_bindUser, {
    onSuccess: () => {
      setSelectedRowKeys([]);
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '手机号',
      dataIndex: 'mobilePhone',
      render: (value) => _handlePhone(value),
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_, record) => (
        <div>
          <Button
            loading={_get(currentRecord, 'id') === _get(record, 'id') && btnLoading}
            type="primary"
            ghost
            onClick={async () => {
              setCurrentRecord(record);
              btnRun({ id, userIds: [_get(record, 'id')] });
            }}
          >
            关联用户
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Modal width={800} title={title} footer={null} visible onCancel={onCancel}>
      <Button
        loading={confirmLoading}
        type="primary"
        className="mb20"
        onClick={async () => {
          run({ id, userIds: selectedRowKeys });
        }}
        disabled={isEmpty(selectedRowKeys)}
      >
        关联用户
      </Button>
      <div>
        <Input
          onChange={(e) => _handleSearch('name', e)}
          value={_get(search, 'name')}
          placeholder="姓名"
          style={{ margin: '0 20px 20px 0', width: 180 }}
        />
        <Input
          onChange={(e) => _handleSearch('username', e)}
          value={_get(search, 'username')}
          placeholder="用户名"
          style={{ margin: '0 20px 20px 0', width: 180 }}
        />
        <Input
          onChange={(e) => _handleSearch('mobilePhone', e)}
          value={_get(search, 'mobilePhone')}
          placeholder="手机号"
          style={{ margin: '0 20px 20px 0', width: 180 }}
        />
      </div>

      <CustomTable
        columns={columns}
        rowSelection={rowSelection}
        bordered
        dataSource={dataSource}
        loading={isLoading}
        rowKey={(record) => record.id}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          ...pagination,
          onShowSizeChange: (_, pageSize) => {
            setPagination({ ...pagination, current: 1, pageSize });
          },
          onChange: (page) => {
            setPagination((pagination) => ({ ...pagination, current: page }));
          },
        }}
      />
    </Modal>
  );
}
