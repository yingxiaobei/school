// 预约记录table

import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { _get, _handleIdCard } from 'utils';
import moment from 'moment';
import { _getCoaOrderList } from './_api';
import { useFetch, useHash, useVisible } from 'hooks';
import Detail from './Detail';
import { CustomTable } from 'components';

export default function OrderRecordTable(props: any) {
  const {
    query,
    ignore,
    isNeedRowSelect = false,
    pagination,
    setPagination,
    tablePagination,
    setSelectedData,
    setLoading,
    selectedRowKeys,
    setSelectedRowKeys,
  } = props;
  const [currentId, setCurrentId] = useState();
  const orderModeHash = useHash('order_mode');
  const subjectcodeHash = useHash('trans_part_type');
  const traincodeHash = useHash('combo'); // 课程类型
  const orderStatusHash = useHash('order_appoint_status');
  const orderCodeHash = useHash('yes_no_type');
  const [visible, _switchVisible] = useVisible();

  const columns = [
    {
      title: '姓名',
      width: 80,
      dataIndex: 'stuname',
    },
    {
      title: '证件号',
      width: 160,
      dataIndex: 'stuidcard',
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    // {
    //   title: '预约号',
    //   dataIndex: 'starttime',
    // },
    {
      title: '预约对象',
      width: 80,
      dataIndex: 'orderObject',
    },
    {
      title: '约课类型',
      width: 80,
      dataIndex: 'order_mode', // 1预约,2邀请,3 直接安排（随到随签） 新：1-学员自主预约,2-驾校约课, 3- 直接安排
      render: (order_mode: any) => orderModeHash[order_mode],
    },
    {
      title: '约课科目',
      width: 80,
      dataIndex: 'subjectcode', // 1-科目一 2-科目二 3-科目三 4- 科目四    0-科二与科三组合)
      render: (subjectcode: any) => subjectcodeHash[subjectcode],
    },
    {
      title: '课程日期',
      width: 130,
      dataIndex: 'plan_date',
    },
    {
      title: '课程时段',
      width: 130,
      dataIndex: '_', // endhourmin
      render: (_: any, record: any) =>
        moment().hour(_get(record, 'begin_hour', 0)).minute(_get(record, 'beginhourmin', 0)).format('HH:mm') +
        '-' +
        moment().hour(_get(record, 'end_hour', 0)).minute(_get(record, 'endhourmin', 0)).format('HH:mm'),
    },
    {
      title: '课程类型',
      width: 80,
      dataIndex: 'traincode',
      render: (traincode: any) => traincodeHash[traincode],
    },
    {
      title: '约课时间',
      width: 180,
      dataIndex: 'create_date',
    },
    {
      title: '课程价格',
      width: 80,
      dataIndex: 'sparring_price',
    },
    {
      title: '实付金额',
      width: 80,
      dataIndex: 'real_pay_price',
    },
    {
      title: '预约状态',
      width: 80,
      dataIndex: 'order_appoint_status', // 0待支付 1提交, 2已预约, 4(上车), 5(待评价), 6已评价, 7取消中，8已取消,9已删除,10已退款  先学后付:  0 待支付 1提交, 2已预约, 4上车, 5待评价, 6已评价,7取消中，8已取消 ,9已删除,10已退款  预支付模式:  0 待支付 1提交,	 2已预约(预付款已支付), 4(上车-未确认支付), 5(待评价-已确认支付),6已评价, 7取消中，8已取消,9已删除,10已退款
      render: (order_appoint_status: any) => orderStatusHash[order_appoint_status],
    },
    {
      title: '是否免单',
      width: 80,
      dataIndex: 'order_code',
      render: (order_code: any) => {
        if (order_code === '0') {
          return orderCodeHash[Number(order_code + 1)];
        }
        return orderCodeHash[0];
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 80,
      render: (_: any, record: any, index: any) => (
        <Button
          type="primary"
          ghost
          size="small"
          onClick={() => {
            _switchVisible();
            setCurrentId(_get(record, 'orderid', ''));
          }}
        >
          详情
        </Button>
      ),
    },
  ];
  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedData: any) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedData(selectedData);
    },
    selectedRowKeys,
  };
  const rowSelect: any = {
    type: 'checkbox',
    ...rowSelection,
  };
  const { data, isLoading } = useFetch({
    request: _getCoaOrderList,
    query: query,
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  useEffect(() => {
    if (!setLoading) {
      return;
    }
    setLoading && setLoading(isLoading);
  }, [isLoading, setLoading]);

  return (
    <>
      {visible && <Detail onCancel={_switchVisible} currentId={currentId} />}
      <CustomTable
        bordered
        pagination={tablePagination}
        columns={columns}
        loading={isLoading}
        rowSelection={isNeedRowSelect ? rowSelect : undefined}
        dataSource={_get(data, 'rows', [])}
        rowKey="orderid"
      />
    </>
  );
}
