import { Form, Input, message, Modal, Spin } from 'antd';
import { ItemCol } from 'components';
import { RULES } from 'constants/rules';
import { useFetch, useRequest } from 'hooks';
import { useEffect, useState } from 'react';
import { _get } from 'utils';
import InlineUploadPdf from '../application/components/InlineUploadPdf';
import { _getStudyCertificateInfo, _saveCertFile } from './_api';

export default function StudentCert(props: any) {
  const { sid, setVisible, title = '上传学习驾驶证明', certEdit = false, onOk } = props;
  const [studyCertificate, setCertificate] = useState('');
  const [certFile_show, setCertFile_show] = useState('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { loading: confirmLoading, run } = useRequest(_saveCertFile, {
    onSuccess() {
      onOk();
    },
  });
  const { data, isLoading } = useFetch({
    request: _getStudyCertificateInfo,
    query: { sid },
    requiredFields: ['sid'],
    forceCancel: !certEdit,
    callback: (data) => {
      form.resetFields();
      setCertFile_show(_get(data, 'studyCertificateUrl'));
      setCertificate(_get(data, 'studyCertificate'));
    },
  });
  useEffect(() => {
    form.resetFields();
  }, [certEdit]);

  return (
    <Modal
      getContainer={false}
      visible
      destroyOnClose
      width={600}
      title={title}
      maskClosable={false}
      confirmLoading={confirmLoading || loading}
      onCancel={setVisible}
      onOk={() => {
        form.validateFields().then(async (values) => {
          if (!studyCertificate) {
            return message.error('请上传学习证明文件');
          }
          run({
            sid,
            studyCertificate,
            studyDriverNum: _get(values, 'studyDriverNum'),
            firstExamScore: _get(values, 'firstExamScore'),
            firstExamSpace: _get(values, 'firstExamSpace'),
          });
        });
      }}
    >
      <Spin spinning={isLoading}>
        <Form
          form={form}
          autoComplete="off"
          initialValues={{
            studyDriverNum: _get(data, 'studyDriverNum'),
            firstExamScore: String(_get(data, 'firstExamScore', '')),
            firstExamSpace: _get(data, 'firstExamSpace'),
          }}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Form.Item
            label="学习驾驶证明编号"
            name="studyDriverNum"
            rules={[{ whitespace: true, required: true, message: '学习驾驶证明编号不能为空' }, RULES.EXAM_PLACE]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="科目一考试分数"
            name="firstExamScore"
            rules={[{ whitespace: true, required: true, message: '科目一考试分数不能为空' }, RULES.SCORE]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="科目一考试场地"
            name="firstExamSpace"
            rules={[{ whitespace: true, required: true, message: '科目一考试场地不能为空' }, RULES.EXAM_PLACE]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="学习证明文件" required>
            <InlineUploadPdf
              setConfirmLoading={setLoading}
              imageUrl={certFile_show}
              setImageUrl={setCertFile_show}
              setImgId={setCertificate}
              title={'学习证明文件'}
              maxSize={1}
            />
            <div className="color-primary mt4">仅支持上传pdf文件，且不能超过1M</div>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
