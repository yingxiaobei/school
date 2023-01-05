import { useState } from 'react';
import { _get } from 'utils';
import { Input, Form, Modal, message, Row, Col, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { _addUser, _editUser, _checkUsername } from './_api';
import OrgSelect from '../roleManage/OrgSelect';
import { useRequest } from 'hooks';
import { RULES } from 'constants/rules';

export default function Add(props) {
  const [form] = Form.useForm();
  const { title, visible, onOk, onCancel, currentRecord, isEdit, _setBindUserVisible, setCurrentUserName } = props;
  const [selectedVal, setSelectedVal] = useState([]);
  const [labelVisible, _setLabelVisible] = useState(false);
  const [username, _setUserName] = useState();
  const [selectedId, setSelectedId] = useState([]);

  const { loading: confirmLoading, run } = useRequest(isEdit ? _editUser : _addUser, {
    onSuccess: onOk,
  });

  return (
    <Modal
      title={title}
      visible={visible}
      width={700}
      maskClosable={false}
      confirmLoading={confirmLoading}
      onOk={() => {
        form.validateFields().then(async (values) => {
          if (isEdit) {
            run({
              id: _get(currentRecord, 'id'),
              orgIds: selectedId,
              username: _get(values, 'username'),
              name: _get(values, 'name'),
              mobilePhone: _get(values, 'mobilePhone'),
            });
          } else {
            const checkRes = await _checkUsername({ username: _get(values, 'username') });
            if (checkRes) {
              message.error('该用户已存在');
              return;
            }
            run({
              orgIds: selectedId,
              username: _get(values, 'username'),
              name: _get(values, 'name'),
              mobilePhone: _get(values, 'mobilePhone'),
            });
          }
        });
      }}
      onCancel={onCancel}
    >
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        autoComplete="off"
        initialValues={{
          orgIds: _get(currentRecord, 'orgIds'),
          username: _get(currentRecord, 'username'),
          name: _get(currentRecord, 'name'),
          mobilePhone: _get(currentRecord, 'mobilePhone'),
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
                setSelectedId(valueArr);
              }}
              value={selectedVal}
            />
          </Form.Item>
        }
        <Row>
          <Col span={12} offset={3}>
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ whitespace: true, required: true, message: '请输入用户名!' }, RULES.USER_NAME]}
            >
              <Input
                disabled={isEdit}
                onChange={async (e) => {
                  e.persist();
                  const checkRes = await _checkUsername({ username: e.target.value });
                  if (checkRes === true) {
                    _setLabelVisible(true);
                    _setUserName(e.target.value);
                    return;
                  }
                  _setLabelVisible(false);
                  _setUserName('');
                }}
              />
            </Form.Item>
          </Col>
          <Col>
            <Tooltip title={'由字母，数字， _， - 组成，有效长度为1-16个字符'}>
              <QuestionCircleOutlined className="questionIcon-30" />
            </Tooltip>
          </Col>
        </Row>

        {labelVisible && (
          <div style={{ marginLeft: 200, marginBottom: 10 }}>
            <span>
              用户名{username}已存在,
              <span
                className="color-primary pointer"
                onClick={() => {
                  setCurrentUserName(username);
                  _setBindUserVisible();
                }}
              >
                去关联
              </span>
            </span>
          </div>
        )}
        <Row>
          <Col span={12} offset={3}>
            <Form.Item
              label="姓名"
              name="name"
              rules={[{ whitespace: true, required: true, message: '请输入正确的姓名' }, RULES.USERCENTER_NAME]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col>
            <Tooltip title={'有效长度为1-20个字符'}>
              <QuestionCircleOutlined className="questionIcon-30" />
            </Tooltip>
          </Col>
        </Row>
        <Form.Item
          label="手机号"
          name="mobilePhone"
          rules={[{ whitespace: true, required: true, message: '请输入手机号' }, RULES.TEL_11]}
        >
          <Input placeholder={'登录密码将发送到输入的手机号'} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
