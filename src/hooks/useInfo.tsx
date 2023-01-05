import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';

const { warn } = Modal;

interface IParams {
  handleOk?(): void;
  title?: string;
  content?: React.ReactNode;
  icon?: React.ReactNode;
  okText?: string;
  okType?: 'danger';
  cancelText?: string;
  maskClosable?: boolean;
}

export function useInfo() {
  return [_showInfo];

  function _showInfo({
    handleOk,
    title = '提示信息',
    content = '',
    icon = <ExclamationCircleOutlined />,
    okText = '确定',
    okType = 'danger',
    maskClosable = true,
  }: IParams) {
    warn({
      title,
      icon,
      content,
      okText,
      okType,
      maskClosable,
      onOk() {
        handleOk && handleOk();
      },
    });
  }
}
