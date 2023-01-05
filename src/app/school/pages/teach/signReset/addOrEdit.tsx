import { Modal, Input, message } from 'antd';
import { _noResetList } from './_api';
import { _get } from 'utils';

export default function AddOrEdit(props: any) {
  const { onCancel, onOk, setIdCard, idCard, type } = props;

  return (
    <Modal
      visible
      title={'复位'}
      maskClosable={false}
      onCancel={onCancel}
      onOk={async () => {
        if (!idCard) {
          message.error('证件号码不能为空');
          return;
        }
        const res = await _noResetList({ idcard: idCard, type });
        if (_get(res, 'code') === 200) {
          onOk();
        } else {
          message.error(_get(res, 'message'));
        }
      }}
    >
      <Input placeholder="请输入证件号码" onChange={(e: any) => setIdCard(e.target.value)} />
    </Modal>
  );
}
