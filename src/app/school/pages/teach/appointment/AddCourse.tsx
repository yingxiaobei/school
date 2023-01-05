// 新增课程

import moment from 'moment';
import { Row, Form, Select, DatePicker, Modal, message } from 'antd';
import { _getClassroomList, _getTimeRule, _addSchedule } from './_api';
import { ItemCol } from 'components';
import { useFetch, useOptions, useRequest } from 'hooks';
import { PUBLIC_URL } from 'constants/env';
import { disabledDateAfterToday, _get } from 'utils';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function AddCourse(props: any) {
  const { title, onCancel, onOk, currentRecord, traincode } = props;
  const [form] = Form.useForm();
  const { loading: confirmLoading, run } = useRequest(_addSchedule, { onSuccess: onOk });

  const { data } = useFetch({
    request: _getClassroomList,
    query: { sbnid: _get(currentRecord, 'sbnid', ''), traincode },
  });
  const classRoomList = (data || []).map((x: any) => ({ value: x.classid, label: x.classroom }));

  // FIXME:wy
  const { data: timeRuleData } = useFetch<any>({
    request: _getTimeRule,
    query: { traincode, page: 1, limit: 500 },
  });
  const timeRuleList = _get(timeRuleData, 'rows', []);

  const saleableOptions = useOptions('saleable');

  return (
    <Modal
      visible
      width={800}
      title={title}
      maskClosable={false}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then((values) => {
          const query = {
            branchId: _get(currentRecord, 'sbnid'),
            rid: _get(values, 'rid'),
            classroomId: _get(values, 'classroomId'),
            saleable: _get(values, 'saleable'),
            scheduleSDate: moment(_get(values, 'date.0')).format('YYYY-MM-DD'),
            scheduleEDate: moment(_get(values, 'date.1')).format('YYYY-MM-DD'),
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
          <ItemCol label="营业网点" rules={[{ whitespace: true, required: true }]}>
            {_get(currentRecord, 'branchname', '')}
          </ItemCol>

          <ItemCol label="教室" name="classroomId" rules={[{ required: true }]}>
            <Select options={classRoomList} style={{ width: 200 }} placeholder="请选择教室" />
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
