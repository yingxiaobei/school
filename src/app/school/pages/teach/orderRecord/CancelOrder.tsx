import { Modal, Form, Input } from 'antd';
import { _cancelOrder } from './_api';
import { _get } from 'utils';
import { RULES } from 'constants/rules';
import { useBulkStatisticsResult, useInfo } from 'hooks';
import { BatchProcessResult } from 'components';

export default function CancelOrder(props: any) {
  const { onCancel, onOk, selectedData } = props;
  const [form] = Form.useForm();
  const [_showInfo] = useInfo();
  const { loading, run } = useBulkStatisticsResult(_cancelOrder, {
    onOk: (data) => {
      const { total, errorTotal, errHashList } = data;
      _showInfo({
        content: (
          <BatchProcessResult
            total={total}
            successTotal={total - errorTotal}
            errorTotal={errorTotal}
            errHashList={errHashList}
          />
        ),
      });
      onOk();
    },
  });

  return (
    <>
      <Modal
        visible
        width={600}
        title={'取消预约'}
        maskClosable={false}
        onCancel={onCancel}
        confirmLoading={loading}
        onOk={() => {
          form.validateFields().then(async (values) => {
            run(selectedData, {
              otherParams: { cancelNote: _get(values, 'cancelNote') },
              priKeyValMap: [
                { key: 'skuIds', value: 'plan_id' },
                { key: 'sid', value: 'sid' },
                { key: 'traincode', value: 'traincode' },
                { key: 'skuschoolid', value: 'schoolid' },
                { key: 'stuschoolid', value: 'stuschoolid' },
              ],
              customHeader: { withFeedback: false },
            });
            // let res = await _cancelOrder({
            //   skuIds: skuId,
            //   cancelNote: _get(values, 'cancelNote'),
            //   sid: _get(selectedData, '0.sid'),
            //   traincode: _get(selectedData, '0.traincode'),
            //   skuschoolid: _get(selectedData, '0.schoolid'),
            //   stuschoolid: _get(selectedData, '0.stuschoolid'),
            // });
            // if (_get(res, 'code') === 200) {
            //   onOk();
            // }
          });
        }}
      >
        <Form form={form} autoComplete="off" labelCol={{ span: 6 }} wrapperCol={{ span: 8 }}>
          <Form.Item
            label="取消原因"
            name="cancelNote"
            rules={[{ whitespace: true, required: true, message: '请输入取消原因' }, RULES.CANCEL_NOTE]}
          >
            <Input.TextArea></Input.TextArea>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
