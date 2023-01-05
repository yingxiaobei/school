import { useEffect, useState } from 'react';
import { _get } from 'utils';
import { Modal, Form, DatePicker, Button, Spin } from 'antd';
import { InsuranceDate, _addInsurance, _getInsuranceDetail, _updateInsurance } from '../_api';
import moment, { Moment } from 'moment';
import UploadFileCustomized from 'components/UploadFileCustomized ';
import { useFetch } from 'hooks';

interface Props {
  onCancel: () => void;
  onOk: () => void;
  currentRecord: InsuranceDate | null;
  isEdit: boolean;
  title: string | React.ReactElement;
  carid: string;
}

export type InsuranceValues = {
  insuranceDate: Moment;
};

export default function AddOrEditInsurance(props: Props) {
  const { onCancel, onOk, currentRecord, isEdit, title, carid } = props;
  const [form] = Form.useForm<InsuranceValues>();

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [insuranceFileUrl, setInsuranceFileUrl] = useState('');
  const [insuranceFileOssId, setInsuranceFileOssId] = useState('');

  const config = {
    rules: [{ type: 'object' as const, required: true }],
  };

  const formLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  const { data: insuranceDate, isLoading } = useFetch({
    request: _getInsuranceDetail,
    query: { id: _get(currentRecord, 'id') },
    requiredFields: ['id'],
    depends: [currentRecord],
  });

  useEffect(() => {
    if (insuranceDate) {
      setInsuranceFileUrl(_get(insuranceDate, 'insuranceFileUrl'));
      // setInsuranceFileOssId(_get(insuranceDate, 'insuranceFileOssId'));
    }
  }, [insuranceDate]);

  return (
    <Modal
      visible
      title={title}
      maskClosable={false}
      onCancel={onCancel}
      // confirmLoading={confirmLoading}
      footer={
        <>
          <UploadFileCustomized
            imageUrl={insuranceFileUrl}
            setImageUrl={setInsuranceFileUrl}
            setImgId={setInsuranceFileOssId}
            title={'保险记录'}
            typeRule={{
              rule: ['image/jpeg', 'image/png', 'application/pdf'],
              message: '仅支持jpg/jpeg/pdf格式的文件',
              size: 10,
            }}
            layout={'hor'}
          />
          <Button onClick={onCancel} className="ml10">
            取消
          </Button>
          <Button
            loading={confirmLoading}
            type="primary"
            onClick={() => {
              form
                .validateFields()
                .then(async (values) => {
                  try {
                    const query = {
                      carid,
                      insuranceDate: _get(values, 'insuranceDate')
                        ? _get(values, 'insuranceDate').format('YYYY-MM-DD')
                        : '',
                      insuranceFileOssId,
                      // insuranceFileUrl,
                    };
                    setConfirmLoading(true);
                    const res = isEdit
                      ? await _updateInsurance({ ...query, id: _get(currentRecord, 'id') })
                      : await _addInsurance(query);
                    if (_get(res, 'code') === 200) {
                      onOk();
                    }
                    setConfirmLoading(false);
                  } catch (error) {
                    console.error(error);
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
          >
            确定
          </Button>
        </>
      }
    >
      <Spin spinning={isLoading}>
        <Form
          form={form}
          autoComplete="off"
          {...formLayout}
          initialValues={{
            insuranceDate: _get(currentRecord, 'insuranceDate') ? moment(_get(currentRecord, 'insuranceDate')) : null,
          }}
        >
          <Form.Item name="insuranceDate" label="保险时间" {...config}>
            <DatePicker />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}
