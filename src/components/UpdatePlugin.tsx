import { Modal, Row } from 'antd';
import { PUBLIC_URL } from 'constants/env';
import { downloadURL } from 'utils';

interface IProps {
  onCancel(): void;
  info?: string;
  plugin?: string;
}

export default function UpdatePlugin(props: IProps) {
  const { onCancel, info = '', plugin = 'package.zip' } = props;
  const Download = (text: any) => (
    <span
      className="color-primary pointer"
      onClick={() => downloadURL({ url: `${PUBLIC_URL}${plugin}`, filename: plugin })}
    >
      {text}
    </span>
  );
  return (
    <Modal
      visible
      width={600}
      maskClosable={false}
      onCancel={onCancel}
      title="安装插件程序"
      onOk={onCancel}
      footer={null}
    >
      <Row>{info}</Row>
      <Row>如您已安装，请运行或{Download('更新安装程序')}后，再使用本功能</Row>
      <Row>如您未安装，请{Download('点击下载')}，安装并启动插件程序后，再使用本功能</Row>
    </Modal>
  );
}
