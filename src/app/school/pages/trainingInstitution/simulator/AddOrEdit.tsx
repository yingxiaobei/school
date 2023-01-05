import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Row, message, Col } from 'antd';
import { _addModel, _editModel, _getDetails } from './_api';
import { useFetch, useOptions, useRequest } from 'hooks';
import { ItemCol, UploadPro, Loading } from 'components';
import { RULES } from 'constants/rules';
import { _get, Auth, GPS } from 'utils';
import moment from 'moment';
import { _getBaseInfo } from 'api';

export default function AddOrEdit(props: any) {
  const {
    onCancel,
    onOk,
    currentId,
    currentRecord,
    isEdit,
    title,
    setVisible,
    lng = '',
    lat = '',
    setLng,
    setLat,
    change,
    setChange,
    longitude,
    setLongitude,
    latitude,
    setLatitude,
    setSchoolAddress,
  } = props;

  const [form] = Form.useForm();
  // 车辆照片
  const [imageUrl, setImageUrl] = useState();
  const [imgId, setImgId] = useState('');
  console.log(lng, lat);
  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    requiredFields: ['id'],
    request: _getDetails,
    callback: (data: any) => {
      setImageUrl(_get(data, 'showUrl'));
      if (!_get(data, 'latitude') || !_get(data, 'longitude')) {
        setLng('');
        setLat('');
        return;
      }
      const longitude = _get(data, 'longitude');
      const latitude = _get(data, 'latitude');
      setLongitude(longitude);
      setLatitude(latitude);
      const WCJ = GPS.gcj_encrypt(Number(_get(data, 'latitude')), Number(_get(data, 'longitude')));
      const { lat: gcjLat, lon: gcjLon } = WCJ;
      setLng(gcjLon);
      setLat(gcjLat);

      setChange(false);
    },
  });
  const { data: basicInfoData } = useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getBaseInfo,
  });

  useEffect(() => {
    //没有经纬度，回填驾校地址
    if (!longitude || !latitude) {
      setSchoolAddress(_get(basicInfoData, 'address'));
    } else {
      setSchoolAddress('');
    }
  }, [basicInfoData]);

  useEffect(() => {
    setLng('');
    setLat('');
    setLongitude('');
    setLatitude('');
  }, []);

  const carTypeOptions = useOptions('business_scope', false, '-1', [], {
    query: { customHeader: { customSchoolId: Auth.get('schoolId') } },
    depends: [Auth.get('schoolId') as string],
    forceUpdate: true,
  });
  const simulatorTypeOption = useOptions('simulator_type'); // 模拟器类型

  const { loading: confirmLoading, run } = useRequest(isEdit ? _editModel : _addModel, {
    onSuccess: onOk,
  });

  return (
    <Modal
      visible
      width={900}
      title={title}
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      onOk={() => {
        form.validateFields().then(async (values) => {
          if (!imageUrl) {
            message.error('请上传模拟器图片');
            return;
          }
          const query = {
            ...values,
            longitude: '',
            latitude: '',
            tempId: imgId,
            buydate: moment(_get(values, 'buydate', '')).format('YYYY-MM-DD'),
          };
          console.log(change, 111);
          if (!lat || !lng) {
            message.error('请输入所在位置');
            return;
          }
          if (!change) {
            query.longitude = _get(data, 'longitude');
            query.latitude = _get(data, 'latitude');
          } else if (lat && lng) {
            const WGS = GPS.gcj_decrypt(lat, lng);
            const { lat: _lat, lon: _lng } = WGS;
            query.longitude = _lng;
            query.latitude = _lat;
          }

          run(isEdit ? { ...query, id: currentId } : query);
        });
      }}
    >
      {isLoading && <Loading />}
      {!isLoading && (
        <Form
          form={form}
          autoComplete="off"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          initialValues={{
            simulatorname: _get(data, 'simulatorname', ''),
            perdritype: _get(data, 'perdritype', ''),
            brand: _get(data, 'brand', ''),
            model: _get(data, 'model', ''),
            type: _get(data, 'type', ''),
            buydate: _get(data, 'buydate', '') ? moment(_get(data, 'buydate', '')) : undefined,
            manufacture: _get(data, 'manufacture', ''),
          }}
        >
          <Row>
            <ItemCol label="模拟器名称" name="simulatorname" rules={[RULES.SIMULATOR_NAME]}>
              <Input />
            </ItemCol>
            <ItemCol label="培训车型" name="perdritype" rules={[{ required: true }]}>
              <Select options={carTypeOptions} getPopupContainer={(triggerNode) => triggerNode.parentElement} />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol label="品牌" name="brand" rules={[RULES.BRAND]}>
              <Input />
            </ItemCol>
            <ItemCol label="型号" name="model" rules={[{ whitespace: true, required: true }, RULES.MODEL]}>
              <Input />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol label="类型" name="type" rules={[{ required: true }]}>
              <Select options={simulatorTypeOption} getPopupContainer={(triggerNode) => triggerNode.parentElement} />
            </ItemCol>
            <ItemCol label="购买日期" name="buydate" rules={[{ required: true }]}>
              <DatePicker
                disabledDate={(current: any): boolean => {
                  return current.diff(moment(new Date(), 'days')) > 0;
                }}
              />
            </ItemCol>
          </Row>
          <Row>
            <ItemCol
              label="生产厂家"
              name="manufacture"
              rules={[{ whitespace: true, required: true }, RULES.MANUFACTURE]}
            >
              <Input />
            </ItemCol>
            <Col span={12}>
              <Form.Item label="所在位置" required rules={[{ whitespace: true, required: true }, RULES.MANUFACTURE]}>
                <div className="flex space-around">
                  <Form.Item
                    // name="longitude"
                    rules={[{ required: true }]}
                    style={{ display: 'inline-block', width: '90px' }}
                  >
                    <Input
                      placeholder="经度"
                      style={{ width: 110 }}
                      value={longitude ? Number(longitude).toFixed(6) : ''}
                      disabled
                    />
                  </Form.Item>
                  <Form.Item
                    // name="latitude"
                    rules={[{ required: true }]}
                    style={{ display: 'inline-block', width: '90px', margin: '0 4px' }}
                  >
                    <Input
                      placeholder="纬度"
                      style={{ width: 110 }}
                      value={latitude ? Number(latitude).toFixed(6) : ''}
                      disabled
                    />
                  </Form.Item>
                  <span
                    onClick={() => {
                      setVisible();
                    }}
                    className="color-primary pointer"
                    style={{ marginTop: 8 }}
                  >
                    获取经纬度
                  </span>
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <ItemCol label="模拟器图片" required>
              <UploadPro
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                setImgId={setImgId}
                maxSize={Number(500 / 1024)}
              />
              <div className="mt20" style={{ color: 'red' }}>
                上传照片请不要超过500k
              </div>
            </ItemCol>
          </Row>
        </Form>
      )}
    </Modal>
  );
}
