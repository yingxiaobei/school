import { Button, Row } from 'antd';

type IProps = {
  handleAdd(): void;
  handleDelete(): void;
};

function ChangeButtons(props: IProps) {
  const { handleAdd, handleDelete } = props;

  return (
    <Row justify={'space-around'}>
      <Button type="primary" onClick={handleAdd}>
        添加
      </Button>
      <Button type="primary" onClick={handleDelete}>
        删除
      </Button>
    </Row>
  );
}

export default ChangeButtons;
