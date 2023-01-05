import { useState } from 'react';
import { Modal, Form, Col, Select, Row } from 'antd';
import { _get } from 'utils';
import { useFetch, useRequest } from 'hooks';
import { _getRobotCoachModelList, _getRobotCoachModel, _updateRobotCoachModel } from './_api';
import { Loading, Title, ThreeModel } from 'components';

export default function AddModelEdit(props: any) {
  const { onCancel, carid, carType, carModelId, onOk } = props;
  const [placeModelId, setPlaceModelId] = useState(''); //车辆模型ID
  const [form] = Form.useForm();
  const { loading: confirmLoading, run } = useRequest(_updateRobotCoachModel, {
    onSuccess: onOk,
  });

  const { data: placeData = [], isLoading: placeDataLoading } = useFetch({
    request: _getRobotCoachModelList,
    query: { carType },
    depends: [carid],
    requiredFields: ['carType'],
  });

  const placeList: any = placeData.map((x: any) => {
    return {
      value: _get(x, 'id', ''),
      label: _get(x, 'modelName', ''),
    };
  });

  const { data: placeDetailData, isLoading: placeDetailDataLoading } = useFetch({
    request: _getRobotCoachModel,
    query: { carModelId: placeModelId ? placeModelId : carModelId },
    depends: [placeModelId],
    requiredFields: ['carModelId'],
    forceCancel: carModelId === '',
  });

  return (
    <Modal
      width={800}
      visible
      title={'车辆绑定详情'}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      onOk={() => {
        form.validateFields().then(() => {
          const query = {
            carId: carid,
            modelId: placeModelId,
          };
          run(query);
        });
      }}
    >
      {placeDataLoading && <Loading />}
      {!placeDataLoading && (
        <Form form={form} autoComplete="off" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Row>
            <Col span={12}>
              <Form.Item label="车辆模型名称" name="modelName" rules={[{ required: true, message: '请选择车辆模型' }]}>
                <Select
                  options={placeList}
                  defaultValue={carModelId ? carModelId : ''}
                  onChange={(val: any) => {
                    setPlaceModelId(val);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Title>车辆模型预览</Title>
          {placeDetailDataLoading && <Loading />}
          {!placeDetailDataLoading && !carModelId && !placeDetailData && <Title>暂无模型</Title>}
          {!placeDetailDataLoading && (carModelId || placeDetailData) && (
            <ThreeModel
              objUrl={_get(placeDetailData, 'fileObjectKey3d', '')}
              mtlUrl={_get(placeDetailData, 'fileObjectMaterialKey3d', '')}
            />
          )}
        </Form>
      )}
    </Modal>
  );
}
