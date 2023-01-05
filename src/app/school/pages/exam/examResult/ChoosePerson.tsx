import { Modal, Alert } from 'antd';

interface IProps {
  onCancel(): void;
  studentList: object[];
  setStudentData(studentData: object | null): void;
}

export default function ChoosePerson(props: IProps) {
  const { onCancel, studentList, setStudentData } = props;

  return (
    <Modal visible title={'选择人员'} maskClosable={false} onCancel={onCancel} footer={null}>
      {/* TODO: TS */}
      {studentList.map((item: any, index: number) => {
        return (
          <div
            onClick={() => {
              setStudentData(item);
              onCancel();
            }}
            key={index}
            style={{ marginBottom: 10 }}
          >
            <Alert message={`${item.name} ${item.traintype}`} type="info" />
          </div>
        );
      })}
    </Modal>
  );
}
