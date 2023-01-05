import { useState } from 'react';
import { Modal, Form, Select, Space, Alert } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { _transformCarType, _C2ToC1 } from './_api';
import { _queryOpenedBanks } from '../historicalStudentProfile/_api';
import { useRequest } from 'hooks';
import { Auth, _get } from 'utils';
interface IProps {
  handleCancel: () => void;
  sid: string;
  handleOk: () => void;
  currentRecord: any;
  classList: any;
  type: string;
}

type ClassOption = { label: string; value: string };

const ChangeClassAndTrainType = (props: IProps) => {
  const { handleCancel, sid, handleOk, currentRecord, classList = [], type = '' } = props;
  const [package_name, setPackage_name] = useState('');
  const [package_id, setPackage_id] = useState('');
  const [form] = useForm();
  const detail = currentRecord;

  const { loading: confirmLoading, run } = useRequest(type === 'toC2' ? _transformCarType : _C2ToC1, {
    onSuccess: () => {
      handleOk();
    },
  });

  const setFormValue = (classOptions: ClassOption[]) => {
    setPackage_name(_get(classOptions, ['0', 'packlabel'], ''));
    setPackage_id(_get(classOptions, ['0', 'packid'], ''));
  };

  return (
    <Modal
      title="提示信息"
      visible
      maskClosable={false}
      confirmLoading={confirmLoading}
      onOk={() => {
        form.validateFields().then((res) => {
          run({
            id: sid,
            package_id: package_id,
            package_name: package_name,
          });
        });
      }}
      onCancel={handleCancel}
      okText="确定变更"
    >
      <div className="flex-box">
        <Alert
          message={<span style={{ color: '#faad14' }}>您更换了车型，请选择班级</span>}
          type="warning"
          style={{ width: '80%' }}
          className="mb20  text-center"
        />
      </div>
      <Form form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
        <Form.Item label="学员姓名">{_get(detail, 'name')}</Form.Item>
        <Form.Item label="培训车型">{type === 'toC2' ? 'C2' : 'C1'}</Form.Item>
        <Form.Item label="当前学员班级">
          <Space>{_get(detail, 'package_name')}</Space>
        </Form.Item>
        <Form.Item label="更换班级" name="packageid" rules={[{ required: true, message: '请选择更换班级' }]}>
          <Select
            options={classList.map((item: any) => {
              return { label: item.packlabel, value: item.packid };
            })}
            placeholder={'请选择班级'}
            showSearch={true}
            optionFilterProp={'label'}
            onChange={(value) => {
              const effectiveClassData = classList.filter((x: any) => x.packid === value);
              setFormValue(effectiveClassData);
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangeClassAndTrainType;
