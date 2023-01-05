import { Modal, Form, Input, Select } from 'antd';
import React, { useState, useEffect } from 'react';
import { _updatePerson } from '../_api';
import { useRequest } from 'hooks';
import { useForm } from 'antd/lib/form/Form';
import { UploadFile, PopoverImg } from 'components';
import { _get } from 'utils';
const { Option } = Select;

interface IProps {
  title: string;
  onCancel: () => void;
  onOk: () => void;
  currentRecord?: object;
  visible: boolean;
}

const AddOrEdit = (props: IProps) => {
  const { title, visible, onCancel, onOk, currentRecord } = props;
  const [form] = useForm();
  const [imgUrl, setimgUrl] = useState('');
  const [ImgId, setImgId] = useState('');
  const { run } = useRequest(_updatePerson, {
    onSuccess: () => {
      onOk();
    },
  });
  useEffect(() => {
    visible && setimgUrl(_get(currentRecord, 'picUrlShow', ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  return (
    <Modal
      title={title}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then((res) => {
          run({ ...res, personType: 2, picTmpId: ImgId });
        });
      }}
      visible={visible}
    >
      <Form form={form} preserve={false} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} initialValues={currentRecord}>
        <Form.Item noStyle name="id">
          <Input hidden />
        </Form.Item>
        <Form.Item noStyle name="sid">
          <Input hidden />
        </Form.Item>
        <Form.Item label="姓名" name="personName">
          <Input disabled />
        </Form.Item>

        <Form.Item label="身份证号" name="idCard">
          <Input disabled />
        </Form.Item>
        <Form.Item label="照片" name="picUrl" rules={[{ required: true, message: '请上传照片!' }]}>
          <div>
            <div style={{ display: 'block' }}> {imgUrl && <PopoverImg src={imgUrl} />}</div>
            <UploadFile setImageUrl={setimgUrl} setImgId={setImgId} />
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddOrEdit;
