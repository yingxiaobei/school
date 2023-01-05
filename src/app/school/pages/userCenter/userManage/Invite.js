import { useState } from 'react';
import { _get } from 'utils';
import { Input, Modal, Select, Button } from 'antd';
import { _addUser, _getSearchUserList } from './_api';
import { useFetch, useForceUpdate } from 'hooks';
import { CustomTable } from 'components';
import { _handlePhone } from 'utils';

const { Option } = Select;

export default function Invite(props) {
  const { title, onOk, onCancel } = props;
  const [searchType, setSearchType] = useState('username');
  const [searchValue, setSearchValue] = useState(null);
  const [ignore, forceUpdate] = useForceUpdate();
  const [dataSource, setDataSource] = useState([]);

  useFetch({
    request: _getSearchUserList,
    query: {
      key: searchType,
      value: searchValue,
    },
    requiredFields: ['value'],
    depends: [ignore],
    callback: (data) => {
      if (data) {
        if (!dataSource.find((x) => x.id === data.id)) {
          dataSource.push(data);
          setDataSource([...dataSource]);
        }
      }
    },
  });

  function _handleDelete(id) {
    const temp = dataSource.filter((x) => x.id !== id);
    setDataSource(temp);
  }

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '手机号',
      dataIndex: 'mobilePhone',
      render: (value) => _handlePhone(value),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_, record) => (
        <div>
          <Button
            onClick={() => {
              _handleDelete(_get(record, 'id'));
            }}
            style={{ marginRight: 8, marginBottom: 4, fontSize: 12 }}
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

  return (
    <Modal
      title={title}
      visible
      width={650}
      maskClosable={false}
      onOk={async () => {
        const res = await _addUser({
          type: '2',
          userIds: dataSource.map((x) => x.id).join(','),
        });

        if (_get(res, 'code') === 200) {
          onOk();
        }
      }}
      onCancel={onCancel}
    >
      <div style={{ display: 'flex', marginBottom: 20 }}>
        <Select
          getPopupContainer={(triggerNode) => triggerNode.parentNode}
          value={searchType}
          onChange={(value) => setSearchType(value)}
        >
          <Option value="username">用户名</Option>
          <Option value="mobilePhone">手机号</Option>
        </Select>

        <Input
          placeholder="请输入关键字"
          style={{ width: 180, marginLeft: 20, marginRight: 20 }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

        <Button onClick={() => forceUpdate()} type="primary">
          搜索并添加到列表
        </Button>
      </div>

      <CustomTable
        columns={columns}
        bordered
        dataSource={dataSource}
        rowKey={(record) => _get(record, 'id')}
        pagination={false}
      />
    </Modal>
  );
}
