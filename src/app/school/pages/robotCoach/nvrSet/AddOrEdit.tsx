import { useState } from 'react';
import { Modal, Form, Select, Input, Row } from 'antd';
import { _get } from 'utils';
import { useFetch, useRequest } from 'hooks';
import { _addNvrItem, _editNvrItem, _getKeyDetails, _getCarList } from './_api';
import { Loading, ItemCol } from 'components';
import { RULES } from 'constants/rules';

export default function AddOrEdit(props: any) {
  const [licnumOptionData, setLicnumOptionData] = useState([]);

  const { onCancel, title, onOk, currentId, isEdit } = props;
  const [form] = Form.useForm();

  // 根据id获取详情
  const { data, isLoading } = useFetch({
    request: _getKeyDetails,
    query: { id: currentId },
    depends: [currentId],
    requiredFields: ['id'],
  });

  const { loading: confirmLoading, run } = useRequest(isEdit ? _editNvrItem : _addNvrItem, {
    onSuccess: onOk,
  });

  return (
    <Modal
      title={title}
      visible
      width={900}
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      onOk={() => {
        form.validateFields().then(async (values) => {
          const query = {
            licnum: _get(values, 'licnum'),
            ipc_account: _get(values, 'ipc_account'),
            ipc_ip: _get(values, 'ipc_ip'),
            ipc_port: Number(_get(values, 'ipc_port')),
            ipc_pwd: _get(values, 'ipc_pwd'),
            nvr_account: _get(values, 'nvr_account'),
            nvr_channel: _get(values, 'nvr_channel'),
            nvr_ip: _get(values, 'nvr_ip'),
            nvr_port: Number(_get(values, 'nvr_port')),
            nvr_pwd: _get(values, 'nvr_pwd'),
          };
          const queryFinal = isEdit
            ? {
                ...query,
                id: currentId,
              }
            : {
                ...query,
              };
          run(queryFinal);
        });
      }}
    >
      {isLoading && <Loading />}
      {!isLoading && (
        <Form
          form={form}
          autoComplete="off"
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 14 }}
          initialValues={{
            licnum: _get(data, 'licnum'),
            ipc_account: _get(data, 'ipc_account'),
            ipc_ip: _get(data, 'ipc_ip'),
            ipc_port: _get(data, 'ipc_port'),
            ipc_pwd: _get(data, 'ipc_pwd'),
            nvr_account: _get(data, 'nvr_account'),
            nvr_channel: _get(data, 'nvr_channel'),
            nvr_ip: _get(data, 'nvr_ip'),
            nvr_port: _get(data, 'nvr_port'),
            nvr_pwd: _get(data, 'nvr_pwd'),
          }}
        >
          <Row>
            <ItemCol span={12} label="车牌号" name="licnum" rules={[{ required: true, message: '车辆不能为空' }]}>
              <Select
                showSearch
                filterOption={false}
                onSearch={(value) => {
                  const query = { licnum: value };
                  _getCarList(query).then((res: any) => {
                    setLicnumOptionData(
                      _get(res, 'data', []).map((x: any) => {
                        return {
                          lable: x.text,
                          value: x.text,
                        };
                      }),
                    );
                  });
                }}
                options={licnumOptionData}
              ></Select>
            </ItemCol>
            <ItemCol span={12} label="IPC IP" name="ipc_ip" rules={[{ required: true, message: 'IPC IP不能为空' }]}>
              <Input />
            </ItemCol>

            <ItemCol
              span={12}
              label="硬盘录像机IP"
              name="nvr_ip"
              rules={[{ required: true, message: '磁盘录像机IP不能为空' }]}
            >
              <Input />
            </ItemCol>
            <ItemCol
              span={12}
              label="硬盘录像机通道"
              name="nvr_channel"
              rules={[{ required: true, message: '磁盘录像机通道不能为空' }]}
            >
              <Input />
            </ItemCol>

            <ItemCol
              span={12}
              label="硬盘录像机账号"
              name="nvr_account"
              rules={[{ required: true, message: '硬盘录像机账号不能为空' }]}
            >
              <Input />
            </ItemCol>
            <ItemCol
              span={12}
              label="硬盘录像密码"
              name="nvr_pwd"
              rules={[{ required: true, message: '硬盘录像密码不能为空' }]}
            >
              <Input />
            </ItemCol>

            <ItemCol
              span={12}
              label="IPC 账号"
              name="ipc_account"
              rules={[{ required: true, message: 'IPC 账号不能为空' }]}
            >
              <Input />
            </ItemCol>
            <ItemCol
              span={12}
              label="IPC 密码"
              name="ipc_pwd"
              rules={[{ required: true, message: 'IPC 密码不能为空' }]}
            >
              <Input />
            </ItemCol>

            <ItemCol
              span={12}
              label="IPC 端口"
              name="ipc_port"
              rules={[{ required: true, message: 'IPC 端口不能为空' }, RULES.NVR_PORT]}
            >
              <Input />
            </ItemCol>
            <ItemCol
              span={12}
              label="硬盘录像机端口"
              name="nvr_port"
              rules={[{ required: true, message: '磁盘录像机端口不能为空' }, RULES.NVR_PORT]}
            >
              <Input />
            </ItemCol>
          </Row>
        </Form>
      )}
    </Modal>
  );
}
