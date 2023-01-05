// 学员人脸模板审核
import { useState } from 'react';
import { useSearch, useTablePagination, useFetch, useForceUpdate, useHash, useVisible } from 'hooks';
import { _getStudentFace, _cancelTemp } from './_api';
import { AuthButton, CustomTable, Search } from 'components';
import { _get, _handleIdCard } from 'utils';
import Details from './Details';
import Review from './Review';

function StudentFace() {
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [visible, _switchVisible] = useVisible();
  const [reviewVisible, _switchReviewVisible] = useVisible();
  const [currentId, setCurrentId] = useState();

  const stuStatusHash = useHash('stu_drivetrain_status'); // 学员状态
  const statusHash = useHash('status'); // 审核状态
  const checkflagHash = useHash('pass_notpass_type'); // 自动审核-人工审核-学员人脸模板审核

  const columns = [
    { title: '姓名', dataIndex: 'name', width: 80 },
    {
      title: '证件号码',
      dataIndex: 'idcard',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    { title: '学员状态', dataIndex: 'stustatus', width: 80, render: (stustatus: any) => stuStatusHash[stustatus] },
    { title: '上传时间', dataIndex: 'create_date', width: 160 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 60,
      render: (status: any) => statusHash[status],
    },
    {
      title: '自动审核',
      width: 80,
      dataIndex: 'autocheckflag',
      render: (autocheckflag: any) => checkflagHash[autocheckflag],
    },
    {
      title: '人工审核',
      width: 80,
      dataIndex: 'handcheckflag',
      render: (handcheckflag: any) => checkflagHash[handcheckflag],
    },
    { title: '备注', width: 100, dataIndex: 'memo' },
    { title: '操作人', width: 100, dataIndex: 'updateoptor' },
    { title: '操作时间', dataIndex: 'update_date', width: 160 },
    {
      title: '操作',
      dataIndex: 'operate',
      width: 160,
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId="student/studentFace:btn1"
            onClick={() => {
              _switchVisible();
              setCurrentId(_get(record, 'sid'));
            }}
            className="operation-button"
          >
            查看模板
          </AuthButton>
          {_get(record, 'handcheckflag') === '0' && (
            <AuthButton
              authId="student/studentFace:btn2"
              onClick={() => {
                _switchReviewVisible();
                setCurrentId(_get(record, 'sid'));
              }}
              className="operation-button"
            >
              审核
            </AuthButton>
          )}
          <AuthButton
            authId="student/studentFace:btn3"
            onClick={async () => {
              const res = await _cancelTemp({ sid: _get(record, 'sid') });
              if (_get(res, 'code') === 200) {
                forceUpdate();
              }
            }}
            className="operation-button"
          >
            作废
          </AuthButton>
        </div>
      ),
    },
  ];

  const { isLoading, data } = useFetch({
    request: _getStudentFace,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      create_date_start: _get(search, 'create_date_start'),
      create_date_end: _get(search, 'create_date_end'),
      idcard: _get(search, 'idcard'),
      name: _get(search, 'name'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  function _handleOk() {
    _switchReviewVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  return (
    <>
      {visible && <Details currentId={currentId} onCancel={_switchVisible} />}

      {reviewVisible && <Review currentId={currentId} onCancel={_switchReviewVisible} onOk={_handleOk} />}

      <Search
        loading={isLoading}
        filters={[
          {
            type: 'RangePicker',
            field: ['create_date_start', 'create_date_end'],
            placeholder: ['上传日期起', '上传日期止'],
          },
          { type: 'Input', field: 'name', placeholder: '学员姓名' },
          { type: 'Input', field: 'idcard', placeholder: '证件号码' },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
      />

      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record: any) => _get(record, 'sid')}
        pagination={tablePagination}
        scroll={{ x: 1300, y: document.body?.clientHeight - 480 }}
      />
    </>
  );
}

export default StudentFace;
