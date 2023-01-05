import { useState } from 'react';
import { Search, CustomTable, AuthButton } from 'components';
import { useOptions, useSearch, useForceUpdate, useTablePagination, useFetch, useVisible, useHash } from 'hooks';
import { _get, formatTime } from 'utils';
import { _getList } from './api';
import Details from './Details';
import moment from 'moment';
import { message } from 'antd';
import BindBankCard from 'app/school/pages/financial/wallet/BindBankCard';
import ZSBankWithdrawal from '../../financial/wallet/ZSBankWithdrawal';

const WithdrawalApplication = () => {
  const [search, _handleSearch] = useSearch({
    startTime: formatTime(moment().subtract(30, 'day'), 'BEGIN'),
    endTime: formatTime(moment(), 'END'),
  });
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [currentId, setCurrentId] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [cashAmt, setCashAmt] = useState(''); //可提现余额
  const [zsWithDrawalVisible, setZSWithDrawalVisible] = useVisible();
  const [bankChannelId, setBankChannelId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankCardVisible, setBankCardVisible] = useVisible();
  const [acctNo, setAcctNo] = useState('');
  const verfiyStatusHash = useHash('withdraw_verify_status');
  const withdrawStatusHash = useHash('school_withdraw_status');
  const query = {
    pageNum: pagination.current,
    pageSize: pagination.pageSize,
    withrawApplyId: _get(search, 'withrawApplyId'),
    endTime: _get(search, 'endTime'),
    startTime: _get(search, 'startTime'),
    verfiyStatus: _get(search, 'verfiyStatus'),
  };

  const { isLoading, data } = useFetch({
    request: _getList,
    query: query,
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  const columns = [
    {
      title: '申请单号',
      dataIndex: 'withrawApplyId',
      width: 120,
    },
    {
      title: '审核状态',
      width: 100,
      dataIndex: 'verfiyStatus',
      render: (text: string) => verfiyStatusHash[text],
    },
    {
      title: '审核说明',
      dataIndex: 'memo',
      render: (memo: string) => (memo ? memo : '/'),
      width: 100,
    },
    {
      title: '订单金额',
      dataIndex: 'orderAmount',
      width: 160,
    },
    {
      title: '订单笔数',
      dataIndex: 'orderCount',
      width: 160,
    },
    {
      title: '申请信息',
      width: 100,
      dataIndex: 'applyInfo',
    },
    {
      title: '提现状态',
      width: 120,
      dataIndex: 'withdrawStatus',
      render: (text: string) => withdrawStatusHash[text],
    },
    {
      title: '操作',
      width: 120,
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId="valueAddOrder/withdrawalApplication:btn1"
            onClick={() => {
              _switchDetailsVisible();
              setCurrentId(_get(record, 'withrawApplyId'));
              setCurrentRecord(record);
            }}
            className="operation-button"
          >
            详情
          </AuthButton>
          <AuthButton
            authId="valueAddOrder/withdrawalApplication:btn2"
            insertWhen={
              _get(record, 'withdrawStatus', '').toString() === '0' &&
              _get(record, 'verfiyStatus', '').toString() === '1'
            } // withdrawStatus :0 未提现  verfiyStatus:1 审核通过
            onClick={() => {
              setZSWithDrawalVisible();
              setCashAmt(_get(record, 'orderAmount'));
              setAcctNo(_get(record, 'acctNo', ''));
              setBankAccount(_get(record, 'acctNo', ''));
              setBankChannelId(_get(record, 'bankChannelId', ''));
              setCurrentId(_get(record, 'withrawApplyId'));
            }}
            className="operation-button"
          >
            提现
          </AuthButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      {bankCardVisible && ( //绑卡
        <BindBankCard
          onCancel={setBankCardVisible}
          bankChannelId={bankChannelId}
          acctNo={acctNo}
          bankAccount={bankAccount}
          onOK={() => {
            forceUpdate();
            setBankCardVisible();
          }}
        />
      )}
      {detailsVisible && (
        <Details onCancel={_switchDetailsVisible} currentId={currentId} currentRecord={currentRecord} />
      )}
      {zsWithDrawalVisible && ( //浙商提现
        <ZSBankWithdrawal
          onCancel={setZSWithDrawalVisible}
          bankChannelId={bankChannelId}
          bankAccount={bankAccount}
          acctNo={acctNo}
          cashAmount={cashAmt}
          onOk={() => {
            setZSWithDrawalVisible();
            forceUpdate();
          }}
          setBankCardVisible={setBankCardVisible}
          type={'add'}
          withrawApplyId={currentId}
        />
      )}
      <Search
        loading={isLoading}
        filters={[
          { type: 'Input', field: 'withrawApplyId', placeholder: '申请单号' },
          {
            type: 'RangePicker',
            field: ['startTime', 'endTime'],
            placeholder: ['申请日期起', '申请日期止'],
            otherProps: {
              defaultValue: [moment().subtract(30, 'day'), moment()],
            },
          },
          {
            type: 'Select',
            field: 'verfiyStatus',
            options: [{ label: '审核状态(全部)', value: '' }, ...useOptions('withdraw_verify_status ')],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          if (
            _get(search, 'startTime') &&
            _get(search, 'endTime') &&
            moment(_get(search, 'startTime')).year() !== moment(_get(search, 'endTime')).year()
          ) {
            message.error('选择日期不能跨年');
          } else {
            forceUpdate();
            setPagination({ ...pagination, current: 1 });
          }
        }}
      />
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'content', [])}
        rowKey="id"
        pagination={tablePagination}
        scroll={{ x: 1600, y: document.body?.clientHeight - 460 }}
      />
    </div>
  );
};
export default WithdrawalApplication;
