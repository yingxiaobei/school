import { useState } from 'react';
import { Modal, Form, Row, Button } from 'antd';
import { ItemCol, UploadFileCustomized } from 'components';
import OrderList from '../component/OrderList';
import { useFetch, useTablePagination, useForceUpdate, useHash } from 'hooks';
import { _getDetail } from './api';
import { _get, downloadURL } from 'utils';

const Details = (props: any) => {
  const { onCancel, currentId } = props;
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const verfiyStatusHash = useHash('withdraw_app_status');
  const withdrawStatusHash = useHash('school_withdraw_status');

  const query = {
    pageNum: pagination.current,
    pageSize: pagination.pageSize,
    withdrawAppId: currentId,
  };

  const { isLoading, data } = useFetch({
    request: _getDetail,
    query: { withrawApplyId: currentId },
    depends: [currentId],
  });

  return (
    <Modal
      visible
      width={1200}
      title="详情"
      maskClosable={false}
      okText={'确定'}
      onCancel={onCancel}
      getContainer={false}
      onOk={async () => {}}
    >
      <Form form={form} autoComplete="off" labelCol={{ span: 3 }} wrapperCol={{ span: 14 }}>
        <Row>
          <ItemCol span={12} label="申请编号">
            {_get(data, 'withrawApplyId')}
          </ItemCol>
          <ItemCol span={12} label="订单数">
            {_get(data, 'orderCount')}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={12} label="审核状态">
            {verfiyStatusHash[_get(data, 'verfiyStatus')]}
          </ItemCol>
          <ItemCol span={12} label="订单额">
            {_get(data, 'orderAmount')}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={12} label="提现状态">
            {withdrawStatusHash[_get(data, 'withdrawStatus')]}
          </ItemCol>
          <ItemCol span={12} label="审核说明">
            {_get(data, 'memo')}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={12} label="发票号码">
            {_get(data, 'receiptNo')}
          </ItemCol>
          <ItemCol span={12} label="发票文件">
            {_get(data, 'receiptFile', '') ? (
              <Button
                type="link"
                onClick={() => {
                  downloadURL({ url: _get(data, 'receiptFile'), filename: '发票文件' });
                }}
              >
                下载
              </Button>
            ) : null}
          </ItemCol>
        </Row>
      </Form>
      <OrderList
        ignore={ignore}
        pagination={pagination}
        setPagination={setPagination}
        tablePagination={tablePagination}
        selectedRowKeys={selectedRowKeys}
        setSelectedRowKeys={setSelectedRowKeys}
        query={query}
        check={false}
      />
    </Modal>
  );
};
export default Details;
