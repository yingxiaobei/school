// 教练人脸模板审核
import { useState } from 'react';
import { useSearch, useTablePagination, useFetch, useForceUpdate, useHash, useVisible, useRequest } from 'hooks';
import { _getCoachFace, _deleteCoaFaceTemplate } from './_api';
import { AuthButton, CustomTable, Search } from 'components';
import { _get, _handleIdCard } from 'utils';
import Details from './Details';
import Review from './Review';

function CoachFaceReview() {
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [visible, _switchVisible] = useVisible();
  const [reviewVisible, _switchReviewVisible] = useVisible();
  const [currentId, setCurrentId] = useState();

  const employStatusHash = useHash('coa_master_status'); // 供职状态
  const statusHash = useHash('status'); // 审核状态
  const checkflagHash = useHash('pass_notpass_type'); // 自动审核-人工审核-学员人脸模板审核

  const { loading: deleteLoading, run } = useRequest(_deleteCoaFaceTemplate, {
    onSuccess: () => forceUpdate(),
  });
  const columns = [
    { title: '姓名', dataIndex: 'name' },
    {
      title: '证件号码',
      dataIndex: 'idcard',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    { title: '供职状态', dataIndex: 'employstatus', render: (employstatus: any) => employStatusHash[employstatus] },
    { title: '上传时间', dataIndex: 'create_date' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: any) => statusHash[status],
    },
    {
      title: '自动审核',
      dataIndex: 'autocheckflag',
      render: (autocheckflag: any) => checkflagHash[autocheckflag],
    },
    {
      title: '人工审核',
      dataIndex: 'handcheckflag',
      render: (handcheckflag: any) => checkflagHash[handcheckflag],
    },
    { title: '备注', dataIndex: 'memo' },
    { title: '操作人', dataIndex: 'updateoptor' },
    { title: '操作时间', dataIndex: 'update_date' },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId="coach/coachFaceReview:btn1"
            onClick={() => {
              _switchVisible();
              setCurrentId(_get(record, 'cid'));
            }}
            className="operation-button"
          >
            查看模板
          </AuthButton>

          <AuthButton
            authId="coach/coachFaceReview:btn2"
            onClick={() => {
              _switchReviewVisible();
              setCurrentId(_get(record, 'cid'));
            }}
            className="operation-button"
            insertWhen={_get(record, 'handcheckflag') === '0'}
          >
            审核
          </AuthButton>
          <AuthButton
            authId="coach/coachFaceReview:btn3"
            loading={deleteLoading}
            onClick={() => {
              run({ id: _get(record, 'cid') });
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
    request: _getCoachFace,
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
          { type: 'Input', field: 'name', placeholder: '教练姓名' },
          { type: 'Input', field: 'idcard', placeholder: '证件号码' },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={forceUpdate}
      />

      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record: any) => _get(record, 'cid')}
        pagination={tablePagination}
      />
    </>
  );
}

export default CoachFaceReview;
