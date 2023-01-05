import { useContext } from 'react';
import { Drawer, Tabs } from 'antd';
import GlobalContext from 'globalContext';
import Info from './Info';
import TransactionRecordsTable from 'app/school/pages/financial/transactionRecords/TransactionRecordsTable';
import { useTablePagination } from 'hooks';
const { TabPane } = Tabs;

const Details = (props: { onCancel: () => void; currentId: any; currentRecord: any; type: string }) => {
  const { onCancel, currentId, type = 'sale' } = props;
  const { $elementAuthTable } = useContext(GlobalContext);
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  return (
    <Drawer visible width={1300} title={'增值订单详情'} maskClosable={false} onClose={onCancel} footer={null}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="订单详情" key="1">
          <Info id={currentId} type={type} />
        </TabPane>
        {(type === 'sale' && $elementAuthTable['valueAddOrder/saleByMe:btn3']) ||
        (type === 'sold' && $elementAuthTable['valueAddOrder/soldByMe:btn3']) ? (
          <TabPane tab="交易记录" key="2">
            <TransactionRecordsTable
              query={{
                orderId: currentId,
                page: pagination.current,
                limit: pagination.pageSize,
              }}
              pagination={pagination}
              setPagination={setPagination}
              tablePagination={tablePagination}
              type={type}
            ></TransactionRecordsTable>
          </TabPane>
        ) : null}
      </Tabs>
    </Drawer>
  );
};

export default Details;
