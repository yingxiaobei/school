import { DatePicker, Form, Select } from 'antd';
import moment from 'moment';
import { format } from 'util';
import { formatTime, _get } from 'utils';
import styles from './index.module.css';
import { StudentInfo } from './JGAddOrEdit';

const { Item } = Form;

interface ApplicationDateProps {
  studentInfo: StudentInfo;
}

export default function ApplicationDate({ studentInfo }: ApplicationDateProps) {
  return (
    <>
      <Item label={'学员报名日期'}>{formatTime(_get(studentInfo, ['applydate'], ''), 'DATE')}</Item>

      <Item label={'修改后报名日期'} name={'applydate'} required rules={[{ required: true }]}>
        <DatePicker className={styles['datePicker']} allowClear />
      </Item>
    </>
  );
}
