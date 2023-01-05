import { useState } from 'react';
import { Modal, InputNumber, Form, message } from 'antd';
import { _get } from 'utils';
import { _getChangeDetail, _ChangePrice } from './_api';
import { useFetch, useRequest } from 'hooks';
import { CustomTable } from 'components';

function UpdatePrice(props: any) {
  const { onCancel, currentRecord, onOk } = props;
  const [list, setList] = useState<any>([]);
  const [form] = Form.useForm();
  const [totalAmount, setTotalAmount] = useState(0);
  function _handleChange(record: any, index: number, value: any, field: string) {
    list[index][field] = value;
    setList([...list]);
    total = list.reduce((pre: number, cur: any) => {
      return Number(_get(cur, 'price', 0)) + pre;
    }, 0);
    setTotalAmount(total);
  }
  let total = 0;
  const { isLoading } = useFetch({
    request: _getChangeDetail,
    query: {
      orderid: _get(currentRecord, 'id', ''),
      order_code: _get(currentRecord, 'ordercode', ''),
      sid: _get(currentRecord, 'sid', ''),
    },
    callback: (data: any) => {
      setList(data.map((val: any, index: any) => ({ ...val, oldPrice: data[index]['price'] })));
      total = data.reduce((pre: number, cur: any) => {
        return cur.price + pre;
      }, 0);
      setTotalAmount(total);
    },
  });

  const { loading: confirmLoading, run } = useRequest(_ChangePrice, {
    onSuccess: onOk,
  });

  const columns = [
    {
      title: '商品',
      dataIndex: 'productName',
      width: 100,
    },
    {
      title: '规格属性',
      dataIndex: 'subject',
      width: 80,
    },
    {
      title: '数量',
      dataIndex: 'productNum',
      width: 60,
    },
    {
      title: '定价区间',
      dataIndex: 'price_',
      width: 80,
      render: (_: any, record: any, index: number) => {
        return _get(record, 'pricedown', 0) + '-' + _get(record, 'priceup', 0);
      },
    },
    {
      title: '价格',
      width: 150,
      dataIndex: 'price',
      render: (price: any, record: any, index: number) => {
        return (
          <div>
            <Form form={form}>
              <InputNumber
                style={{ width: 150 }}
                value={price}
                onChange={(val) => {
                  _handleChange(record, index, val, 'price');
                }}
                type="number"
              />
            </Form>
          </div>
        );
      },
    },
  ];

  return (
    <Modal
      visible
      width={700}
      centered
      title={'改价'}
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      onOk={() => {
        if (
          list.some((x: any) => {
            return _get(x, 'price') > _get(x, 'priceup') || _get(x, 'price') < _get(x, 'pricedown');
          })
        ) {
          message.error('价格超过定价区间，请重新输入');
          return;
        }
        form.validateFields().then(async () => {
          const query = {
            payprice: totalAmount, //修改后的价格
            sid: _get(currentRecord, 'sid', ''), //学员表主键
            order_code: _get(currentRecord, 'ordercode', ''), //订单代码   从订单中心获取主键
            orderid: _get(currentRecord, 'id', ''),
            list: list, //明细列表
          };
          run(query);
        });
      }}
    >
      <div>订单金额：{totalAmount}</div>
      <CustomTable
        columns={columns}
        bordered
        loading={isLoading}
        dataSource={list}
        rowKey={(record: any) => _get(record, 'chargeid')}
        pagination={false}
      />
    </Modal>
  );
}

export default UpdatePrice;
