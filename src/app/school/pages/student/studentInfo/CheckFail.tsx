import { useState } from 'react';
import { Modal, Input, message } from 'antd';
import { _checkStudent } from './_api';
import { useRequest } from 'hooks';

interface IProps {
  onCancel(): void;
  onOk(): void;
  currentId: any;
}

export default function CheckFail(props: IProps) {
  const { onCancel, onOk, currentId } = props;
  const [memo, setMemo] = useState('');

  function _handleChange(e: any) {
    setMemo(e.target.value);
  }

  const { loading: confirmLoading, run } = useRequest(_checkStudent, {
    onSuccess: onOk,
  });

  return (
    <Modal
      // getContainer={false}
      visible
      title={'审核失败原因'}
      maskClosable={false}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={() => {
        if (!memo.trim()) {
          message.error('请输入失败原因');
          return;
        }
        run({ sid: currentId, checkstatus: '1', checkmemo: memo }); // checkstatus:'1'代表审核失败
      }}
    >
      <Input placeholder={'请输入失败原因'} onChange={_handleChange} />
    </Modal>
  );
}
