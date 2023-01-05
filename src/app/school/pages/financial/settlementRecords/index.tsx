// 结算记录
import { useState, useRef } from 'react';
import { useTablePagination, useSearch, useForceUpdate, useOptions, useFetch, useConfirm } from 'hooks';
import { AuthButton, ButtonContainer, Search } from 'components';
import { downloadFile, formatTime, _get } from 'utils';
import SettlementRecordsTable from './SettlementRecordsTable';
import moment from 'moment';
import { _getCoachList, _getStudentList, _getWallet } from 'api';
import { message } from 'antd';
import { _exportBefore, _exportStuSettleDetail } from './_api';

const time = moment().format('YYYY-MM-DD-HH-mm-ss');

/**
 * settlementRecords : 财务管理-结算记录
 * phasedReview: 阶段报审-详情-去结算-结算记录
 * studentInfo：学员信息-详情-结算记录
 * studentOrder：财务管理-学员订单-详情-结算记录
 */
type IPageType = 'settlementRecords' | 'phasedReview' | 'studentInfo';

interface settlementProps {
  idcard: string;
  sid: string;
  type: IPageType;
}
//结算记录页面 包含table和搜索组件、结算收入栏
function SettlementRecords(props: settlementProps) {
  const { idcard = '', sid = '', type = 'settlementRecords' } = props;
  const [search, _handleSearch] = useSearch({
    begin: formatTime(moment().subtract(30, 'day'), 'BEGIN'),
    end: formatTime(moment(), 'END'),
  });
  const [_showConfirm] = useConfirm();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [data, setData] = useState([]);
  const [totalMoney, setTotalMoney] = useState('0.00');
  const [totalAmount, setTotalAmount] = useState('0.00');
  const [totalCount, setTotalCount] = useState(0);
  const settlementStatus = useOptions('settlement_status');
  const subAccountStatus = useOptions('sub_account_type');
  const searchRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);

  const [walletOptions, setWalletOptions] = useState([]);
  useFetch({
    request: _getWallet,
    callback(data: any) {
      setWalletOptions(
        data.map((x: any) => {
          return { label: x.bankName, value: x.bankchannelid };
        }),
      );
    },
  });
  const commonQuery = {
    currentPage: pagination.current,
    pageSize: pagination.pageSize,
    idNumber: type === 'studentInfo' || type === 'phasedReview' ? idcard : _get(search, 'idNumber'),
  };
  const settlementQuery = {
    studentName: _get(search, 'studentName'),
    payFlowId: _get(search, 'payFlowId'),
    settleType: _get(search, 'settleType'),
    status: _get(search, 'status'),
    orderCode: _get(search, 'orderCode'),
    studentBankAccount: _get(search, 'studentBankAccount'),
    begin: formatTime(_get(search, 'begin'), 'BEGIN'),
    end: formatTime(_get(search, 'end'), 'END'),
    sid: _get(search, 'sid'),
    bankchannelid: _get(search, 'bankchannelid'),
    settlementOverEnd: formatTime(_get(search, 'settlementOverEnd'), 'END'),
    settlementOverBegin: formatTime(_get(search, 'settlementOverBegin'), 'BEGIN'),
    teachId: _get(search, 'teachId', ''),
    schoolSubAccountTimeBegin: formatTime(_get(search, 'schoolSubAccountTimeBegin', ''), 'BEGIN'),
    schoolSubAccountTimeEnd: formatTime(_get(search, 'schoolSubAccountTimeEnd', ''), 'END'),
    subAccountStatus: _get(search, 'subAccountStatus', ''),
    id: _get(search, 'id', ''),
    coachId: _get(search, 'coachId', ''),
  };
  const query =
    type === 'phasedReview'
      ? { ...commonQuery, status: _get(search, 'status') }
      : type === 'studentInfo'
      ? {
          ...commonQuery,
          id: _get(search, 'id', ''),
          begin: formatTime(_get(search, 'begin'), 'BEGIN'),
          end: formatTime(_get(search, 'end'), 'END'),
          status: _get(search, 'status'),
          settlementOverEnd: formatTime(_get(search, 'settlementOverEnd'), 'END'),
          settlementOverBegin: formatTime(_get(search, 'settlementOverBegin'), 'BEGIN'),
        }
      : {
          ...commonQuery,
          ...settlementQuery,
        };

  function setMoneyCallback(res: any, data: any) {
    //设置收入、结算笔数
    setData(data);
    setTotalMoney(Number(_get(res, 'data.schoolSubAmount', '0')).toFixed(2));
    setTotalCount(_get(res, 'data.total'));
    setTotalAmount(Number(_get(res, 'data.totalAmout', '0.00')).toFixed(2));
  }

  return (
    <div>
      {type === 'settlementRecords' && (
        <Search
          loading={loading}
          filters={[
            {
              type: 'RangePicker',
              field: ['begin', 'end'],
              placeholder: ['创建日期起', '创建日期止'],
              otherProps: {
                // allowClear: false,//需要允许清空，后端无限制
                defaultValue: [moment().subtract(30, 'day'), moment()],
              },
            },
            {
              type: 'RangePicker',
              field: ['settlementOverBegin', 'settlementOverEnd'],
              placeholder: ['结算时间起', '结算时间止'],
            },
            {
              type: 'RangePicker',
              field: ['schoolSubAccountTimeBegin', 'schoolSubAccountTimeEnd'],
              placeholder: ['入账时间起', '入账时间止'],
            },
            {
              type: 'SimpleSelectOfStudent',
              field: 'sid',
            },
            {
              type: 'SimpleSelectOfCoach',
              field: 'teachId',
              placeholder: '培训教练',
            },
            {
              type: 'SimpleSelectOfCoach',
              field: 'coachId',
              placeholder: '学车教练',
            },
            { type: 'Input', field: 'id', placeholder: '结算单号' },
            { type: 'Input', field: 'orderCode', placeholder: '订单号' },
            { type: 'Input', field: 'payFlowId', placeholder: '交易号' },
            {
              type: 'Select',
              field: 'status',
              options: [{ label: '结算状态(全部)', value: '' }, ...settlementStatus],
            },
            {
              type: 'Select',
              field: 'subAccountStatus',
              options: [{ label: '入账状态(全部)', value: '' }, ...subAccountStatus],
            },
            {
              type: 'Select',
              field: 'bankchannelid',
              options: [{ label: '钱包(全部)', value: '' }, ...walletOptions],
            },
          ]}
          search={search}
          _handleSearch={_handleSearch}
          refreshTable={() => {
            // if (moment(_get(search, 'begin')).year() !== moment(_get(search, 'end')).year()) {
            //   message.error('创建日期不能跨年');
            // } else {
            forceUpdate();
            setPagination({ ...pagination, current: 1 });
            // }
          }}
          showSearchButton={false}
          simpleStudentRequest={_getStudentList}
          ref={searchRef}
          simpleCoachRequest={_getCoachList}
        />
      )}
      {type === 'studentInfo' && (
        <Search
          loading={loading}
          filters={[
            {
              type: 'Select',
              field: 'status',
              options: [{ label: '结算状态(全部)', value: '' }, ...settlementStatus],
            },
            {
              type: 'RangePicker',
              field: ['begin', 'end'],
              placeholder: ['创建日期起', '创建日期止'],
              otherProps: {
                // allowClear: false,//需要允许清空，后端无限制
                defaultValue: [moment().subtract(30, 'day'), moment()],
              },
            },
            {
              type: 'RangePicker',
              field: ['settlementOverBegin', 'settlementOverEnd'],
              placeholder: ['结算时间起', '结算时间止'],
            },
            { type: 'Input', field: 'id', placeholder: '结算单号' },
          ]}
          search={search}
          _handleSearch={_handleSearch}
          showSearchButton={false}
          refreshTable={() => {
            forceUpdate();
            setPagination({ ...pagination, current: 1 });
          }}
        />
      )}
      {
        <div className="border-all flex mb20">
          <div className="flex1 mt10 mb10 ml10 mr10">
            <div>结算总笔数</div>
            <div className="fz24">{totalCount || 0}笔</div>
          </div>
          <div className="flex1 mt10 mb10 ml10 mr10">
            <div>结算总额</div>
            <div className="fz24 green">{totalAmount || 0}元</div>
          </div>
          <div className="flex1 mt10 mb10 ml10 mr10">
            <div>驾校总收入</div>
            <div className="fz24 green">+{totalMoney || 0}元</div>
          </div>
        </div>
      }
      {type === 'phasedReview' && (
        <Search
          loading={loading}
          filters={[
            {
              type: 'Select',
              field: 'status',
              options: [{ label: '结算状态(全部)', value: '' }, ...settlementStatus],
            },
          ]}
          search={search}
          _handleSearch={_handleSearch}
          refreshTable={() => {
            forceUpdate();
            setPagination({ ...pagination, current: 1 });
          }}
        />
      )}

      {(type === 'studentInfo' || type === 'settlementRecords') && (
        <ButtonContainer
          refreshTable={() => {
            forceUpdate();
            setPagination({ ...pagination, current: 1 });
          }}
          loading={loading}
          showOpenBtn={type === 'settlementRecords'}
          searchRef={searchRef}
          showSearchButton={true}
          openToggle={true}
        >
          <AuthButton
            className="mb10"
            type="primary"
            authId={type === 'settlementRecords' ? 'financial/settlementRecords:btn2' : 'student/studentInfo:btn38'}
            onClick={() => {
              _showConfirm({
                title: `当前申请导出记录数${_get(data, 'total', 0)}，确定立即导出？`,
                handleOk: async () => {
                  const query =
                    type === 'studentInfo'
                      ? {
                          sid,
                          idNumber: idcard,
                          id: _get(search, 'id', ''),
                          begin: formatTime(_get(search, 'begin'), 'BEGIN'),
                          end: formatTime(_get(search, 'end'), 'END'),
                          status: _get(search, 'status'),
                          settlementOverEnd: formatTime(_get(search, 'settlementOverEnd'), 'END'),
                          settlementOverBegin: formatTime(_get(search, 'settlementOverBegin'), 'BEGIN'),
                        }
                      : { ...settlementQuery, idNumber: _get(search, 'idNumber') };
                  const res = await _exportBefore(query);
                  if (_get(res, 'code') === 200) {
                    _exportStuSettleDetail(query).then((res: any) => {
                      downloadFile(res, `结算记录${time}`, 'application/vnd.ms-excel', 'xlsx');
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
      )}
      <SettlementRecordsTable
        query={query}
        sid={sid}
        setMoneyCallback={setMoneyCallback}
        ignore={ignore}
        pagination={pagination}
        setPagination={setPagination}
        tablePagination={tablePagination}
        forceUpdate={forceUpdate}
        setLoading={setLoading}
        type={type}
      />
    </div>
  );
}

export default SettlementRecords;
