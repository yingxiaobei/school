import { useState } from 'react';
import { Modal, Row, Button } from 'antd';
import { useFetch, useTablePagination, useSearch, useHash, useForceUpdate, useVisible } from 'hooks';
import { _getStudentInfo } from './_api';
import { _getStudentList } from 'api';
import { _get, _handleIdCard } from 'utils';
import { CustomTable, Search } from 'components';
import Reason from './Reason';

function ApplyDropped(props: any) {
  const { onCancel, onOk } = props;
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [ignore, forceUpdate] = useForceUpdate();
  const [visible, _switchVisible] = useVisible();

  // FIXME:wy
  const { isLoading, data } = useFetch<any>({
    request: _getStudentInfo,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      // status: '01',  去掉不传
      sid: _get(search, 'sid'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      setSelectedRowKeys([_get(data, 'rows.0.sid')]);
    },
  });

  const cardTypeHash = useHash('gd_card_type'); // 证件类型
  const stuStatusHash = useHash('stu_drivetrain_status'); // 学员状态

  const columns = [
    {
      title: '学号',
      dataIndex: 'stunum',
    },
    {
      title: '学员姓名',
      dataIndex: 'name',
    },
    {
      title: '证件类型',
      dataIndex: 'cardtype',
      render: (cardtype: any) => cardTypeHash[cardtype],
    },
    {
      title: '证件号码',
      dataIndex: 'idcard',
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '报名日期',
      dataIndex: 'applydate',
    },
    {
      title: '学员状态',
      dataIndex: 'status',
      render: (status: any) => stuStatusHash[status],
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any) => {
      setSelectedRowKeys(selectedRowKeys);
    },
    selectedRowKeys,
  };

  return (
    <>
      {visible && (
        <Reason
          onCancel={_switchVisible}
          onOk={() => {
            _switchVisible();
            onOk();
          }}
          selectedRowKeys={selectedRowKeys}
        />
      )}

      <Modal visible width={1100} title={'退学申请'} maskClosable={false} onCancel={onCancel} footer={null}>
        <Search
          loading={isLoading}
          filters={[
            {
              type: 'SimpleSelectOfStudent',
              field: 'sid',
            },
          ]}
          search={search}
          _handleSearch={_handleSearch}
          refreshTable={() => {
            setPagination({ ...pagination, current: 1 });
            forceUpdate();
          }}
          simpleStudentRequest={_getStudentList}
        />

        <CustomTable
          columns={columns}
          loading={isLoading}
          bordered
          rowSelection={{
            type: 'radio',
            ...rowSelection,
          }}
          dataSource={_get(data, 'rows', [])}
          rowKey={(record: any) => _get(record, 'sid')}
          scroll={{ y: 280 }}
          pagination={tablePagination}
        />

        <Row justify="end">
          <Button onClick={onCancel} className="mr20">
            取消
          </Button>
          <Button type="primary" onClick={_switchVisible}>
            退学
          </Button>
        </Row>
      </Modal>
    </>
  );
}

export default ApplyDropped;
