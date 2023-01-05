import { useEffect, useState } from 'react';
import { Modal, Button, Input, Form, message, Select } from 'antd';
import { _setPassword, _getUserId, _getStudentCer, _getSchoolInfo, _getCarList, _getCernNoLogin } from './_api';
import { _get } from 'utils';
import { useFetch, useRequest } from 'hooks';
import { _register } from 'app/yantai/_api';

interface IProps {
  onCancel(): void;
}

export default function LoginModal(props: IProps) {
  const { onCancel } = props;
  const [schoolId, setSchoolId] = useState('');
  const [schoolOption, setSchoolOption] = useState([]);
  const [form] = Form.useForm();
  const { run } = useRequest(_register, { onSuccess: () => {} });

  // 驾校列表
  const { data } = useFetch({
    request: _getSchoolInfo,
    query: {
      cityCode: '370100', // TODO: 待获取  370100：济南
    },
    callback: (data: any) => {
      const schoolOptions = _get(data, 'rows', []).map((item: any) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
      setSchoolOption(schoolOptions);
    },
  });

  // 车辆列表
  const { data: carList = [] } = useFetch({
    request: _getCarList,
    query: { userSchIdSelected: form.getFieldValue('schoolId') },
    depends: [form.getFieldValue('schoolId')],
  });

  async function _onFinish(values: object) {
    const res = await _getStudentCer({
      idcard: _get(values, 'idcard', ''),
      name: _get(values, 'name', ''),
      traintype: 'C1',
      schoolId,
    });

    if (_get(res, 'code') === 200) {
      onCancel();
    } else {
      message.error(_get(res, 'message'));
    }
  }

  async function _cerifty() {
    const res = await _getCernNoLogin({
      idcard: form.getFieldValue('idcard'),
      name: form.getFieldValue('name'),
      traintype: 'C1',
      schoolId,
    });

    if (_get(res, 'code') === 200) {
      onCancel();
    } else {
      message.error(_get(res, 'message'));
    }
  }

  return (
    <Modal visible title={'认证'} onCancel={onCancel} footer={null}>
      <Form form={form} onFinish={_onFinish} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item
          label="报名驾校"
          name="schoolId"
          rules={[
            {
              required: false,
              message: '请选择报名驾校！',
            },
          ]}
        >
          <Select
            showSearch
            onSearch={(name) => {
              const query = { cityCode: '370100', name };
              _getSchoolInfo(query).then((res: any) => {
                setSchoolOption(
                  _get(res, 'data.rows', []).map((item: any) => {
                    return {
                      label: item.name,
                      value: item.id,
                    };
                  }),
                );
              });
            }}
            options={schoolOption}
            onChange={(value: string) => {
              setSchoolId(value);
            }}
          />
        </Form.Item>

        <Form.Item
          label="培训车型"
          name="traintype"
          rules={[
            {
              required: false,
              message: '请选择培训车型！',
            },
          ]}
        >
          <Select />
        </Form.Item>

        <Form.Item
          label="姓名"
          name="name"
          rules={[
            {
              required: false,
              message: '请输入姓名',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="证件号码"
          name="idcard"
          rules={[
            {
              required: false,
              message: '请输入证件号码',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="full-width">
            登录过的认证
          </Button>

          <Button type="primary" onClick={_cerifty} className="full-width mt20">
            未登录认证
          </Button>

          <Button
            type="primary"
            onClick={() => run({ sid: '1', schid: '2', mobilePhone: '3', password: '4', code: '5' })}
            className="full-width mt20"
          >
            注册
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
