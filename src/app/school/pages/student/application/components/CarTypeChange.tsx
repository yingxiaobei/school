import { Form, Select } from 'antd';
import { _get } from 'utils';
import { StudentInfo } from './JGAddOrEdit';

const { Item } = Form;

interface CarTypeChangeProps {
  studentInfo: StudentInfo;
}

export default function CarTypeChange({ studentInfo }: CarTypeChangeProps) {
  return (
    <>
      <Item label={'现学驾车型'}>{_get(studentInfo, ['carType'], '')}</Item>
      <Item label={'修改后学驾车型'} name="carType" rules={[{ required: true }]}>
        <Select
          options={[
            { label: 'C1', value: 'C1' },
            { label: 'C2', value: 'C2' },
          ]}
        />
      </Item>
    </>
  );
}
