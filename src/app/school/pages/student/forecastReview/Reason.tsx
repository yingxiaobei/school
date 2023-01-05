import { useState } from 'react';
import { Modal, Input, message } from 'antd';
import { _updateByKeyForExam } from './_api';
import { useRequest } from 'hooks';

interface IProps {
  onReasonCancel(): void;
  onOk(): void;
  currentId: any;
}

export default function Reason(props: IProps) {
  const { onReasonCancel, onOk, currentId } = props;
  const [memo, setMemo] = useState('');

  function _handleChange(e: any) {
    setMemo(e.target.value);
  }

  const { loading: confirmLoading, run } = useRequest(_updateByKeyForExam, {
    onSuccess: onOk,
  });

  return (
    <Modal
      visible
      title={'审核失败原因'}
      maskClosable={false}
      confirmLoading={confirmLoading}
      onCancel={onReasonCancel}
      onOk={() => {
        if (!memo.trim()) {
          message.error('请输入失败原因');
          return;
        }
        run({ sid: currentId, checkstatus: '1', memo }); // checkstatus:'1'代表审核失败
      }}
    >
      <Input placeholder={'请输入失败原因'} onChange={_handleChange} />
    </Modal>
  );
}
