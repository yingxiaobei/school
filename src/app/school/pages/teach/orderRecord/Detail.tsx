import { useState } from 'react';
import { Modal, Form, Row } from 'antd';
import { useFetch, useHash, useVisible } from 'hooks';
import { _getDetail } from './_api';
import { _get } from 'utils';
import moment from 'moment';
import { ItemCol, Loading } from 'components';
import StudentDetails from '../../financial/studentOrder/Details';

export default function Details(props: any) {
  const { onCancel, currentId } = props;
  const [form] = Form.useForm();
  const [studentDetailsVisible, setStudentDetailVisible] = useVisible();
  const [currentOrderId, setCurrentOrderId] = useState('');
  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    request: _getDetail,
  });

  const orderModeHash = useHash('order_mode'); // 约课类型
  const subjectcodeHash = useHash('trans_part_type'); // 培训部分

  const orderStatusHash = useHash('order_appoint_status');
  const traincodeHash = useHash('subject_type');
  const settlementflagHash = useHash('settlementflag');

  return (
    <>
      {studentDetailsVisible && <StudentDetails onCancel={setStudentDetailVisible} currentId={currentOrderId} />}
      <Modal visible width={850} title={'预约记录详情'} maskClosable={false} onCancel={onCancel} footer={null}>
        {isLoading && <Loading />}

        {!isLoading && (
          <Form form={form} autoComplete="off" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
            <Row>
              <ItemCol span={8} label="姓名">
                {_get(data, 'stuname')}
              </ItemCol>

              <ItemCol span={8} label="证件号">
                {_get(data, 'stuidcard')}
              </ItemCol>

              <ItemCol span={8} label="电话">
                {_get(data, 'stuaccount')}
              </ItemCol>
            </Row>

            <Row>
              <ItemCol span={8} label="约课类型">
                {orderModeHash[_get(data, 'order_mode', '')]}
              </ItemCol>
              <ItemCol span={8} label="约课科目">
                {subjectcodeHash[_get(data, 'subjectcode', '')]}
              </ItemCol>
              <ItemCol span={8} label="预约对象">
                {
                  //看预约类型，实操写教练，模拟及理论写营业网点及教室
                  String(_get(data, 'traincode')) === '1'
                    ? _get(data, 'coachname', '')
                    : _get(data, 'appointmentmemo', '')
                }
              </ItemCol>
            </Row>

            <Row>
              <ItemCol span={8} label="课程日期">
                {_get(data, 'plan_date')}
              </ItemCol>
              <ItemCol span={8} label="课程时段">
                {moment().hour(_get(data, 'begin_hour', 0)).minute(_get(data, 'beginhourmin', 0)).format('HH:mm') +
                  '-' +
                  moment().hour(_get(data, 'end_hour', 0)).minute(_get(data, 'endhourmin', 0)).format('HH:mm')}
              </ItemCol>
              <ItemCol span={8} label="课程类型">
                {traincodeHash[_get(data, 'traincode', 9)]}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={8} label="约课时间">
                {_get(data, 'create_date')}
              </ItemCol>
              <ItemCol span={8} label="课程价格">
                {_get(data, 'sparring_price')}
              </ItemCol>
              <ItemCol span={8} label="实付价格">
                {_get(data, 'real_pay_price')}
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={8} label="预约状态">
                {orderStatusHash[_get(data, 'order_appoint_status', '')]}
              </ItemCol>
              {_get(data, 'stuOrderPayId') && ( //可跳转到订单详情页
                <ItemCol span={8} label="订单信息">
                  <span
                    className="color-primary pointer"
                    onClick={() => {
                      setCurrentOrderId(_get(data, 'stuOrderPayId', ''));
                      setStudentDetailVisible();
                    }}
                  >
                    {_get(data, 'stuOrderPayId')}
                  </span>
                </ItemCol>
              )}
            </Row>
            {String(_get(data, 'order_appoint_status', '')) === '8' && (
              //以下三类，预约取消的预约记录才显示
              <>
                <ItemCol span={8} label="取消预约操作人">
                  {_get(data, 'operatorusername')}
                </ItemCol>
                <ItemCol span={8} label="取消时间">
                  {_get(data, 'operatetime')}
                </ItemCol>
                <ItemCol span={8} label="取消原因">
                  {_get(data, 'simplenote')}
                </ItemCol>
              </>
            )}

            <ItemCol span={8} label="结算状态">
              {settlementflagHash[_get(data, 'settlementflag', '')]}
            </ItemCol>
          </Form>
        )}
      </Modal>
    </>
  );
}
