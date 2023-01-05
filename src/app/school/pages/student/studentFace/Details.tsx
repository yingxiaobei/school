import { Modal, Form } from 'antd';
import { useFetch } from 'hooks';
import { _getDetails } from './_api';
import { _get } from 'utils';
import { Loading, PopoverImg } from 'components';

export default function Details(props: any) {
  const { onCancel, currentId } = props;
  const [form] = Form.useForm();

  const { isLoading, data } = useFetch({
    request: _getDetails,
    query: {
      sid: currentId,
    },
  });

  return (
    <>
      <Modal width={800} visible title={'查看模板'} maskClosable={false} onCancel={onCancel} footer={null}>
        {isLoading && <Loading />}

        {!isLoading && (
          <Form form={form} autoComplete="off" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Form.Item label="学员姓名">{_get(data, 'name')}</Form.Item>
            <Form.Item label="证件号码">{_get(data, 'idcard')}</Form.Item>
            <Form.Item label="证件照片">
              <PopoverImg src={_get(data, 'head_img_url', '')} />
            </Form.Item>
            <Form.Item label="人脸模板">
              {['faceid_center', 'faceid_down', 'faceid_left', 'faceid_right', 'faceid_up'].map(
                (x: any, index: any) => {
                  return <PopoverImg src={_get(data, x, '')} key={index} imgStyle={{ margin: '0 20px 20px 0' }} />;
                },
              )}
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
}
