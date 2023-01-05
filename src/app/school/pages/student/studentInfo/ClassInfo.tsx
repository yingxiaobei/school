import { Modal, Form, Row, Divider } from 'antd';
import { useFetch, useHash } from 'hooks';
import { _getClassDetail } from './_api';
import { _get } from 'utils';
import { IF, ItemCol, Loading } from 'components';

export default function ClassInfo(props: any) {
  const { onCancel, sid, customSchoolId } = props;
  const payModeHash = useHash('pay_mode_type');
  const subjectTypeHash = useHash('subject_type');
  const subjectCodeHash = useHash('subject_code_class_type');
  const trainModeHash = useHash('train_study_type');
  const chargeModeStudyFirstHash = useHash('charge_mode_type', false, '1'); //收费模式：先学后付，parentkey=1
  const chargeModePayFirstHash = useHash('charge_mode_type', false, '2'); //收费模式：先付后学，parentkey=2

  const [form] = Form.useForm();

  const { data, isLoading } = useFetch({
    query: {
      sid,
    },
    request: _getClassDetail,
    customHeader: { customSchoolId },
  });

  const trainningTimeType = useHash('trainning_time_type'); // 培训时段

  return (
    <Modal
      getContainer={false}
      visible
      width={800}
      title={'班级信息详情'}
      maskClosable={false}
      onCancel={onCancel}
      footer={null}
    >
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <Form form={form} autoComplete="off" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
            {(data || []).map((x: any, index: any) => (
              <div key={index}>
                <Row>
                  <ItemCol label="课程类型">
                    {subjectCodeHash[_get(x, 'subjectcode')] + ' ' + subjectTypeHash[_get(x, 'traincode')]}
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol label="付费模式">{payModeHash[_get(x, 'paymode')]}</ItemCol>
                  <ItemCol label="收费模式">
                    <>
                      {_get(x, 'paymode') === '1' && chargeModeStudyFirstHash[_get(x, 'chargemode')]}
                      {_get(x, 'paymode') === '2' && chargeModePayFirstHash[_get(x, 'chargemode')]}
                    </>
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol label="学习方式">{trainModeHash[_get(x, 'trainningmode')]}</ItemCol>
                  <ItemCol label="培训时段">{trainningTimeType[_get(x, 'trainningtime')]}</ItemCol>
                </Row>
                <Row>
                  <ItemCol label="课程价格">{_get(x, 'price')}</ItemCol>
                </Row>
                <Divider />
              </div>
            ))}
            <Row>
              <ItemCol label="备注">{_get(data, 'note')}</ItemCol>
            </Row>
          </Form>
        }
      />
    </Modal>
  );
}
