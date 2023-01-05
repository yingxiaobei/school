import { useState } from 'react';
import { _get } from 'utils';
import { Input, Form, Modal, Row, Col, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { _addRole, _editRole } from './_api';
import OrgSelect from './OrgSelect';
import { RULES } from 'constants/rules';
const { TextArea } = Input;

export default function Add(props) {
  const [form] = Form.useForm();
  const { title, onOk, onCancel, currentRecord, isEdit } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedVal, setSelectedVal] = useState([]);

  const [selectedOrgIds, setSelectedOrgIds] = useState([]);

  return (
    <Modal
      title={title}
      width={700}
      visible
      maskClosable={false}
      confirmLoading={confirmLoading}
      onOk={() => {
        form.validateFields().then(async (values) => {
          let res;
          setConfirmLoading(true);
          if (isEdit) {
            res = await _editRole({
              id: _get(currentRecord, 'id'),
              name: _get(values, 'name'),
              description: _get(values, 'description'),
              orgIds: selectedOrgIds,
              code: _get(values, 'code'),
            });
          } else {
            res = await _addRole({
              name: _get(values, 'name'),
              description: _get(values, 'description'),
              orgIds: selectedOrgIds,
              code: _get(values, 'code'),
            });
          }

          if (_get(res, 'code') === 200) {
            onOk();
          }
          setConfirmLoading(false);
        });
      }}
      onCancel={onCancel}
    >
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={{
          orgIds: _get(currentRecord, 'orgIds'),
          name: _get(currentRecord, 'name'),
          description: _get(currentRecord, 'description'),
          code: _get(currentRecord, 'code'),
        }}
      >
        {
          <Form.Item label="所属组织" name="orgIds" rules={[{ required: true, message: '请选择组织' }]}>
            <OrgSelect
              callbackFun={() => {
                setSelectedVal(_get(currentRecord, 'id'));
              }}
              onChange={(val) => {
                let valueArr = val.map((obj) => {
                  return obj.value;
                });
                setSelectedOrgIds(valueArr);
              }}
              value={selectedVal}
            />
          </Form.Item>
        }
        <Row>
          <Col span={12} offset={3}>
            <Form.Item
              label="编码"
              name="code"
              rules={[{ whitespace: true, required: true, message: '请输入编码!' }, RULES.CODE]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col>
            <Tooltip title={'由字母，数字， _， - 组成，有效长度为1-16个字符'}>
              <QuestionCircleOutlined className="questionIcon-30" />
            </Tooltip>
          </Col>
        </Row>
        <Row>
          <Col span={12} offset={3}>
            <Form.Item
              label="名称"
              name="name"
              rules={[{ whitespace: true, required: true, message: '请输入名称!' }, RULES.ROLE_NAME]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col>
            <Tooltip title={'有效长度为1-16个字符'}>
              <QuestionCircleOutlined className="questionIcon-30" />
            </Tooltip>
          </Col>
        </Row>
        <Form.Item label="描述" name="description" rules={[RULES.DESCRIPTION]}>
          <TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
}
