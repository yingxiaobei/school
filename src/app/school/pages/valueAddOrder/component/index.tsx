// 学员订单
import { useState, useRef } from 'react';
import { message, Modal } from 'antd';
import { _get, downloadFile, deepClone, formatDecimal } from 'utils';
import {
  useFetch,
  useTablePagination,
  useSearch,
  useVisible,
  useForceUpdate,
  useOptions,
  useHash,
  useConfirm,
  useRequest,
} from 'hooks';
import { AuthButton, Search, ButtonContainer } from 'components';
import { _getStudentList } from 'api';
import moment from 'moment';
import WithdrawalApplication from '../saleByMe/WithdrawalApplication';
import OrderList from '../component/OrderList';
import saleByMe from './api';
import soldByMe from '../soldByMe/api';
import { _apply } from '../saleByMe/api';
interface prop {
  type: string;
}

function SaleByMe({ type = 'sale' }: prop) {
  const { _getSum, _exportBefore, _exportDetail } = type === 'sold' ? soldByMe : saleByMe;
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [withdrawApplicVisible, _switchWithdrawApplicVisible] = useVisible();
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawVerfiy, setWithdrawVerfiy] = useState('0'); //（0.不免审 1. 免审）
  const [_showConfirm] = useConfirm();
  const payStatus = useOptions('order_retail_pay_status');
  const [applyDetail, setApplyDetail] = useState({ amount: '', count: 0, shopId: '', list: [] });
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCount, setTotalCount] = useState('0.00');

  const searchRef = useRef<HTMLDivElement>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRow, setSelectedRow] = useState([]);
  const query = {
    schoolName: _get(search, 'schoolName'),
    userName: _get(search, 'userName'),
    pageNum: pagination.current,
    pageSize: pagination.pageSize,
    orderId: _get(search, 'orderId'),
    orderPayStatusList: _get(search, 'orderPayStatusList'),
    acctId: _get(search, 'acctId'),
    withdrawAppStatus: _get(search, 'withdrawAppStatus'),
    startTime: _get(search, 'startTime'),
    endTime: _get(search, 'endTime'),
    settleStatus: _get(search, 'settleStatus'),
    schoolId: _get(search, 'schoolId'),
  };

  useFetch({
    request: _getSum,
    query: query,
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setTotalAmount(_get(data, 'orderSum', 0));
      setTotalCount(_get(data, 'performanceAmountSum', 0));
      setWithdrawVerfiy(_get(data, 'withdrawVerfiy', '0'));
    },
  });

  const { loading: withdrawalLoading, run } = useRequest(_apply, {
    onSuccess: (res) => {
      message.success('操作成功，请前往提现记录查看!');
      forceUpdate();
      setSelectedRowKeys([]);
      setSelectedRow([]);
    },
  });

  return (
    <div>
      {withdrawApplicVisible && (
        <WithdrawalApplication
          onCancel={_switchWithdrawApplicVisible}
          withdrawVerfiy={withdrawVerfiy}
          applyDetail={applyDetail}
          onSuccess={() => {
            forceUpdate();
            _switchWithdrawApplicVisible();
            setSelectedRowKeys([]);
            setSelectedRow([]);
          }}
        />
      )}
      <Search
        loading={isLoading}
        filters={[
          { type: 'Input', field: 'orderId', placeholder: '订单号' },
          {
            type: 'Select',
            field: 'orderPayStatusList',
            options: [{ label: '订单状态(全部)', value: '' }, ...payStatus],
          },
          { type: 'Input', field: 'schoolName', placeholder: '所属驾校' },
          { type: 'Input', field: 'userName', placeholder: '学员姓名' },
          { type: 'Input', field: 'acctId', placeholder: '学员证件号' },
          {
            type: 'Select',
            field: 'withdrawAppStatus',
            options: [{ label: '提现申请状态(全部)', value: '' }, ...useOptions('withdraw_app_status')],
          },
          {
            type: 'Select',
            field: 'settleStatus',
            options: [{ label: '入账状态(全部)', value: '' }, ...useOptions('sub_account_type')],
          },

          {
            type: 'RangePicker',
            field: ['startTime', 'endTime'],
            placeholder: ['创建日期起', '创建日期止'],
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
        simpleStudentRequest={_getStudentList}
      />

      <div className="border-all flex mb20">
        <div className="flex1 mt10 mb10 ml10 mr10">
          <div>订单总笔数（已支付）</div>
          <div className="fz24">{totalAmount || 0}笔</div>
        </div>
        <div className="flex1 mt10 mb10 ml10 mr10">
          <div>{type === 'sold' ? '收入总额（已入账）' : '提成收入总额（已到账）'} </div>
          <div className="fz24 green">+{totalCount || 0}元</div>
        </div>
      </div>

      <ButtonContainer
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
        loading={isLoading}
        searchRef={searchRef}
        openToggle={true}
      >
        <AuthButton
          className="mb10 mr10"
          type="primary"
          authId={type === 'sold' ? 'valueAddOrder/soldByMe:btn1' : 'valueAddOrder/saleByMe:btn1'}
          loading={withdrawalLoading}
          onClick={() => {
            if (!selectedRowKeys.length) {
              Modal.info({
                title: `选择的记录数为零，请重新选择！`,
                onOk() {},
              });
              return;
            }
            const sum =
              type === 'sold'
                ? selectedRow.reduce((pre: any, cur: any) => {
                    return pre + Number(cur?.promoteAmount);
                  }, 0)
                : selectedRow.reduce((pre: any, cur: any) => {
                    return pre + Number(cur?.performanceAmount);
                  }, 0);
            let detail = {
              amount: formatDecimal(sum, 2) + '',
              count: selectedRowKeys.length,
              shopId: _get(selectedRow, '[0].shopId'),
              list: deepClone(selectedRowKeys),
            };
            if (type === 'sold') {
              run({
                orderAmount: detail.amount,
                orderCount: detail.count,
                orderIds: detail.list,
              });
            } else {
              setApplyDetail({
                ...detail,
              });
              _switchWithdrawApplicVisible();
            }
          }}
        >
          申请提现
        </AuthButton>
        <AuthButton
          className="mb10"
          type="primary"
          authId={type === 'sold' ? 'valueAddOrder/soldByMe:btn2' : 'valueAddOrder/saleByMe:btn2'}
          onClick={() => {
            _showConfirm({
              title: `当前申请导出记录数${_get(pagination, 'total', 0)}，确定立即导出？`,
              handleOk: async () => {
                const res = await _exportBefore(query);
                if (_get(res, 'code') === 200) {
                  if (_get(res, 'data') > 2000) {
                    message.error('导出条数不超过2000条！');
                    return;
                  }
                  _exportDetail(query).then((res: any) => {
                    downloadFile(
                      res,
                      `我推销的${moment().format('YYYY-MM-DD-HH-mm-ss')}`,
                      'application/vnd.ms-excel',
                      'xlsx',
                    );
                  });
                } else {
                  message.error(_get(res, 'message'));
                }
              },
            });
          }}
        >
          导出
        </AuthButton>
      </ButtonContainer>
      <OrderList
        ignore={ignore}
        pagination={pagination}
        setPagination={setPagination}
        tablePagination={tablePagination}
        selectedRowKeys={selectedRowKeys}
        setSelectedRowKeys={setSelectedRowKeys}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        query={query}
        setIsLoading={setIsLoading}
        type={type}
      />
    </div>
  );
}

export default SaleByMe;
