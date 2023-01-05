import Detail from './Detail';

export default function AddOrEdit(props: any) {
  const { onCancel, currentRecord, onOk } = props;
  return <Detail onCancel={onCancel} currentRecord={currentRecord} isEdit={true} onOk={onOk} />;
}
