import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import React from 'react';

const { confirm } = Modal;

interface IParams {
  handleOk?(): void;
  title?: string | React.ReactNode;
  content?: React.ReactNode;
  icon?: React.ReactNode;
  okText?: string;
  okType?: 'primary';
  cancelText?: string;
}

export function useConfirm() {
  return [_showConfirm];

  function _showConfirm({
    handleOk,
    title = '确定要删除这条数据吗？',
    content = '',
    icon = <ExclamationCircleOutlined />,
    okText = '确定',
    okType = 'primary',
    cancelText = '取消',
  }: IParams) {
    confirm({
      title,
      icon,
      content,
      okText,
      okType,
      cancelText,
      onOk() {
        handleOk && handleOk();
      },
    });
  }
}
