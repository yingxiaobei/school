//重推鸿阳
import { Modal, Form, Input, DatePicker, Select, Button, Row, message } from 'antd';
import { useState, useEffect } from 'react';
import { ItemCol } from 'components';
import { RULES } from 'constants/rules';
import moment from 'moment';
import { useFetch, useOptions, useRequest } from 'hooks';
import { _getTrainCar, _pushToHongYang } from './_api';
import { Auth, formatTime, _get } from 'utils';

interface IProps {
  currentData: any;
  onCancel(): void;
  onOk(): void;
  cardtype: string;
}

export default function Push(props: IProps) {
  const { onCancel, cardtype, currentData, onOk } = props;
  const genderOptions = useOptions('gender_type'); // 性别
  const thirdTypeOptions = useOptions('push_graduation_third_type');
  const ID_CARD_RULES = {
    validator: RULES.ID_CARD_NUM_VALID,
  };
  const [idCardRules, setIdCardRules] = useState(ID_CARD_RULES) as any;
  const [form] = Form.useForm();
  // 培训车型数据
  const { data: trainCarData = [] } = useFetch({
    request: _getTrainCar,
    query: {
      schId: Auth.get('schoolId'),
    },
  });
  useEffect(() => {
    if (cardtype === '1') {
      return setIdCardRules(ID_CARD_RULES);
    }
    setIdCardRules(RULES.OTHER_IDCARD);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardtype]);

  const businessScopeOptions = trainCarData.map((x: any) => {
    return {
      label: x.text,
      value: x.value,
    };
  });

  const { loading: confirmLoading, run } = useRequest(_pushToHongYang, {
    onSuccess: onOk,
  });

  return (
    <Modal
      getContainer={false}
      visible
      destroyOnClose
      width={800}
      title={'重推鸿阳'}
      onCancel={onCancel}
      maskClosable={false}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button key="back" onClick={onCancel}>
            取消
          </Button>
          ,
          <Button
            key="submit"
            className="ml20"
            loading={confirmLoading}
            type="primary"
            onClick={() => {
              form.validateFields().then(async (values) => {
                const firstDate = _get(values, 'fstdrilicdate', ''); //初领日期
                if (firstDate) {
                  //初领日期非必填
                  const flag = firstDate.diff(_get(values, 'birthday')) <= 0;
                  if (flag) {
                    message.error('初领日期需晚于出生日期');
                    return;
                  }
                }

                const params = {
                  sid: _get(currentData, 'sid'),
                  trainType: _get(values, 'traintype'),
                  birthday: formatTime(_get(values, 'birthday'), 'DATE'),
                  fstdrilicdate: formatTime(firstDate, 'DATE'),
                  idcard: _get(values, 'idcard'),
                  name: _get(values, 'name'),
                  sex: _get(values, 'sex'),
                  thirdType: _get(values, 'thirdType'),
                };
                run(params);
              });
            }}
          >
            确定
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        autoComplete="off"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{
          name: _get(currentData, 'name'),
          sex: _get(currentData, 'sex'),
          idcard: _get(currentData, 'idcard'),
          birthday: moment(_get(currentData, 'birthday')),
          traintype: _get(currentData, 'traintype'),
          applydate: moment(_get(currentData, 'applydate')),
          fstdrilicdate: _get(currentData, 'fstdrilicdate') ? moment(_get(currentData, 'fstdrilicdate')) : '',
        }}
      >
        <Row>
          <ItemCol span={12} label="推送平台" name="thirdType" rules={[{ whitespace: true, required: true }]}>
            <Select options={thirdTypeOptions} />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol
            span={12}
            label="姓名"
            name="name"
            rules={[{ whitespace: true, required: true }, RULES.STUDENT_NAME]}
          >
            <Input />
          </ItemCol>
          <ItemCol span={12} required label="性别" name="sex" rules={[{ required: true }]}>
            <Select options={genderOptions} getPopupContainer={(triggerNode) => triggerNode.parentElement} />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol name="idcard" span={12} label="身份证号" rules={[{ whitespace: true, required: true }, idCardRules]}>
            <Input
              onChange={(e: any) => {
                if (e.target.value.length === 18) {
                  let value = e.target.value;
                  let birthday = `${value.substring(6, 10)}-${value.substring(10, 12)}-${value.substring(12, 14)}`;
                  let sex = value[16] % 2 === 0 ? '2' : '1';
                  form.setFieldsValue({ sex: sex });
                  form.setFieldsValue({ birthday: moment(birthday) });
                }
              }}
            />
          </ItemCol>
          <ItemCol span={12} label="出生日期" name="birthday" rules={[{ required: true }]}>
            <DatePicker
              picker="date"
              allowClear={false}
              disabledDate={(current: any) => {
                return current.diff(moment(new Date(), 'days')) > 0;
              }}
            />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol name="traintype" span={12} label="培训车型" rules={[{ required: true }]}>
            <Select options={businessScopeOptions} getPopupContainer={(triggerNode) => triggerNode.parentElement} />
          </ItemCol>
          <ItemCol span={12} label="初领日期" name="fstdrilicdate">
            <DatePicker
              disabledDate={(current: any): any => {
                return current.diff(moment(new Date(), 'days')) > 0;
              }}
            />
          </ItemCol>
        </Row>
      </Form>
    </Modal>
  );
}
