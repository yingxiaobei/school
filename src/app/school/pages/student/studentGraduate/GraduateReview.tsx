import { useState } from 'react';
import { Modal, Button, message, Row } from 'antd';
import { useFetch, useTablePagination, useHash, useForceUpdate, useOptions, useVisible, useSearch } from 'hooks';
import { _getStudentFace } from './_api';
import { _getStudentList } from 'api';
import { _get, _handleIdCard } from 'utils';
import ReviewResult from './ReviewResult';
import { CustomTable, Search } from 'components';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import Details from '../studentInfo/StudentInfoDetail';

export default function GraduateReview(props: any) {
  const { onCancel, _forceUpdate } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [selectedRow, setSelectedRow] = useState<any>([]);
  const [ignore, forceUpdate] = useForceUpdate();
  const [resultVisible, _switchRVisible] = useVisible();
  const [search, _handleSearch] = useSearch();
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [sid, setSid] = useState('');

  const { isLoading, data } = useFetch({
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      isapply: _get(search, 'isapply'),
      sid: _get(search, 'sid'),
      traintype: _get(search, 'traintype'),
      notapply: '2',
    },
    request: _getStudentFace,
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

  const isApplyStuHAsh = useHash('isapply_stu');

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
      width: 80,
    },
    {
      title: '学员证件号',
      dataIndex: 'idcard',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    { title: '车型', dataIndex: 'traintype', width: 40 },
    { title: '申请人', dataIndex: 'applyname', width: 130 },
    { title: '申请时间', dataIndex: 'createtime', width: 150 },
    { title: '结业证号', dataIndex: 'JYZNUMCODE', width: 130 },
    { title: '核实状态', width: 120, dataIndex: 'isapply', render: (isapply: string) => isApplyStuHAsh[isapply] },
  ];

  return (
    <>
      {resultVisible && (
        <ReviewResult
          onCancel={_switchRVisible}
          selectedRowKeys={selectedRowKeys}
          selectedRow={selectedRow}
          onOk={() => {
            _forceUpdate();
            _switchRVisible();
            forceUpdate();
            setPagination({ ...pagination, total: _get(data, 'total', 0) });
          }}
        />
      )}

      {detailsVisible && <Details onCancel={_switchDetailsVisible} sid={sid} />}

      <Modal
        visible
        width={1100}
        title={'结业审核'}
        maskClosable={false}
        onCancel={onCancel}
        footer={
          <Row justify="end">
            <Button
              type="primary"
              onClick={() => {
                if (selectedRowKeys.length < 1) {
                  message.error('请选中需要审核的记录');
                  return;
                }
                _switchRVisible();
              }}
            >
              确定
            </Button>
          </Row>
        }
      >
        <Search
          loading={isLoading}
          filters={[
            {
              type: 'Select',
              field: 'isapply',
              options: [{ label: '审核状态(全部)', value: '' }, ...useOptions('isapply_stu', false, '-1', ['2'])],
            },
            {
              type: 'SimpleSelectOfStudent',
              field: 'sid',
            },
            {
              type: 'Select',
              field: 'traintype',
              options: [{ value: '', label: '培训车型(全部)' }, ...useOptions('business_scope')],
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
