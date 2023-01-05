import { Modal } from 'antd';

export default function Reason() {
  return (
    <Modal visible maskClosable={false} footer={null} closable={false} width={280}>
      监管平台接收速度限制，请耐心等待
    </Modal>
  );
}
