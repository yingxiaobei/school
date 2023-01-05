// 报审补录
import { memo } from 'react';
import { DatePicker, Form, Row, InputNumber, Tooltip, message } from 'antd';
import moment from 'moment';
import styles from './index.module.css';
import { ItemCol } from 'components';
import { QuestionCircleOutlined } from '@ant-design/icons';

function ApplicationForReview() {
  function disabledDate(current: any) {
    // NOTE: 无法选择当天之后的日子
    return current && current > moment().endOf('day');
  }

  return (
    <>
      <Row>
        <ItemCol span={12} label="第一部分报审日期" name="firstPartTime">
          <DatePicker className={styles['datePicker']} allowClear disabledDate={disabledDate} />
        </ItemCol>
      </Row>
      <Row>
        <ItemCol span={12} label="第二部分报审日期" name="secondPartTime">
          <DatePicker className={styles['datePicker']} allowClear disabledDate={disabledDate} />
        </ItemCol>
        <ItemCol span={11} label="里程(公里)" name="secondPartMileage">
          <InputNumber type="number" min={0} style={{ width: 200 }} precision={1} />
        </ItemCol>
        <ItemCol span={1}>
          <Tooltip placement="bottom" title={'培训记录单上展示的里程'}>
            <QuestionCircleOutlined />
          </Tooltip>
        </ItemCol>
      </Row>
      <Row>
        <ItemCol span={12} label="第三部分报审日期" name="thirdPartTime">
          <DatePicker className={styles['datePicker']} allowClear disabledDate={disabledDate} />
        </ItemCol>
        <ItemCol span={11} label="里程(公里)" name="thirdPartMileage">
          <InputNumber type="number" style={{ width: 200 }} precision={1} min={0} />
        </ItemCol>
        <ItemCol span={1}>
          <Tooltip placement="bottom" title={'培训记录单上展示的里程'}>
            <QuestionCircleOutlined />
          </Tooltip>
        </ItemCol>
      </Row>
      {/* <Form.ItemCol label="第二部分报审日期" name={'secondPartTime'}>
        <DatePicker className={styles['datePicker']} allowClear disabledDate={disabledDate} />
      </Form.ItemCol>
      <Form.ItemCol label="第三部分报审日期" name={'thirdPartTime'}>
        <DatePicker className={styles['datePicker']} allowClear disabledDate={disabledDate} />
      </Form.ItemCol> */}
      <Row>
        <ItemCol span={12} label="第四部分报审日期" name="fourthPartTime">
          <DatePicker className={styles['datePicker']} allowClear disabledDate={disabledDate} />
        </ItemCol>
      </Row>
    </>
  );
}

export default memo(ApplicationForReview);
