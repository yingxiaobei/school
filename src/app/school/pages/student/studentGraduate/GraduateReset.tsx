import { useState } from 'react';
import { Modal, message } from 'antd';
import { useFetch, useTablePagination, useForceUpdate, useVisible, useSearch } from 'hooks';
import { _getPageListResetStuStageApply, _auditResetGraduates } from './_api';
import { _getStudentList } from 'api';
import { _get, _handleIdCard } from 'utils';
import { CustomTable, Search } from 'components';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import Details from '../studentInfo/StudentInfoDetail';

export default function GraduateReset(props: any) {
  const { onCancel, onOk } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [, setSelectedRow] = useState<any>([]);
  const [ignore, forceUpdate] = useForceUpdate();
  const [search, _handleSearch] = useSearch();
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [sid, setSid] = useState('');

  const { isLoading, data } = useFetch({
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      sid: _get(search, 'sid'),
      equalStatus: '01,03',
      subject: '9',
    },
    request: _getPageListResetStuStageApply,
    depends: [pagination.current, pagination.pageSize, ignore],
    callback: (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });
  const reviewData = _get(data, 'rows', []);

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRow: any) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRow(selectedRow);
    },
    selectedRowKeys,
  };

  const columns = [
    {
      title: '学员姓名',
      dataIndex: 'name',
      render: (name: string, record: any) => {
        return (
          <div
            className="pointer"
            style={{ color: PRIMARY_COLOR }}
            onClick={() => {
              _switchDetailsVisible();
              setSid(_get(record, 'sid'));
            }}
          >
            {name}
          </div>
        );
      },
    },
    { title: '学员证件号', dataIndex: 'idcard', render: (value: any, record: any) => _handleIdCard({ value, record }) },
    { title: '车型', dataIndex: 'traintype' },
  ];

  return (
    <>
      {detailsVisible && <Details onCancel={_switchDetailsVisible} sid={sid} />}

      <Modal
        visible
        width={1100}
        title={'重置结业'}
        maskClosable={false}
        onCancel={onCancel}
        onOk={async () => {
          if (selectedRowKeys.length < 1) {
            message.error('请选中需要审核的记录');
            return;
          }
          console.log('selectedRowKeys', selectedRowKeys);
          const res = await _auditResetGraduates({ saidList: selectedRowKeys });
          if (_get(res, 'code') === 200) {
            onOk();
          } else {
            message.error(_get(res, 'message', ''));
          }
        }}
      >
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
            type: 'checkbox',
            ...rowSelection,
          }}
          dataSource={reviewData}
          rowKey="said"
          pagination={tablePagination}
        />
      </Modal>
    </>
  );
}
