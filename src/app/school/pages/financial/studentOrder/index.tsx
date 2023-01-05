// 学员订单
import { useState, useEffect } from 'react';
import { _getInfo } from './_api';
import { Radio, message } from 'antd';
import { _get, _handleIdCard } from 'utils';
import { useFetch, useTablePagination, useSearch, useVisible, useForceUpdate, useOptions, useHash } from 'hooks';
import { AuthButton, CustomTable, Search } from 'components';
import Details from './Details';
import UpdatePrice from './UpdatePrice';
import { _getCode } from 'api';
import { _getStudentList } from 'api';
import moment from 'moment';

function StudentOrder(props: { sid: string; isFromStudentInfo: boolean }) {
  const { sid, isFromStudentInfo = false } = props;
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const businessTypeHash = useHash('business_type'); // 业务类型
  // let orderTypeHash = useHash('order_type'); // 订单类型
  const payTypeHash = useHash('pay_type'); // 支付方式
  const payStatusHash = useHash('pay_status'); // 订单状态
  const [currentId, setCurrentId] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [bustype, setBustype] = useState();
  const [updatePriceVisible, _switchUpdatePriceVisible] = useVisible();

  let orderTypeList: any = useOptions('order_type');
  const payStatus = useOptions('pay_status');
  const [orderType, setOrderType] = useState([]);
  const [orderTypeHash, setOrderTypeHash] = useState([]);

  const columns = [
    {
      title: '订单号',
      dataIndex: 'ordercode',
      width: 120,
    },
    {
      title: '订单状态',
      width: 100,
      dataIndex: 'paystatus',
      render: (paystatus: any) => payStatusHash[paystatus],
    },
    {
      title: '学员姓名',
      dataIndex: 'sname',
      width: 100,
    },
    {
      title: '证件号',
      dataIndex: 'stuidnum',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '学员电子账户',
      dataIndex: 'stubankaccount',
      width: 160,
    },
    {
      title: '业务类型',
      width: 100,
      dataIndex: 'bustype', //1:报名缴费  2: 课程预约
      render: (bustype: any) => businessTypeHash[bustype],
    },

    {
      title: '交易号',
      dataIndex: 'payordercode',
      width: 120,
    },
    {
      title: '订单类型',
      width: 120,
      dataIndex: 'ordertype', //1:冻结支付  2：到账支付  3：线下支付
      render: (ordertype: any) => orderTypeHash[ordertype],
    },
    {
      title: '支付方式',
      width: 80,
      dataIndex: 'payaccouttype',
      render: (payaccouttype: any) => payTypeHash[payaccouttype],
    },
    {
      title: '订单金额',
      width: 100,
      dataIndex: 'payprice',
      render: (payprice: any) => {
        return payprice || payprice === 0 ? Number(payprice).toFixed(2) : '';
      },
    },
    {
      title: '已结算金额',
      width: 90,
      dataIndex: 'settlementamout',
      render: (settlementamout: any) => {
        return settlementamout || settlementamout === 0 ? Number(settlementamout).toFixed(2) : '';
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_date',
      width: 160,
    },
    {
      title: '备注',
      dataIndex: 'note',
      width: 120,
    },
    {
      title: '操作',
      width: 120,
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId="financial/studentOrder:btn1"
            onClick={() => {
              _switchDetailsVisible();
              setCurrentId(_get(record, 'id'));
              setCurrentRecord(record);
            }}
            className="operation-button"
          >
            详情
          </AuthButton>
          {_get(record, 'paystatus', '') === 0 &&
          _get(record, 'bustype', '') === '1' && ( //报名缴费同时待支付才允许改价
              <AuthButton
                authId="financial/studentOrder:btn2"
                onClick={() => {
                  setCurrentRecord(record);
                  _switchUpdatePriceVisible();
                }}
                className="operation-button"
              >
                改价
              </AuthButton>
            )}
        </div>
      ),
    },
  ];

  const commonQuery = {
    page: pagination.current,
    limit: pagination.pageSize,
    sid: isFromStudentInfo ? sid : _get(search, 'sid'),
  };
  const query = isFromStudentInfo
    ? commonQuery
    : {
        ...commonQuery,
        paystatus: _get(search, 'paystatus'),
        bustype: _get(search, 'bustype'),
        ordercode: _get(search, 'ordercode'),
        payordercode: _get(search, 'payordercode'),
        sname: _get(search, 'sname'),
        stuidnum: _get(search, 'stuidnum'),
        payaccouttype: _get(search, 'payaccouttype'),
        ordertype: _get(search, 'ordertype'),
        datebegin: _get(search, 'datebegin'),
        dateend: _get(search, 'dateend'),
        stubankaccount: _get(search, 'stubankaccount'),
      };

  const { isLoading, data } = useFetch({
    request: _getInfo,
    query: query,
    depends: [ignore, pagination.current, pagination.pageSize, bustype],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  const loadData = async () => {
    let list: any = {};
    Promise.all(
      orderTypeList.map((item: any) => {
        return _getCode({ codeType: 'order_type', parentCodeKey: item.value });
      }),
    )
      .then((res) => {
        orderTypeList.forEach((el: any, index: number) => {
          if (_get(res[index], 'data.length', 0) > 0) {
            // el['isLeaf'] = false;
            el['children'] = _get(res[index], 'data').map((e: any) => {
              list[e.value] = e.text;
              return { value: e.value, label: e.text };
            });
          } else {
            // el['isLeaf'] = true;
          }
        });
        return orderTypeList;
      })
      .then((resp) => {
        setOrderTypeHash(list);
        setOrderType(resp);
      });
  };

  useEffect(() => {
    orderTypeList.length && loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderTypeList.length]);

  return (
    <div>
      {detailsVisible && (
        <Details onCancel={_switchDetailsVisible} currentId={currentId} currentRecord={currentRecord} />
      )}
      {updatePriceVisible && (
        <UpdatePrice
          onOk={() => {
            _switchUpdatePriceVisible();
            forceUpdate();
          }}
          onCancel={_switchUpdatePriceVisible}
          currentRecord={currentRecord}
        />
      )}
      {!isFromStudentInfo && (
        <div>
          <Search
            loading={isLoading}
            filters={[
              { type: 'Input', field: 'ordercode', placeholder: '订单号' },
              {
                type: 'SimpleSelectOfStudent',
                field: 'sid',
              },
              // {
              //   type: 'Select',
              //   field: 'ordertype',
              //   options: [{ label: '订单类型(全部)', value: '' }, ...orderType],
              // },
              {
                type: 'Cascader',
                field: 'ordertype',
                options: [...orderType],
                otherProps: {
                  multiple: true,
                  placeholder: '请选择订单类型',
                },
              },
              {
                type: 'RangePicker',
                field: ['datebegin', 'dateend'],
                placeholder: ['创建日期起', '创建日期止'],
              },
              {
                type: 'Select',
                field: 'paystatus',
                options: [{ label: '订单状态(全部)', value: '' }, ...payStatus],
              },
              { type: 'Input', field: 'stubankaccount', placeholder: '学员电子账户' },
            ]}
            search={search}
            _handleSearch={_handleSearch}
            refreshTable={() => {
              if (
                _get(search, 'datebegin') &&
                _get(search, 'dateend') &&
                moment(_get(search, 'datebegin')).year() !== moment(_get(search, 'dateend')).year()
              ) {
                message.error('选择日期不能跨年');
              } else {
                forceUpdate();
                setPagination({ ...pagination, current: 1 });
              }
            }}
            simpleStudentRequest={_getStudentList}
          />
          <div className="mb20">
            <Radio.Group
              defaultValue=""
              buttonStyle="solid"
              onChange={(e: any) => {
                _handleSearch('bustype', e.target.value);
                setBustype(e.target.value);
                setPagination({ ...pagination, current: 1 });
                forceUpdate();
              }}
            >
              <Radio.Button value="">全部</Radio.Button>
              <Radio.Button value="1">报名缴费</Radio.Button>
              <Radio.Button value="2">课程预约</Radio.Button>
            </Radio.Group>
          </div>
        </div>
      )}

      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey="id"
        pagination={tablePagination}
        scroll={{ x: 1600, y: document.body?.clientHeight - 460 }}
      />
    </div>
  );
}

export default StudentOrder;
