import { Modal } from 'antd';
import { PUBLIC_URL } from 'constants/env';
import { downloadURL } from 'utils';

export default function NoCardSoftWare(props: any) {
  const { onCancel } = props;

  return (
    <Modal
      getContainer={false}
      visible
      width={800}
      maskClosable={false}
      okText={'确定'}
      onCancel={onCancel}
      title="安装远方学车读卡程序"
      onOk={onCancel}
      footer={null}
    >
      <div>
        无法进行身份证绑定。
        <br />
        如您已安装，请启动远方学车读卡程序，再次使用本功能。
        <br />
        如您未安装，请点击
        {
          <span
            className="color-primary pointer"
            onClick={() => downloadURL({ url: `${PUBLIC_URL}package.zip`, filename: 'package.zip' })}
          >
            下载
          </span>
        }
        ，安装并启动程序后，再使用本功能。
        <br />
      </div>
    </Modal>
  );
}
