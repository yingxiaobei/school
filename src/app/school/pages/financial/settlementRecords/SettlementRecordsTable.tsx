// 商品信息
import { useEffect, useState } from 'react';
import { _getInfo, _getTotalMoney, _manualSettle } from './_api';
import { _get, _handleIdCard } from 'utils';
import { useHash, useFetch, useVisible, useRequest } from 'hooks';
import Detail from '../../teach/orderRecord/Detail';
import { AuthButton, CustomTable } from 'components';
import TransactionDetail from './TransactionDetail';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

/**
 * settlementRecords : 财务管理-结算记录
 * phasedReview: 阶段报审-详情-去结算-结算记录
 * studentInfo：学员信息-详情-结算记录
 * studentOrder：财务管理-学员订单-详情-结算记录
 */
type IPageType = 'settlementRecords' | 'phasedReview' | 'studentInfo' | 'studentOrder';

interface ISettlementTableProps {
  query: any;
  setMoneyCallback?: any;
  ignore: any;
  pagination: any;
  setPagination: any;
  tablePagination: any;
  sid?: string;
  forceUpdate: any;
  setLoading?: any;
  type: IPageType;
}

//结算记录table
export default function SettlementRecordsTable(props: ISettlementTableProps) {
  const {
    query,
    setMoneyCallback,
    ignore,
    pagination,
    setPagination,
    tablePagination,
    sid,
    forceUpdate,
    setLoading,
    type = 'settlementRecords',
  } = props;

  const [transactionVisible, setTransactionVisible] = useVisible();
  const [currentRecord, setCurrentRecord] = useState();
  const settlementTypeHash = useHash('settlement_type'); // 结算类型
  const settlementStatusHash = useHash('settlement_status'); // 结算状态
  const subAccountStatusHash = useHash('sub_account_type'); // 结算状态

  const { isLoading, data } = useFetch({
    request: _getInfo,
    query: sid ? { ...query, sid } : query,
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: async (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });

      let res =
        type === 'phasedReview'
          ? await _getTotalMoney({ sid, status: _get(query, 'status') })
          : type === 'studentInfo'
          ? await _getTotalMoney({ sid, status: '2' })
          : await _getTotalMoney(query);
      if (_get(res, 'code') === 200 && setMoneyCallback) {
        setMoneyCallback(res, data);
      }
    },
  });

  useEffect(() => {
    setLoading && setLoading(isLoading);
  }, [isLoading, setLoading]);

  const { run, loading } = useRequest(_manualSettle, {
    onSuccess: forceUpdate,
  });
  const [visible, setVisible] = useVisible();
  const [currentId, setCurrentId] = useState();
  const [payFlowId, setPayFlowId] = useState('');

  const columns = [
    {
      title: '结算单号',
      dataIndex: 'id',
      width: 150,
      render: (data: any, record: any) => (
        <Tooltip title={record?.coachSubAmount > 0 ? '[分]' + data : data}>
          <span>{record?.coachSubAmount > 0 ? '[分]' + data : data}</span>
        </Tooltip>
      ),
    },
    {
      title: '学员姓名',
      dataIndex: 'studentName',
      width: 80,
    },
    {
      title: '证件号',
      dataIndex: 'idNumber',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '学员电子账户',
      dataIndex: 'studentBankAccount',
      width: 100,
    },
    {
      title: (
        <>
          {'培训教练 '}
          <Tooltip placement="bottom" title={'教学日志里的教练员'}>
            <QuestionCircleOutlined />
          </Tooltip>
        </>
      ),
      dataIndex: 'teachName',
      width: 100,
      render: (data: any, record: any) => {
        return record?.cid && record?.cid === record?.teachId && record?.coachSubAmount > 0 ? (
          <>
            <span style={{ color: 'red' }}>*</span>
            {data}
          </>
        ) : (
          data
        );
      },
    },
    {
      title: (
        <>
          {'学车教练 '}
          <Tooltip placement="bottom" title={'学员档案里的教练员'}>
            <QuestionCircleOutlined />
          </Tooltip>
        </>
      ),
      dataIndex: 'coachName',
      width: 100,
      render: (data: any, record: any) => {
        return record?.cid && record?.cid === record?.coachId && record?.coachSubAmount > 0 ? (
          <>
            <span style={{ color: 'red' }}>*</span>
            {data}
          </>
        ) : (
          data
        );
      },
    },
    {
      title: '交易号',
      dataIndex: 'payFlowId',
      width: 150,
      render: (payFlowId: any) => {
        if (!payFlowId) {
          return '';
        }
        return (
          <Tooltip className="textEllipsis" title={payFlowId}>
            <span
              className="color-primary pointer"
              onClick={() => {
                setPayFlowId(payFlowId);
                setTransactionVisible();
              }}
            >
              {payFlowId}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: '订单号',
      dataIndex: 'orderCode',
      width: 150,
    },
    {
      title: '结算方式',
      dataIndex: 'settleType',
      render: (settleType: any) => settlementTypeHash[settleType],
      width: 80,
    },
    {
      title: '结算依据',
      dataIndex: 'settleNote',
      width: 80,
      render: (settleNote: any, record: any) => {
        if (String(record.settleType) === '3') {
          //结算方式按课程时，点击可跳转到预约详情页
          return (
            <span
              className="color-primary pointer"
              onClick={() => {
                setVisible();
                setCurrentId(_get(record, 'orderId'));
              }}
            >
              {settleNote}
            </span>
          );
        }
        return settleNote;
      },
    },
    {
      title: '结算金额',
      dataIndex: 'settleAmout',
      width: 80,
      render: (settleAmout: any) => {
        return settleAmout || settleAmout === 0 ? Number(settleAmout).toFixed(2) : '';
      },
    },
    {
      title: '驾校收入',
      dataIndex: 'schoolSubAmount',
      width: 80,
    },
    {
      title: '结算状态',
      dataIndex: 'status',
      width: 80,
      render: (status: any) => settlementStatusHash[status],
    },
    {
      title: '入账状态',
      dataIndex: 'subAccountStatus',
      width: 80,
      render: (status: any) => subAccountStatusHash[status],
    },
    {
      title: '入账时间',
      dataIndex: 'schoolSubAccountTime',
      width: 100,
    },
    {
      title: '失败原因',
      width: 240,
      dataIndex: 'message',
    },
    {
      title: '创建时间',
      width: 180,
      dataIndex: 'createTime',
    },
    {
      title: '结算完成时间',
      width: 160,
      dataIndex: 'finishedSettleTime',
    },
    {
      title: '备注',
      width: 100,
      ellipsis: true,
      dataIndex: 'note',
    },
    {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (_: void, record: any) => {
        return (
          <AuthButton
            authId="financial/settlementRecords:btn1"
            insertWhen={_get(record, 'status') == '0' || _get(record, 'status') == '1' || _get(record, 'status') == '3'} // 待结算、结算中、结算异常
            loading={_get(currentRecord, 'id') === _get(record, 'id') && loading}
            className="operation-button"
            onClick={() => {
              setCurrentRecord(record);
              run({ id: _get(record, 'id') });
            }}
          >
            立即结算
          </AuthButton>
        );
      },
    },
  ];

  return (
    <div>
      {transactionVisible && (
        <TransactionDetail onCancel={setTransactionVisible} visible={transactionVisible} payFlowId={payFlowId} />
      )}
      {visible && <Detail currentId={currentId} onCancel={setVisible} />}
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record: any) => _get(record, 'id')}
        pagination={tablePagination}
        scroll={{ x: 2000, y: document.body?.clientHeight - 580 }}
      />
    </div>
  );
}
