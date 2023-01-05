import { useState, useEffect } from 'react';
import { AuthButton, CustomTable } from 'components';
import { useFetch, useVisible, useHash } from 'hooks';
import Details from './Details';
import { _get, formatDecimal, _handleIdCard } from 'utils';
import saleByMe from './api';
import soldByMe from '../soldByMe/api';

interface Iprops {
  ignore: any;
  pagination: any;
  setPagination: ({}: any) => void;
  tablePagination: any;
  selectedRowKeys: Array<string>;
  setSelectedRowKeys: ([]: any) => void;
  query: object;
  setIsLoading?: ({}: any) => void;
  selectedRow?: Array<any>;
  setSelectedRow?: ([]: any) => void;
  check?: boolean;
  type?: string;
}
export default function OrderList(props: Iprops) {
  const {
    ignore,
    pagination,
    setPagination,
    tablePagination,
    selectedRowKeys,
    setSelectedRowKeys,
    query,
    setIsLoading,
    setSelectedRow,
    check = true,
    type = '',
  } = props;
  const { _getList } = type === 'sold' ? soldByMe : saleByMe;
  const payStatusHash = useHash('order_retail_pay_status'); // 订单状态
  const withdrawStatusHash = useHash('withdraw_app_status'); // 提现申请状态
  const settleStatusHash = useHash('sub_account_type'); // 入账状态
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [currentId, setCurrentId] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
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
      title: '订单号',
      dataIndex: 'orderId',
      width: 140,
    },
    {
      title: '订单状态',
      width: 100,
      dataIndex: 'payStatus',
      render: (paystatus: any) => payStatusHash[paystatus],
    },
    {
      title: '所属驾校',
      dataIndex: 'schoolName',
      width: 160,
    },
    {
      title: '学员姓名',
      dataIndex: 'userName',
      width: 100,
    },
    {
      title: '证件号',
      dataIndex: 'acctId',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },

    {
      title: '商品名称',
      width: 100,
      dataIndex: 'skuName',
    },
    {
      title: '订单类型',
      width: 120,
      dataIndex: 'orderBusType', //1:冻结支付  2：到账支付  3：线下支付
    },
    {
      title: '应付金额',
      width: 80,
      dataIndex: 'payAmount',
      render: (text: any) => formatDecimal(text, 2),
    },
    {
      title: '提成金额',
      width: 100,
      dataIndex: 'performanceAmount',
      render: (text: any) => (text === 0 || text === '0' ? '/' : formatDecimal(text, 2)),
      hide: type == 'sold',
    },
    {
      title: '收入金额',
      width: 100,
      dataIndex: 'promoteAmount',
      render: (text: any) => (!text || text === 0 || text === '0' ? '/' : formatDecimal(text, 2)),
      hide: type == 'sale',
    },
    {
      title: type == 'sold' ? '提现状态' : '提现申请状态',
      width: 120,
      dataIndex: 'withdrawAppStatus',
      render: (text: any) => withdrawStatusHash[text],
    },
    {
      title: '提现单号',
      dataIndex: 'withdrawAppId',
      render: (text: any) => (text ? text : '/'),
      width: 160,
      hide: type == 'sold',
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      width: 160,
    },
    {
      title: '支付时间',
      dataIndex: 'paymentTime',
      width: 160,
    },
    {
      title: '入账状态',
      dataIndex: 'settleStatus',
      width: 120,
      render: (text: string) => settleStatusHash[text],
    },
    {
      title: '备注',
      dataIndex: 'memo',
      width: 120,
    },
    {
      title: '操作',
      width: 120,
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId={type === 'sold' ? 'valueAddOrder/soldByMe:btn4' : 'valueAddOrder/saleByMe:btn4'}
            onClick={() => {
              _switchDetailsVisible();
              setCurrentId(_get(record, 'orderId'));
              setCurrentRecord(record);
            }}
            className="operation-button"
          >
            详情
          </AuthButton>
        </div>
      ),
    },
  ];
  useEffect(() => {
    if (!setIsLoading) {
      return;
    }
    setIsLoading && setIsLoading(isLoading);
  }, [isLoading]);

  return (
    <div>
      {detailsVisible && (
        <Details onCancel={_switchDetailsVisible} currentId={currentId} currentRecord={currentRecord} type={type} />
      )}
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'content', [])}
        rowKey="orderId"
        pagination={tablePagination}
        scroll={{ x: 1600, y: document.body?.clientHeight - 460 }}
        rowSelection={
          check
            ? {
                type: 'checkbox',
                onChange: (selectedRowKeys: any, selectedRows: any) => {
                  setSelectedRowKeys(selectedRowKeys);
                  setSelectedRow && setSelectedRow(selectedRows);
                },
                selectedRowKeys,
                getCheckboxProps: (record: any) => ({
                  disabled:
                    type === 'sale'
                      ? record.withdrawAppStatus === '1' || //提现申请状态为已申请的
                        record.performanceAmount + '' === '0' ||
                        record.performanceAmount + '' === '0.00' || //提成金额为0
                        !(record.settleStatus + '' === '1' && record.withdrawAppStatus === '0')
                      : record.withdrawAppStatus === '1' || //提现申请状态为已申请的
                        record.promoteAmount + '' === '0' ||
                        record.promoteAmount + '' === '0.00' || //提成金额为0
                        !(record.settleStatus + '' === '1' && record.withdrawAppStatus === '0'), // 只有为未申请但已入账的满足不置灰
                  name: record.name,
                }),
              }
            : false
        }
      />
    </div>
  );
}
