// 新增课程

import moment from 'moment';
import { Row, Form, Select, DatePicker, Modal, message } from 'antd';
import { _getTimeRule, _addSchedule } from './_api';
import { ItemCol } from 'components';
import { useFetch, useOptions, useRequest } from 'hooks';
import { PUBLIC_URL } from 'constants/env';
import { disabledDateAfterToday, formatTime, _get } from 'utils';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function AddCourse(props: any) {
  const { title, onCancel, onOk, currentRecord } = props;
  const [form] = Form.useForm();

  // FIXME:wy
  const { data: timeRuleData } = useFetch<any>({
    request: _getTimeRule,
    query: { page: 1, limit: 500, traincode: '1', type: '1', enableflag: '1' }, // enableflag: '1'启用
  });
  const timeRuleList = _get(timeRuleData, 'rows', []);

  const saleableOptions = useOptions('saleable');
  const { loading: confirmLoading, run } = useRequest(_addSchedule, { onSuccess: onOk });

  return (
    <Modal
      confirmLoading={confirmLoading}
      visible
      width={800}
      title={title}
      maskClosable={false}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then((values) => {
          const query = {
            cid: _get(currentRecord, 'cid'),
            rid: _get(values, 'rid'),
            saleable: _get(values, 'saleable'),
            scheduleSDate: formatTime(_get(values, 'date.0'), 'DATE'),
            scheduleEDate: formatTime(_get(values, 'date.1'), 'DATE'),
          };

          if (moment(_get(values, 'date.1')).diff(moment(_get(values, 'date.0')), 'days') > 180) {
            message.error('排课周期不能超过半年');
            return;
          }

          run(query);
        });
      }}
    >
      <Form form={form}>
        <Row>
          <ItemCol label="教练名称" rules={[{ whitespace: true, required: true }]}>
            {_get(currentRecord, 'coachname', '')}
          </ItemCol>

          <ItemCol span={10} label="时间规则方案" name="rid" rules={[{ required: true }]}>
            <Select style={{ width: 200 }} placeholder="请选择时间规则方案">
              {timeRuleList.map((x: any) => (
                <Option key={x.rid} value={x.rid}>
                  {x.rulename}
                </Option>
              ))}
            </Select>
          </ItemCol>
          <span className="color-primary pointer" onClick={() => window.open(`${PUBLIC_URL}timeRule`, '_self')}>
            去添加
          </span>
          {/* <Link to={`${PUBLIC_URL}timeRule`}>去添加</Link> */}
        </Row>

        <Row>
          <ItemCol label="排班周期" name="date" rules={[{ required: true }]}>
            <RangePicker allowClear={false} disabledDate={(current: any) => moment().isAfter(current, 'days')} />
          </ItemCol>
          <ItemCol label="发布状态" name="saleable" rules={[{ required: true }]}>
            <Select options={saleableOptions} style={{ width: 200 }} placeholder="请选择发布状态" />
          </ItemCol>
        </Row>
      </Form>
    </Modal>
  );
}
