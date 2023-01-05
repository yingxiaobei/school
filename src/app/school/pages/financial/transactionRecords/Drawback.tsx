import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Input, Button, message } from 'antd';
import { _get } from 'utils';
import { _refundOrder } from './_api';
import { useFetch, useRequest } from 'hooks';
import { useForm } from 'antd/es/form/Form';

interface IProps {
  visible: boolean;
  record: any;
  handleCancel: () => void;
  handleOk: () => void;
}
const Drawback = (props: IProps) => {
  const { visible, record, handleCancel, handleOk } = props;
  const [form] = useForm();
  const [maxNum, setmaxNum] = useState(0);
  const [disable, setDisable] = useState(false);
  const { loading, run } = useRequest(_refundOrder, {
    onSuccess: () => {
      handleOk();
      Modal.success({
        content: '操作成功',
        title: '退款成功',
      });
    },
    onFail: (res) => {
      res.includes('超过180天')
        ? message.error('退款失败：' + res)
        : Modal.error({
            title: '退款失败',
            content: '退款失败：' + res,
          });
    },
  });
  useEffect(() => {
    const num = Number(_get(record, 'awaitAmount', 0)) - Number(_get(record, 'refundAmount', 0));

    setmaxNum(Number(Number(num).toFixed(2)));
  }, [record]);

  return (
    <Modal
      visible={visible}
      title="退款"
      onCancel={handleCancel}
      destroyOnClose
      maskClosable={false}
      footer={[
        <Button
          key="submit"
          type="primary"
          disabled={disable}
          loading={loading}
          onClick={async () => {
            form.validateFields().then((res) => {
              res.orderId = _get(record, 'orderId', 0);
              res.payFlowId = _get(record, 'payFlowId', 0);
              run({ ...res });
            });
          }}
        >
          确定
        </Button>,
      ]}
    >
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        preserve={false}
        form={form}
        onValuesChange={(changedFields, allFields) => {
          if (Object.keys(changedFields).includes('returnAmt')) {
            changedFields['returnAmt'] > maxNum ? setDisable(true) : setDisable(false);
          }
        }}
      >
        <Form.Item label="银行流水号">{_get(record, 'tradeNo')}</Form.Item>
        <Form.Item label="交易金额"> {_get(record, 'awaitAmount')}</Form.Item>
        <Form.Item label="交易时间"> {_get(record, 'transTime')}</Form.Item>
        <Form.Item
          label="退款金额"
          name="returnAmt"
          rules={[
            { required: true, message: '请输入退款金额！' },
            {
              type: 'number',
              min: 0,
              max: maxNum,
            },
          ]}
        >
          <InputNumber placeholder={'<=' + maxNum} precision={2} />
        </Form.Item>
        <Form.Item label="备注" name="memo" rules={[{ required: true, message: '请输入备注！' }]}>
          <Input.TextArea maxLength={20} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default Drawback;
