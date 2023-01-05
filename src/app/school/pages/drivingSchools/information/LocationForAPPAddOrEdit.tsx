import { memo, useState, useEffect } from 'react';
import { LocationForApp, _addLocationForAPP, _updateLocationForAPP } from './_api';
import { Form, Input, Select, Modal, Row, message } from 'antd';
// import { OptionsType } from 'rc-select/lib/interface';
import { ItemCol, UploadPro } from 'components';
import { _get } from 'utils';
import { RULES } from 'constants/rules';
interface Props {
  currentLocation: LocationForApp;
  isEdit: boolean;
  setVisible: () => void;
  handleOk: () => void;
}

function LocationsForAPPAddOrEdit({ currentLocation, isEdit, setVisible, handleOk }: Props) {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [bannerImgId, setBannerImgId] = useState<string | undefined>(undefined);
  const [bannerImgUrl, setBannerImgUrl] = useState<string | undefined>(undefined);

  // note： 后端说目前不需要用数据字典表示 场地的类型
  const locationType: IOption[] = [
    {
      label: '科目二',
      value: 2,
    },
    {
      label: '科目三',
      value: 3,
    },
  ];

  useEffect(() => {
    if (isEdit) {
      form.setFieldsValue({
        ...currentLocation,
      });

      setBannerImgUrl(_get(currentLocation, 'bannerImgUrl', ''));
    }
  }, [currentLocation, form, isEdit]);

  const addOrUpdate = async (value: any) => {
    if (!bannerImgUrl) {
      return message.error('请上传场地图片！');
    }
    try {
      setConfirmLoading(true);
      if (isEdit) {
        await _updateLocationForAPP({
          id: _get(currentLocation, 'id', ''),
          current: {
            ...currentLocation,
            ...value,
            bannerImg: bannerImgId,
          },
        });
      } else {
        await _addLocationForAPP({
          ...value,
          bannerImg: bannerImgId,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmLoading(false);
      handleOk();
    }
  };

  return (
    <Modal
      width="800px"
      visible
      title={isEdit ? '编辑场地' : '新增场地'}
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
        <Row>
          <ItemCol
            rules={[{ whitespace: true, required: true }, RULES.RULE_NAME]}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            label="场地名称"
            name="name"
            span={12}
          >
            <Input placeholder="请输入场地名称" />
          </ItemCol>
          <ItemCol
            rules={[{ required: true }]}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            label="场地类型"
            name="type"
            span={12}
          >
            <Select placeholder="请选择场地类型" options={locationType}></Select>
          </ItemCol>
        </Row>
        <Row>
          <ItemCol
            rules={[{ whitespace: true, required: true }, RULES.LEN50]}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            label="地址"
            name="address"
            span={12}
          >
            <Input placeholder="请输入地址" />
          </ItemCol>
          <ItemCol
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            rules={[RULES.POSITIVE_NUM]}
            label="排序"
            name="sort"
            span={12}
          >
            <Input placeholder="请输入排序" />
          </ItemCol>
        </Row>
        <Row>
          <ItemCol required labelCol={{ span: 6 }} wrapperCol={{ span: 8 }} label="场地照片" span={12}>
            <UploadPro maxSize={5} imageUrl={bannerImgUrl} setImageUrl={setBannerImgUrl} setImgId={setBannerImgId} />
          </ItemCol>
        </Row>
      </Form>
    </Modal>
  );
}

export default memo(LocationsForAPPAddOrEdit);
