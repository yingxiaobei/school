import { Modal, Form, Input, Select } from 'antd';
import React, { useState, useEffect } from 'react';
import { _saveOthers, _updatePerson } from '../_api';
import { useRequest, useOptions } from 'hooks';
import { useForm } from 'antd/lib/form/Form';
import { UploadFile, PopoverImg } from 'components';
import { RULES } from 'constants/rules';
import { _get } from 'utils';
const { Option } = Select;

interface IProps {
  title: string;
  isEdit: Boolean;
  onCancel: () => void;
  onOk: () => void;
  currentId?: string;
  visible: boolean;
  currentRecord?: object;
}

const AddOrEdit = (props: IProps) => {
  const { title, visible, onCancel, onOk, isEdit, currentRecord } = props;
  const personStatusHash = useOptions('person_manage_type');
  const [form] = useForm();
  const [imgUrl, setimgUrl] = useState('');
  const [ImgId, setImgId] = useState('');
  const { run } = useRequest(isEdit ? _updatePerson : _saveOthers, {
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
          if (res.personStatus === '2') res.personStatus = 0;
          run({ ...res, personType: 1, picTmpId: ImgId });
        });
      }}
      visible={visible}
    >
      <Form
        form={form}
        preserve={false}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ ...currentRecord }}
      >
        <Form.Item noStyle name="id">
          <Input hidden />
        </Form.Item>
        <Form.Item
          label="姓名"
          name="personName"
          rules={[{ whitespace: true, required: true, message: '请输入姓名!' }, RULES.STUDENT_NAME]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="状态" name="personStatus" rules={[{ required: true, message: '请选择状态!' }]}>
          <Select placeholder="请选择状态">
            {personStatusHash.map((item: any) => (
              <Option value={item.value} key={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input.TextArea maxLength={25} />
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
