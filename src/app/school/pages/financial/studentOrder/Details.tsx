import { Modal, Form, Row, Tabs } from 'antd';
import { useFetch, useTablePagination, useHash, useForceUpdate } from 'hooks';
import { _getDetails } from './_api';
import { _get } from 'utils';
import { ItemCol, Loading } from 'components';
import CommodityInformation from './CommodityInformation';
import SettlementRecordsTable from 'app/school/pages/financial/settlementRecords/SettlementRecordsTable';
import TransactionRecordsTable from 'app/school/pages/financial/transactionRecords/TransactionRecordsTable';
import OrderRecordTable from '../../teach/orderRecord/OrderRecordTable';

const { TabPane } = Tabs;

export default function Details(props: any) {
  const { onCancel, currentId } = props;
  const [form] = Form.useForm();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();

  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    request: _getDetails,
  });
  const businessTypeHash = useHash('business_type'); // 业务类型
  const orderTypeHash = useHash('order_type'); // 订单类型
  const payTypeHash = useHash('pay_type'); // 支付方式
  const payStatusHash = useHash('pay_status'); // 订单状态

  return (
    <Modal visible width={1100} title={'详情'} maskClosable={false} onCancel={onCancel} footer={null}>
      {isLoading && <Loading />}
      {!isLoading && (
        <Form form={form} autoComplete="off" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="订单详情" key="1">
              <Row>
                <ItemCol span={8} label="学员姓名">
                  {_get(data, 'sname')}
                </ItemCol>
                <ItemCol span={8} label="证件号">
                  {_get(data, 'stuidnum')}
                </ItemCol>
                <ItemCol span={8} label="业务类型">
                  {businessTypeHash[_get(data, 'bustype', '')]}
                </ItemCol>
              </Row>
              <Row>
                <ItemCol span={8} label="交易号">
                  {_get(data, 'payordercode')}
                </ItemCol>
                <ItemCol span={8} label="订单类型">
                  {orderTypeHash[_get(data, 'ordertype', '')]}
                </ItemCol>
                <ItemCol span={8} label="支付方式">
                  {payTypeHash[_get(data, 'payaccouttype', '')]}
                </ItemCol>
              </Row>
              <Row>
                <ItemCol span={8} label="订单金额">
                  {_get(data, 'payprice')}
                </ItemCol>
                <ItemCol span={8} label="实付金额">
                  {_get(data, 'realpayprice')}
                </ItemCol>
                <ItemCol span={8} label="已结算金额">
                  {_get(data, 'settlementamout')}
                </ItemCol>
                <ItemCol span={8} label="订单状态">
                  {payStatusHash[_get(data, 'paystatus', '')]}
                </ItemCol>
              </Row>
              <Row>
                <ItemCol span={8} label="备注">
                  {_get(data, 'note')}
                </ItemCol>
                {Number(_get(data, 'paystatus', 0)) === 3 && ( // 3:已取消
                  <ItemCol span={8} label="取消原因">
                    {_get(data, 'note')}
                  </ItemCol>
                )}
                <ItemCol span={8} label="支付时间">
                  {_get(data, 'pay_date')}
                </ItemCol>
                <ItemCol span={8} label="创建时间">
                  {_get(data, 'create_date')}
                </ItemCol>
                <ItemCol span={8} label="更新时间">
                  {_get(data, 'update_date')}
                </ItemCol>
              </Row>
            </TabPane>

            <TabPane tab="商品信息" key="2">
              <CommodityInformation orderitemids={_get(data, 'orderitemids')} />
            </TabPane>
            {
              <TabPane tab="交易记录" key="3">
                <TransactionRecordsTable
                  query={{
                    orderId: _get(data, 'ordercode', ''),
                    // payFlowId: _get(data, 'payordercode'),
                    transType: '3', // 3:冻结类型交易记录 6:充值类型交易记录
                    page: pagination.current,
                    limit: pagination.pageSize,
                  }}
                  pagination={pagination}
                  setPagination={setPagination}
                  tablePagination={tablePagination}
                />
              </TabPane>
            }

            <TabPane tab="结算记录" key="4">
              <SettlementRecordsTable
                query={{
                  idNumber: _get(data, 'stuidnum'),
                  orderCode: _get(data, 'ordercode'),
                  currentPage: pagination.current,
                  pageSize: pagination.pageSize,
                }}
                pagination={pagination}
                setPagination={setPagination}
                tablePagination={tablePagination}
                ignore={ignore}
                forceUpdate={forceUpdate}
                type="studentOrder"
              />
            </TabPane>

            {
              //课程预约的订单不显示该tab栏目
              String(_get(data, 'bustype')) !== '2' && (
                <TabPane tab="预约记录" key="5">
                  <OrderRecordTable
                    query={{
                      page: pagination.current,
                      limit: pagination.pageSize,
                      order_code: _get(data, 'ordercode', ''),
                      sid: _get(data, 'sid', ''),
                    }}
                    pagination={pagination}
                    setPagination={setPagination}
                    tablePagination={tablePagination}
                  />
                </TabPane>
              )
            }
          </Tabs>
        </Form>
      )}
    </Modal>
  );
}
