import { useState } from 'react';
import { _get } from 'utils';
import { Modal, Form, DatePicker } from 'antd';
import { _addProtect, _updateProtect } from '../_api';
import moment from 'moment';

const { RangePicker } = DatePicker;

export default function AddOrEditProtect(props: any) {
  const { onCancel, onOk, currentRecord, isEdit, title, carid } = props;
  const [form] = Form.useForm();
  const [timeRange, setTimeRange] = useState<any>([
    moment(_get(currentRecord, 'starttime')),
    moment(_get(currentRecord, 'endtime')),
  ]);

  return (
    <Modal
      visible
      title={title}
      maskClosable={false}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then(async (values) => {
          const query = {
            carid,
            starttime: _get(timeRange, '0') ? _get(timeRange, '0').format('YYYY-MM-DD') : '',
            endtime: _get(timeRange, '1') ? _get(timeRange, '1').format('YYYY-MM-DD') : '',
          };
          const res = isEdit
            ? await _updateProtect({ ...query, id: _get(currentRecord, 'id') })
            : await _addProtect(query);
          if (_get(res, 'code') === 200) {
            onOk();
          }
        });
      }}
    >
      <Form form={form} autoComplete="off" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <RangePicker
          placeholder={['维护开始时间', '维护到期时间']}
          defaultValue={timeRange}
          allowClear={false}
          onChange={(dates: any) => {
            setTimeRange(dates);
          }}
        />
      </Form>
    </Modal>
  );
}
