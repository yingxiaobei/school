import { Modal, Form, Select, Input } from 'antd';
import { useFetch, useOptions, useRequest } from 'hooks';
import { _getDetails, _handleReview } from './_api';
import { _get } from 'utils';
import { Loading, PopoverImg } from 'components';
import { RULES } from 'constants/rules';

interface IProps {
  onCancel(): void;
  onOk(): void;
  currentId?: string;
}

function Review(props: IProps) {
  const { onCancel, currentId, onOk } = props;
  const [form] = Form.useForm();

  const { isLoading, data } = useFetch({
    request: _getDetails,
    query: {
      cid: currentId,
    },
  });
  const { loading: confirmLoading, run } = useRequest(_handleReview, {
    onSuccess: onOk,
  });

  const CHECK_FLAG = useOptions('pass_notpass_type');

  return (
    <Modal
      width={900}
      visible
      title={'审核'}
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      onOk={() => {
        form.validateFields().then(async (values) => {
          run({
            cid: currentId,
            handcheckflag: _get(values, 'handcheckflag'),
            memo: _get(values, 'memo'),
          });
        });
      }}
    >
      {isLoading && <Loading />}

      {!isLoading && (
        <Form form={form} autoComplete="off" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item label="教练姓名">{_get(data, 'name')}</Form.Item>
          <Form.Item label="证件号码">{_get(data, 'idcard')}</Form.Item>
          <Form.Item label="证件照片">
            <PopoverImg src={_get(data, 'head_img_url', '')} />
          </Form.Item>
          <Form.Item label="人脸模板">
            {['faceid_center', 'faceid_down', 'faceid_left', 'faceid_right', 'faceid_up'].map((x: any, index: any) => {
              return <PopoverImg src={_get(data, x, '')} key={index} imgStyle={{ margin: '0 20px 20px 0' }} />;
            })}
          </Form.Item>
          <Form.Item label="审核结果" name="handcheckflag" rules={[{ required: true, message: '审核结果不能为空' }]}>
            <Select options={CHECK_FLAG} getPopupContainer={(triggerNode) => triggerNode.parentElement} />
          </Form.Item>
          <Form.Item label="备注" name="memo" rules={[RULES.MEMO]}>
            <Input />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}

export default Review;
