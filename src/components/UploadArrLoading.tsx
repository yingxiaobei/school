import { Modal } from 'antd';

export default function Reason(props: { message: string }) {
  //  const a= 监管平台接收速度限制，请耐心等待
  const { message = '正在批量审核中，请耐心等待' } = props;
  return (
    <Modal visible maskClosable={false} footer={null} closable={false} width={280}>
      {message}
    </Modal>
  );
}
