import { Modal, Spin } from 'antd';

interface IProps {
  spinning?: boolean;
  [key: string]: any;
}

export default function IModal(props: IProps) {
  const { spinning = false, ...rest } = props;

  return (
    <Modal {...rest}>
      <Spin spinning={spinning}>{props.children}</Spin>
    </Modal>
  );
}
