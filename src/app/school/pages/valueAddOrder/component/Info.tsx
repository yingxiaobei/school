import React from 'react';
import { Form, Row } from 'antd';
import { ItemCol, Loading } from 'components';
import { useFetch, useHash } from 'hooks';
import { _get } from 'utils';
import saleByMe from './api';
import soldByMe from '../soldByMe/api';
interface Iprops {
  id: string;
  type: string;
}
const Info = (props: Iprops) => {
  const payStatusHash = useHash('order_retail_pay_status'); // 订单状态
  const [form] = Form.useForm();
  const { id, type = '' } = props;
  const { _getDetail } = type === 'sold' ? soldByMe : saleByMe;
  const { isLoading, data } = useFetch({
    request: _getDetail,
    query: { id: id },
    depends: [id],
  });
  return (
    <div>
      {isLoading && <Loading />}

      <Form form={form} autoComplete="off" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
        <Row>
          <ItemCol span={6} label="学员姓名">
            {_get(data, 'userName')}
          </ItemCol>
          <ItemCol span={6} label="证件号">
            {_get(data, 'acctId')}
          </ItemCol>
          <ItemCol span={6} label="业务类型">
            {_get(data, 'resourceId')}
          </ItemCol>
          <ItemCol span={6} label="订单类型">
            {_get(data, 'orderBusType')}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={6} label="支付方式">
            {_get(data, 'payFactory')}
          </ItemCol>
          <ItemCol span={6} label="订单金额">
            {_get(data, 'orderPrice')}
          </ItemCol>
          <ItemCol span={6} label="实付金额">
            {_get(data, 'paymentAmount')}
          </ItemCol>
          <ItemCol span={6} label="订单状态">
            {payStatusHash[_get(data, 'payStatus')]}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={6} label="备注">
            {_get(data, 'memo')}
          </ItemCol>
          <ItemCol span={6} label="取消原因">
            {_get(data, 'cancelReason')}
          </ItemCol>
          <ItemCol span={6} label="支付时间">
            {_get(data, 'paymentTime')}
          </ItemCol>
          <ItemCol span={6} label="创建时间">
            {_get(data, 'createdTime')}
          </ItemCol>
        </Row>
        <Row>
          <ItemCol span={6} label="更新时间">
            {_get(data, 'updatedTime')}
          </ItemCol>

          {type === 'sold' && (
            <ItemCol span={6} label="模拟器名称">
              {_get(data, 'mniName')}
            </ItemCol>
          )}
        </Row>
      </Form>
    </div>
  );
};

export default Info;
