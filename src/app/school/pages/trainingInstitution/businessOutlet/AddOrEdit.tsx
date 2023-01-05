import { useEffect, useRef, useState } from 'react';
import { Modal, Form, Row, Col, Input, message } from 'antd';
import { useFetch } from 'hooks';
import { _details, _addBusinessOutlet, _updateBusinessOutlet, _getTreeByLoginUser } from './_api';
import { _get, GPS } from 'utils';
import { Loading, Title, Location } from 'components';
import { RULES } from 'constants/rules';
import { HomeFilled } from '@ant-design/icons';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import { useVisible } from 'hooks';
import OrgSelect from '../../userCenter/roleManage/OrgSelect';
import MapInput from '../teachingArea/MapInput';

export default function AddOrEdit(props: any) {
  const { onCancel, currentId, isEdit, title, onOk } = props;
  const [form] = Form.useForm();
  const [selectedOrgan, setSelectedOrgan] = useState<any>([]);
  const [selectedVal, setSelectedVal] = useState([]);
  const [visible, _switchVisible] = useVisible();
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [address, setAddress] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);

  const { data, isLoading } = useFetch({
    query: {
      id: currentId,
    },
    requiredFields: ['id'],
    request: _details,
    callback: (data: any) => {
      const WCJ = GPS.gcj_encrypt(Number(_get(data, 'latitude')), Number(_get(data, 'longitude')));
      const { lat: gcjLat = 0, lon: gcjLon = 0 } = WCJ;
      setSelectedOrgan(_get(data, 'orgIds', []));
      setLongitude(gcjLon.toFixed(6));
      setLatitude(gcjLat.toFixed(6));
      setAddress(_get(data, 'address'));
    },
  });

  const { data: organTree = [] } = useFetch({
    request: _getTreeByLoginUser,
  });

  return (
    <>
      {visible && (
        <Location
          onCancel={_switchVisible}
          onOk={_switchVisible}
          setLatitude={setLatitude}
          longitude={longitude}
          latitude={latitude}
          setLongitude={setLongitude}
        />
      )}
      <Modal
        visible
        width={900}
        title={title}
        maskClosable={false}
        confirmLoading={btnLoading}
        onCancel={onCancel}
        onOk={() => {
          if (!address) {
            message.error('请输入网点地址');
            return;
          }
          if (!RULES.OUTLET_ADDRESS.pattern.test(address.trim())) {
            message.error(RULES.OUTLET_ADDRESS.message);
            return;
          }

          form.validateFields().then(async (values) => {
            const WGS = GPS.gcj_decrypt(latitude, longitude);
            const { lat, lon: lng } = WGS;
            const query = {
              branchname: _get(values, 'branchname'),
              shortname: _get(values, 'shortname'),
              contact: _get(values, 'contact'),
              phone: _get(values, 'phone'),
              address,
              orgIds: selectedOrgan,
              longitude: lng,
              latitude: lat,
            };
            setBtnLoading(true);
            const res = isEdit
              ? await _updateBusinessOutlet({ ...query, sbnid: currentId })
              : await _addBusinessOutlet(query);
            setBtnLoading(false);
            if (_get(res, 'code') === 200) {
              onOk();
            }
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
              orgIds: _get(data, 'orgIds'),
              branchname: _get(data, 'branchname'),
              shortname: _get(data, 'shortname'),
              contact: _get(data, 'contact'),
              phone: _get(data, 'phone'),
            }}
          >
            <Title>基本信息</Title>

            <Row>
              <Col span={12}>
                <Form.Item
                  label="网点名称"
                  name="branchname"
                  rules={[{ whitespace: true, required: true, message: '请输入网点名称' }, RULES.OUTLET_NAME]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="网点简称"
                  name="shortname"
                  rules={[{ whitespace: true, required: true, message: '请输入网点简称' }, RULES.OUTLET_INTRODUCTION]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="网点地址">
                  <MapInput
                    callback={(point: any) => {
                      if (point) {
                        setLongitude(_get(point, 'lng').toFixed(6));
                        setLatitude(_get(point, 'lat').toFixed(6));
                      }
                    }}
                    value={address}
                    setValue={setAddress}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="地图地址">
                  <Input value={longitude ? `${longitude}, ${latitude}` : ''} />
                  <HomeFilled
                    onClick={_switchVisible}
                    style={{ cursor: 'pointer', marginLeft: 10, color: PRIMARY_COLOR }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Title>联系方式</Title>

            <Row>
              <Col span={12}>
                <Form.Item label="联系人" name="contact" rules={[RULES.BRANCH_CONCAT]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="联系电话" name="phone" rules={[RULES.TEL_TELEPHONE_MOBILE]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Title>权限管理</Title>
            <Row>
              <Col span={12}>
                <Form.Item label="部门" required name="orgIds" rules={[{ required: true, message: '请选择部门' }]}>
                  <OrgSelect
                    callbackFun={() => {
                      setSelectedVal(_get(organTree, 'id', []));
                    }}
                    onChange={(val: any) => {
                      let valueArr = val.map((obj: any) => {
                        return obj.value;
                      });
                      setSelectedOrgan(valueArr);
                    }}
                    value={selectedVal}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    </>
  );
}
