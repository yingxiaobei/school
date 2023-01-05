import { memo, useState, useEffect } from 'react';
import { ClassesForAPP, _addSchoolClassForAPP, _updateSchoolClassForAPP } from './_api';
import { ItemCol } from 'components';
import { _get } from 'utils';
import { Form, Input, Select, Modal, Row } from 'antd';
import { useOptions } from 'hooks';
import ClassTagsShow from './ClassTagsShow';
import { RULES } from 'constants/rules';

interface Props {
  currentClass: ClassesForAPP;
  isEdit: boolean;
  setVisible: () => void;
  handleOk: () => void;
}

function ClassesForAPPAddOrEdit({ currentClass, isEdit, setVisible, handleOk }: Props) {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(_get(currentClass, 'tags', []));

  const carTypesOptions = useOptions('trans_car_type');

  useEffect(() => {
    if (isEdit) {
      form.setFieldsValue({
        ...currentClass,
      });
    }
  }, [currentClass, form, isEdit]);

  const addOrUpdate = async (value: any) => {
    try {
      setConfirmLoading(true);
      if (isEdit) {
        await _updateSchoolClassForAPP({
          id: _get(currentClass, 'id', ''),
          current: {
            ...currentClass,
            ...value,
            tags,
          },
        });
      } else {
        await _addSchoolClassForAPP({
          ...value,
          tags,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmLoading(false);
      handleOk();
    }
  };

  const editTags = (newTags: string[]) => {
    setTags(newTags.map((newTag) => newTag.trim()));
  };

  return (
    <Modal
      width="800px"
      visible
      title={isEdit ? '编辑班级' : '新增班级'}
      onOk={() => {
        form.validateFields().then((values) => {
          addOrUpdate(values);
        });
      }}
      onCancel={setVisible}
      confirmLoading={confirmLoading}
      maskClosable={false}
    >
      <Form form={form} layout="horizontal">
        {/* TODO 友善一点的话就 做成响应式的 */}
        <Row>
          <ItemCol
            rules={[{ whitespace: true, required: true }, RULES.CLASS_NAME_APP]}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 18 }}
            label="班级名称"
            name="name"
            span={12}
          >
            <Input placeholder="请输入班级名称" />
          </ItemCol>
          <ItemCol
            rules={[{ required: true }]}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            label="报名车型"
            name="carType"
            span={12}
          >
            <Select placeholder="请选择报名车型" options={carTypesOptions}></Select>
          </ItemCol>
        </Row>
        <Row>
          <ItemCol
            rules={[{ required: true }, RULES.APP_FEE]}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            label="APP展示培训费"
            name="trainFee"
            span={12}
          >
            <Input placeholder="请输入APP展示培训费" />
          </ItemCol>
          <ItemCol
            labelCol={{ span: 8 }}
            rules={[RULES.POSITIVE_NUM]}
            wrapperCol={{ span: 16 }}
            label="排序"
            name="sort"
            span={12}
          >
            <Input placeholder="请输入排序" />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="班级标签" span={24}>
            <ClassTagsShow tags={_get(currentClass, 'tags', [])} editTags={editTags} />
          </ItemCol>
        </Row>
      </Form>
    </Modal>
  );
}

export default memo(ClassesForAPPAddOrEdit);
