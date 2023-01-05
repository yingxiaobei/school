import { Modal, Button } from 'antd';
import SyncInfoContent from './SyncInfoContent';

interface Props {
  visible: boolean;
  switchVisible: (visible: boolean) => void;
  onSuccess: () => void;
}

function SyncCoachInfo({ visible, switchVisible, onSuccess }: Props) {
  return (
    <Modal
      title={'同步教练信息'}
      onCancel={() => switchVisible(false)}
      visible={visible}
      maskClosable={false}
      footer={[
        <Button
          type="primary"
          key="confirm"
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

export default SyncCoachInfo;
