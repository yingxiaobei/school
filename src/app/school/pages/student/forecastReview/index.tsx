// 预报名审核
import { useState } from 'react';
import { _get, _handleIdCard, _handlePhone } from 'utils';
import { formatTime } from 'utils';
import { useFetch, useTablePagination, useSearch, useVisible, useForceUpdate, useOptions, useHash } from 'hooks';
import { _getForecastList } from './_api';
import Details from './Details';
import SignReview from '../studentInfo/AddOrEdit';
import { AuthButton, CustomTable, Search } from 'components';

function ForecastReview() {
  const [search, _handleSearch] = useSearch();
  const [currentId, setCurrentId] = useState(null);
  const [detailVisible, _switchDetailVisible] = useVisible();
  const [reviewVisible, _switchReviewVisible] = useVisible();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();

  // FIXME:wy
  const { isLoading, data } = useFetch<any>({
    request: _getForecastList,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      name: _get(search, 'name'),
      idcard: _get(search, 'idcard'),
      checkstatus: _get(search, 'checkstatus'),
      traintype: _get(search, 'traintype'),
      regtimebegin: formatTime(_get(search, 'regtimebegin'), 'BEGIN'),
      regtimeend: formatTime(_get(search, 'regtimeend'), 'END'),
      checktimebegin: formatTime(_get(search, 'checktimebegin'), 'BEGIN'),
      checktimeend: formatTime(_get(search, 'checktimeend'), 'END'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  const busitypeHash = useHash('businessType', false, '-1', [], {
    forceUpdate: true,
  }); // 业务类型
  const checkstatusSign = useHash('checkstatus_sign'); // 审核状态

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      width: 80,
    },
    {
      title: '手机',
      dataIndex: 'phone',
      width: 80,
      render: (value: any, record: any) => _handlePhone(value),
    },
    {
      title: '证件号',
      dataIndex: 'idcard',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '业务类型',
      dataIndex: 'busitype',
      width: 80,
      render: (busitype: any) => busitypeHash[busitype],
    },
    {
      title: '培训车型',
      width: 80,
      dataIndex: 'traintype',
    },
    {
      title: '审核状态',
      width: 80,
      dataIndex: 'checkstatus',
      render: (checkstatus: any) => checkstatusSign[checkstatus],
    },
    {
      title: '申请日期',
      width: 140,
      dataIndex: 'regtime',
    },
    {
      title: '审核日期',
      width: 140,
      dataIndex: 'checktime',
    },
    {
      title: '操作',
      width: 100,
      fixed: 'right',
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId="student/forecastReview:btn1"
            onClick={() => {
              _switchDetailVisible();
              setCurrentId(_get(record, 'sid'));
            }}
            className="operation-button"
          >
            详情
          </AuthButton>
          {_get(record, 'checkstatus') === '0' && (
            <AuthButton
              authId="student/forecastReview:btn2"
              onClick={() => {
                _switchReviewVisible();
                setCurrentId(_get(record, 'sid'));
              }}
              className="operation-button"
            >
              审核
            </AuthButton>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {detailVisible && <Details onCancel={_switchDetailVisible} currentId={currentId} />}

      {reviewVisible && (
        <SignReview
          onCancel={_switchReviewVisible}
          currentRecord={{ sid: currentId }}
          onOk={() => {
            _switchReviewVisible();
            forceUpdate();
          }}
          isReview={true}
          isEdit={true}
        />
      )}

      <Search
        loading={isLoading}
        filters={[
          { type: 'Input', field: 'name', placeholder: '学员姓名' },
          { type: 'Input', field: 'idcard', placeholder: '证件号码' },
          {
            type: 'Select',
            field: 'checkstatus',
            options: [{ label: '审核状态(全部)', value: '' }, ...useOptions('checkstatus_sign')],
          },
          {
            type: 'Select',
            field: 'traintype',
            options: [{ label: '培训车型(全部)', value: '' }, ...useOptions('business_scope')],
          },
          {
            type: 'RangePicker',
            field: ['regtimebegin', 'regtimeend'],
            placeholder: ['申请日期起', '申请日期止'],
          },
          {
            type: 'RangePicker',
            field: ['checktimebegin', 'checktimeend'],
            placeholder: ['审核日期起', '审核日期止'],
          },
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
        rowKey={'sid'}
        pagination={tablePagination}
      />
    </div>
  );
}

export default ForecastReview;
