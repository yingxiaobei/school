import { Modal, Form, DatePicker } from 'antd';
import { _updateCoaIdauth } from './_api';
import { formatTime, _get } from 'utils';
import moment from 'moment';
import { useRequest } from 'hooks';

interface IProps {
  onCancel(): void;
  onOk(): void;
  currentId: string | null;
}

export default function NoVerify(props: IProps) {
  const { onCancel, onOk, currentId } = props;

  const [form] = Form.useForm();

  const { loading: confirmLoading, run: confirmRun } = useRequest(_updateCoaIdauth, {
    onSuccess: onOk,
  });

  return (
    <Modal
      title="免签"
      visible
      width={500}
      maskClosable={false}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then(async (values) => {
          const query = {
            cid: currentId,
            idauthclosed: '1', //免签
            idauthcloseddeadline: formatTime(_get(values, 'idauthcloseddeadline', ''), 'DATE'),
          };
          confirmRun(query);
        });
      }}
    >
      <Form form={form} autoComplete="off" initialValues={{ idauthcloseddeadline: moment() }}>
        <Form.Item
          label="免签截止日期"
          name="idauthcloseddeadline"
          rules={[{ required: true, message: '请选择免签截止日期' }]}
        >
          <DatePicker
            disabledDate={(current: any): any => {
              if (!current) return;
              //只能选择当天及之后的日期 最大可选择日期为2099-12-31
              return (
                current.diff(moment(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'days')) < 0 ||
                current.diff(moment('2100-1-1')) >= 0
              );
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
