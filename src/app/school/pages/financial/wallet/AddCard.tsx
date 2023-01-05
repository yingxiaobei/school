import { Modal } from 'antd';

interface IAddCardProps {
  onCancel(): void;
  onClick(): void;
}

function AddCard(props: IAddCardProps) {
  const { onCancel, onClick } = props;

  return (
    <Modal visible width={400} centered title={'添加银行卡'} maskClosable={false} onCancel={onCancel} footer={null}>
      <div className="text-center">
        <p onClick={onClick}>+添加银行卡</p>
      </div>
    </Modal>
  );
}

export default AddCard;
