import { Button, Drawer, message } from 'antd';
import { CustomTable, Search, ButtonContainer, AuthButton } from 'components';
import moment from 'moment';
import { useFetch, useForceUpdate, useHash, useSearch, useTablePagination, useVisible } from 'hooks';
import { useState } from 'react';
import { formatTime, get30DaysAgoNotCrossYear, _get } from 'utils';
import { _getList } from './_api';
import CardReturnDetail from './CardReturnDetail';
import AddCardReturn from './AddCardReturn';

export default function CardReturn(props: any) {
  const { onCancel, visible, accountInfo } = props;
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const startTime = get30DaysAgoNotCrossYear();
  const [addCardReturnVisible, _switchAddCardReturnVisible] = useVisible();
  const [search, _handleSearch] = useSearch({
    startTime: formatTime(startTime, 'BEGIN'),
    endTime: formatTime(moment(), 'END'),
  });
  const [ignore, forceUpdate] = useForceUpdate();
  const [detailVisible, _switchDetailsVisible] = useVisible();
  const [currentRecord, setCurrentRecord] = useState();

  const payStatusHash = useHash('stu_apply_status');
  const { data, isLoading } = useFetch({
    request: _getList,
    depends: [ignore, pagination.current, pagination.pageSize],
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      applyType: 6,
      functionType: 1,
      subAccountType: accountInfo.subAccountType,
      applyTimeBegin: formatTime(_get(search, 'startTime'), 'BEGIN'),
      applyTimeEnd: formatTime(_get(search, 'endTime'), 'END'),
    },
    callback(data) {
      if (!_get(search, 'startTime') || !_get(search, 'endTime')) {
        return message.error('创建时间不能为空');
      }
      setPagination({ ...pagination, total: _get(data, 'totalCount', 0) });
    },
  });
  const columns = [
    { title: '申请时间', dataIndex: 'applyTime', width: 120 },
    { title: '退卡数', dataIndex: 'returnCardNum', width: 100 },
    {
      title: '退学月份',
      dataIndex: 'dropOutMonth',
      width: 80,
    },
    { title: '附言', width: 80, dataIndex: 'applyMessage' },
    { title: '申请状态', width: 80, dataIndex: 'auditStatus', render: (payStatus: any) => payStatusHash[payStatus] },
    { title: '审核时间', dataIndex: 'auditTime', width: 120 },
    {
      title: '操作',
      width: 80,
      dataIndex: '_record',
      render: (_: any, record: any) => (
        <AuthButton
          authId="financial/wellcomeWallet:btn5"
          onClick={() => {
            setCurrentRecord(record);
            _switchDetailsVisible();
          }}
          className="operation-button"
          type="primary"
          ghost
          size="small"
        >
          退卡明细
        </AuthButton>
      ),
    },
  ];
  return (
    <Drawer destroyOnClose visible={visible} width={1000} title={'退卡记录'} onClose={onCancel}>
      <Search
        loading={isLoading}
        filters={[
          {
            type: 'RangePicker',
            field: ['startTime', 'endTime'],
            placeholder: ['创建时间(起)', '创建时间(止)'],
            otherProps: {
              allowClear: false,
              defaultValue: [startTime, moment()],
            },
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          if (!_get(search, 'startTime') || !_get(search, 'endTime')) {
            return message.error('创建时间不能为空');
          }
          setPagination({ ...pagination, current: 1, total: _get(data, 'totalCount', 0) });
          forceUpdate();
        }}
      />
      <ButtonContainer refreshTable={forceUpdate} loading={isLoading}>
        <AuthButton authId="" type="primary" className="mb20" onClick={_switchAddCardReturnVisible}>
          新增
        </AuthButton>
      </ButtonContainer>
      {addCardReturnVisible && <AddCardReturn onCancel={_switchAddCardReturnVisible} accountInfo={accountInfo} />}
      {detailVisible && (
        <CardReturnDetail
          currentRecord={currentRecord}
          onCancel={_switchDetailsVisible}
          onOk={() => {
            _switchDetailsVisible();
            forceUpdate();
          }}
          visible={detailVisible}
        />
      )}
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        pagination={tablePagination}
        rowKey={() => Math.random()}
      />
    </Drawer>
  );
}
