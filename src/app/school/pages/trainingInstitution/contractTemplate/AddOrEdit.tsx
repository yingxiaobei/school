import { useState } from 'react';
import { Modal, Form, Row, Input, Select } from 'antd';
import { useFetch, useOptions, useRequest } from 'hooks';
import { _getContractTemplateDetail, _updateInfo, _addInfo, Template } from './_api';
import { _get } from 'utils';
import { BaseTemplateContract, ItemCol, Loading } from 'components';
import { RULES } from 'constants/rules';
import TemplateText from 'utils/Temaplate';

interface Props {
  onCancel: () => void;
  currentId: string | null;
  title: string;
  onOk: () => void;
  isEdit: boolean;
}

type FormValue = {
  memo: string;
  cartype: string;
};

export default function AddOrEdit({ onCancel, currentId, isEdit, title, onOk }: Props) {
  const [form] = Form.useForm<FormValue>();
  const [schContractTempitemList, setSchContractTempitemList] = useState<Template[]>([]);
  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    requiredFields: ['id'],
    request: _getContractTemplateDetail,
    callback: (data) => {
      setSchContractTempitemList(TemplateText.sortByItemType(data));
    },
  });

  // const checkTypeOptions = useOptions('student_contract_check_type');
  const carTypeOptions = useOptions('business_scope', false, '-1', [], {
    forceUpdate: true,
  }); // 经营车型

  const { loading: confirmLoading, run } = useRequest(isEdit ? _updateInfo : _addInfo, {
    onSuccess: onOk,
  });

  const formValidator = (values: FormValue) => {
    TemplateText.checkContract(schContractTempitemList, () => {
      const query = {
        memo: _get(values, 'memo'),
        cartype: _get(values, 'cartype'),
        tempid: currentId,
        schContractTempitemList: schContractTempitemList,
      };
      run(query);
    });
  };

  return (
    <Modal
      visible
      width={TemplateText.ModalWidth}
      title={title}
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      onOk={() => {
        form.validateFields().then(formValidator);
      }}
    >
      {isLoading && <Loading />}

      {!isLoading && (
        <Form
          form={form}
          autoComplete="off"
          labelWrap
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 12 }}
          initialValues={{
            cartype: _get(data, 'cartype'),
            memo: _get(data, 'memo'),
          }}
        >
          <BaseTemplateContract
            carTypeRender={
              <ItemCol label="车型" name="cartype" rules={[{ required: true, message: '请选择车型' }]}>
                <Select disabled={isEdit} options={carTypeOptions} />
              </ItemCol>
            }
            schContractTempitemList={schContractTempitemList}
            setSchContractTempitemList={setSchContractTempitemList}
          />
          <Row>
            <ItemCol label="备注" name="memo" rules={[RULES.MEMO]}>
              <Input.TextArea />
            </ItemCol>
          </Row>
        </Form>
      )}
    </Modal>
  );
}
