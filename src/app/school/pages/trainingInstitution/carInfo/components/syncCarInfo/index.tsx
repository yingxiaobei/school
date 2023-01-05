import { Modal, Button } from 'antd';
import SyncInfoContent from './SyncInfoContent';

interface Props {
  visible: boolean;
  switchVisible: (visible: boolean) => void;
  onSuccess: () => void;
}

function SyncCarInfo({ visible, switchVisible, onSuccess }: Props) {
  return (
    <Modal
      title={'同步车辆信息'}
      onCancel={() => switchVisible(false)}
      visible={visible}
      maskClosable={false}
      footer={[
        <Button
          key="confirm"
          type="primary"
          onClick={() => {
            switchVisible(false);
          }}
        >
          {'确定'}
        </Button>,
      ]}
      destroyOnClose
    >
      <SyncInfoContent onSuccess={onSuccess} />
    </Modal>
  );
}

export default SyncCarInfo;
