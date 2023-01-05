import { useState } from 'react';
import { Modal, Form, Col, Select, Row } from 'antd';
import { _get } from 'utils';
import { useFetch, useRequest } from 'hooks';
import { _getRobotCoachPlaceList, _getRobotCoachPlace, _updateRobotCoachPlace } from './_api';
import { Loading, Title, ThreeModel } from 'components';

export default function AddModelEdit(props: any) {
  const { onCancel, currentId, robotPlaceId, onOk } = props;
  const [placeModelId, setPlaceModelId] = useState(''); //场地模型ID
  const [form] = Form.useForm();
  const { loading: confirmLoading, run } = useRequest(_updateRobotCoachPlace, {
    onSuccess: onOk,
  });

  const { data: placeData = [], isLoading: placeDataLoading } = useFetch({
    request: _getRobotCoachPlaceList,
    depends: [currentId],
  });

  const placeModelList: any = placeData.map((x: any) => {
    return {
      value: _get(x, 'id', ''),
      label: _get(x, 'fileName3d', ''),
    };
  });

  const { data: placeDetailData, isLoading: placeDetailDataLoading } = useFetch({
    request: _getRobotCoachPlace,
    query: { placeId: placeModelId ? placeModelId : robotPlaceId },
    depends: [placeModelId],
    requiredFields: ['placeId'],
    forceCancel: robotPlaceId === '',
  });

  return (
    <Modal
      width={800}
      visible
      title={'教学区域详情'}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      onOk={() => {
        form.validateFields().then(() => {
          const query = {
            placeId: placeModelId,
            rid: currentId,
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
              <Form.Item label="场地模型名称" name="fileName3d" rules={[{ required: true, message: '请选择场地模型' }]}>
                <Select
                  options={placeModelList}
                  defaultValue={robotPlaceId ? robotPlaceId : ''}
                  onChange={(val: any) => {
                    const valueArr = val;
                    setPlaceModelId(valueArr);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Title>教学区域模型</Title>
          {placeDetailDataLoading && <Loading />}
          {!placeDetailDataLoading && !robotPlaceId && !placeDetailData && <Title>暂无模型</Title>}
          {!placeDetailDataLoading && (robotPlaceId || placeDetailData) && (
            <ThreeModel
              objUrl={_get(placeDetailData, 'fileKey3d', '')}
              mtlUrl={_get(placeDetailData, 'fileKey3dM', '')}
            />
          )}
        </Form>
      )}
    </Modal>
  );
}
