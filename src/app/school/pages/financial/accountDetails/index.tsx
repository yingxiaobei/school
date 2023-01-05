// 账务明细
import { useState } from 'react';
import { Radio, message } from 'antd';
import { _get } from 'utils';
import { _getStudentList } from 'api';
import { useTablePagination, useSearch, useForceUpdate, useOptions } from 'hooks';
import { Search } from 'components';
import AccountDetailsTable from './AccountDetailsTable';
import moment from 'moment';

// FIXME: -yyq 该文件的css样式尽可能替换成className，并且统一为通用样式

function AccountDetails() {
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [incomeMoney, setIncomeMoney] = useState(0);
  const [payoutMoney, setPayoutMoney] = useState(0);
  const [flowType, setFlowType] = useState('');
  const [loading, setLoading] = useState(false);

  const query = {
    page: pagination.current,
    limit: pagination.pageSize,
    startDate: _get(search, 'startDate'),
    endDate: _get(search, 'endDate'),
    busiType: _get(search, 'busiType'),
    targetAcctNo: _get(search, 'targetAcctNo'),
    sid: _get(search, 'sid'),
    flowType: _get(search, 'flowType'),
  };

  function setMoneyCallback(data: any) {
    //设置收入、结算笔数
    setIncomeMoney(_get(data, 'incomeAmount', '0'));
    setPayoutMoney(_get(data, 'expandAmount', '0'));
  }

  return (
    <div>
      {
        <Search
          loading={loading}
          filters={[
            {
              type: 'RangePicker',
              field: ['startDate', 'endDate'],
              placeholder: ['创建日期起', '创建日期止'],
            },
            {
              type: 'Select',
              field: 'busiType',
              options: [{ label: '账务类型(全部)', value: '' }, ...useOptions('transaction_type')], //交易类型
            },
            {
              type: 'SimpleSelectOfStudent',
              field: 'sid',
            },
            { type: 'Input', field: 'targetAcctNo', placeholder: '对方电子账号' },
          ]}
          search={search}
          _handleSearch={_handleSearch}
          refreshTable={() => {
            if (
              _get(search, 'startDate') &&
              _get(search, 'endDate') &&
              moment(_get(search, 'startDate')).year() !== moment(_get(search, 'endDate')).year()
            ) {
              message.error('选择日期不能跨年');
            } else {
              forceUpdate();
              setPagination({ ...pagination, current: 1 });
            }
          }}
          simpleStudentRequest={_getStudentList}
        />
      }

      {
        <div
          style={{
            border: 1,
            borderStyle: 'solid',
            borderColor: '#d9d9d9',
            display: 'flex',
            marginBottom: 20,
          }}
        >
          <div style={{ flex: 1, margin: 10 }}>
            <div>收入</div>
            <div style={{ fontSize: 25, color: 'green' }}>{incomeMoney || 0}元</div>
          </div>
          <div style={{ flex: 1, margin: 10 }}>
            <div>支出</div>
            <div style={{ fontSize: 25, color: '#F3302B' }}>{payoutMoney || 0}元</div>
          </div>
        </div>
      }

      <div>
        <Radio.Group
          defaultValue=""
          buttonStyle="solid"
          onChange={(e: any) => {
            _handleSearch('flowType', e.target.value);
            setFlowType(e.target.value);
          }}
          className="mb20"
        >
          <Radio.Button value="">全部</Radio.Button>
          <Radio.Button value="1">收入</Radio.Button>
          <Radio.Button value="2">支出</Radio.Button>
        </Radio.Group>
      </div>
      <AccountDetailsTable
        query={query}
        setMoneyCallback={setMoneyCallback}
        ignore={ignore}
        flowType={flowType}
        pagination={pagination}
        setPagination={setPagination}
        tablePagination={tablePagination}
        setLoading={setLoading}
      />
    </div>
  );
}

export default AccountDetails;
