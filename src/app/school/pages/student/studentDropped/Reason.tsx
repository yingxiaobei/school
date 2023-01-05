import { useState } from 'react';
import { Modal, Input, Form, Row, Select } from 'antd';
import { _addStudentRetire } from './_api';
import { ItemCol } from 'components';
import { _get } from 'utils';
import { useRequest, useOptions } from 'hooks';

export default function Reason(props: any) {
  const { onCancel, onOk, selectedRowKeys } = props;
  const [reason, setReason] = useState('');
  const { TextArea } = Input;
  const [form] = Form.useForm();
  const retireReasonOptions = useOptions('applymemo_code_type');

  function _handleChange(e: any): any {
    setReason(e.target.value);
  }

  const { loading: confirmLoading, run } = useRequest(_addStudentRetire, {
    onSuccess: onOk,
  });

  return (
    <Modal
      visible
      title={'退学原因'}
      confirmLoading={confirmLoading}
      maskClosable={false}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then((values) => {
          const query = {
            applymemocode: _get(values, 'applymemocode'),
            sid: _get(selectedRowKeys, '0'),
            reason,
          };
          run(query);
        });
      }}
    >
      <Form form={form}>
        <Row>
          <ItemCol name="applymemocode" rules={[{ required: true, message: '请选择退学原因' }]}>
            <Select placeholder="请选择退学原因" options={retireReasonOptions} />
          </ItemCol>
        </Row>
      </Form>
      <TextArea placeholder={'请输入详细退学原因'} onChange={_handleChange} rows={4} />
    </Modal>
  );
}
