import { useState } from 'react';
import { Modal, Input, message } from 'antd';
import { _appeal } from './_api';
import { _get } from 'utils';

const { TextArea } = Input;

export default function Appeal(props: any) {
  const { onCancel, onOk, currentRecord } = props;
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(false);

  function _handleChange(e: any): any {
    setReason(e.target.value);
  }

  return (
    <Modal
      visible
      title={'申诉'}
      maskClosable={false}
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={async () => {
        if (!reason.trim()) {
          message.error('请输入申诉原因');
          return;
        }
        if (reason.length > 1024) {
          message.error('申诉原因长度不能超过1024个字符');
          return;
        }
        setLoading(true);
        const res = await _appeal({
          appealReason: reason,
          recnum: _get(currentRecord, 'recnum', ''),
          sid: _get(currentRecord, 'stuid', ''),
          subject: _get(currentRecord, 'subjectcode', ''),
        });

        if (_get(res, 'code') === 200) {
          onOk();
        }
        setLoading(false);
      }}
    >
      <TextArea rows={4} placeholder={'请输入申诉原因'} onChange={_handleChange} />
    </Modal>
  );
}
