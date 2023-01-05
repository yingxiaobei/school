import React from 'react';
import { CustomTable } from 'components';
import { Drawer, Button } from 'antd';
import { _selectOrder } from './_api';
import { useTablePagination, useFetch, useHash, useOptions } from 'hooks';
import { _get } from 'utils';

interface IProps {
  visible: boolean;
  payFlowId: string;
  handleOk: () => void;
}

const Record = (props: IProps) => {
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const { visible, payFlowId, handleOk } = props;
  const settleStatusOpt = useHash('bill_end_status_type');
  const statusOpt = useHash('trade_status_type');

  const { isLoading, data } = useFetch({
    request: _selectOrder,
    query: {
      oldPayFlowId: payFlowId,
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    },
    depends: [pagination.current, pagination.pageSize, payFlowId],
    callback: async (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
    forceCancel: !visible,
  });
  const columns = [
    {
      title: '序列号',
      width: 80,
      dataIndex: 'orderReturnId',
    },
    {
      title: '银行流水号',
      width: 80,
      dataIndex: 'tradeNo',
    },
    {
      title: '退款金额',
      width: 40,
      dataIndex: 'awaitAmount',
    },
    {
      title: '退款状态',
      width: 40,
      dataIndex: 'status',
      render: (text: number) => statusOpt[text],
    },
    {
      title: '入账状态',
      width: 40,
      dataIndex: 'settleStatus',
      render: (text: number) => settleStatusOpt[text],
    },
    {
      title: '失败原因',
      width: 100,
      dataIndex: 'instMessage',
    },
    {
      title: '备注',
      width: 80,
      dataIndex: 'memo',
    },
    {
      title: '退款时间',
      width: 80,
      dataIndex: 'createdTime',
    },
  ];
  return (
    <Drawer
      visible={visible}
      title="订单退款详情"
      onClose={handleOk}
      maskClosable={false}
      footer={
        <Button key="submit" type="primary" onClick={handleOk}>
          确定
        </Button>
      }
      width="1200px"
    >
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'content', [])}
        rowKey="id"
        pagination={tablePagination}
        scroll={{ x: 1000, y: document.body?.clientHeight - 460 }}
      />
    </Drawer>
  );
};

export default Record;
