import { Drawer, Button, Col, Row, Form, Input, DatePicker, Select } from 'antd';
import { _addClass, _editClass, _getClassDetail } from './_api';
import { _get } from 'utils';
import moment from 'moment';
import { useFetch, useOptions, useRequest } from 'hooks';
import { RULES } from 'constants/rules';

interface Iprops {
  onCancel(): void;
  onOk(): void;
  isEdit: boolean;
  currentId?: string | null;
}

const { TextArea } = Input;

export default function ClassManage(props: Iprops) {
  const { onCancel, onOk, isEdit, currentId } = props;
  const [form] = Form.useForm();

  const isEffectiveTypeOptions = useOptions('is_effective_type'); // 是否有效

  // 获取详情
  const { data, isLoading } = useFetch({
    request: _getClassDetail,
    query: {
      id: currentId,
    },
    requiredFields: ['id'],
  });
  const { loading, run } = useRequest(isEdit ? _editClass : _addClass, {
    onSuccess: () => {
      onOk();
    },
  });

  return (
    <Drawer
      destroyOnClose
      visible
      width={800}
      title={isEdit ? '编辑班次' : '新增班次'}
      onClose={onCancel}
      footer={
        <div
          style={{
            textAlign: 'right',
          }}
        >
          <Button onClick={onCancel} type="ghost" className="mr20">
            取消
          </Button>
          <Button
            onClick={() => {
              form.validateFields().then(async (values) => {
                const query = {
                  ...values,
                  startDate: moment(_get(values, 'startDate', '')).format('YYYY-MM-DD'),
                };
                run(isEdit ? { ...query, classId: currentId } : query);
              });
            }}
            type="primary"
            loading={loading}
          >
            确定
          </Button>
        </div>
      }
    >
      {!isLoading && (
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          initialValues={{
            ...data,
            startDate: _get(data, 'startDate') ? moment(_get(data, 'startDate')) : moment(),
            isEffective: _get(data, 'isEffective', '1'),
          }}
        >
          <Row>
            <Col span={12}>
              <Form.Item
                label="班次"
                name="classFrequency"
                rules={[{ required: true, message: '请输入班次' }, RULES.CLASS_PLAN]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="开班名称"
                name="className"
                rules={[{ required: true, message: '请输入开班名称' }, RULES.CLASS_NAME]}
              >
                <Input disabled={isEdit} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="开班日期" name="startDate" rules={[{ required: true, message: '请输入开班名称' }]}>
                <DatePicker
                  style={{ width: 240 }}
                  disabledDate={(current: any): any => {
                    if (!current) return;
                    return current.diff(moment(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'days')) < 0;
                  }}
                  allowClear={false}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="总人数"
                name="totalNum"
                rules={[{ required: true, message: '请输入总人数' }, RULES.TOTAL_PERSON]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="是否有效" name="isEffective">
                <Select options={isEffectiveTypeOptions} disabled={isEdit} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item label="备注" name="memo" labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
                <TextArea rows={4} style={{ width: '94%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Drawer>
  );
}
