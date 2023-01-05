import { Button, Modal } from 'antd';
import { PRIMARY_COLOR } from 'constants/styleVariables';

interface EquipmentPhotosWarmTipsProps {
  okCallback: () => void;
  cancelCallback: () => void;
  loading: boolean;
}

export default function EquipmentPhotosWarmTips({ okCallback, cancelCallback, loading }: EquipmentPhotosWarmTipsProps) {
  return (
    <Modal visible footer={null} closable onCancel={cancelCallback} maskClosable={false}>
      <h3 style={{ fontWeight: 'bold' }}>温馨提醒</h3>
      <ul style={{ paddingLeft: 20, marginBottom: 20 }}>
        <li>获取设备照片前，请保证设备已经开机，网络畅通。</li>
        <li>获取照片需要一定时间，请耐心等待。</li>
        <li>
          理论或模拟设备需要升级到<span style={{ color: PRIMARY_COLOR }}>1.3.35</span>以上才能获取，且一天只能获取一次。
        </li>
        <li>设备、车牌号、设备手机号要与培训时的绑定关系一致。否则无法拉取。</li>
      </ul>
      <Button
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        type={'primary'}
        onClick={okCallback}
        loading={loading}
      >
        知道了
      </Button>
    </Modal>
  );
}
