import { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { Auth, _checkPassword, _get } from 'utils';
import { _requestGJ } from 'utils/cardUtil';

export default function InputPIN(props: any) {
  const {
    onOk,
    onCancel,
    currentId,
    uKeyReport,
    index = 0,
    errorCount = 0,
    batch = false,
    ukeyFactory,
    fzUkReport,
    keySn,
  } = props;
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const checkFzPin = async (values: any) => {
    const errorObj: any = {
      '-1': '未安装签名组件',
      '-12': '获取证书失败',
      '-13': '签名时，加载证书失败',
      '-15': '签名数据不能为空',
      '-16': '密码不能为空',
      '-17': '解析证书失败',
      '-2': '待验证pin的UKey和当前插入的UKey不匹配',
      '1': '没有检测到用户UKey',
      '2': '非法为授权的UKey',
      '3': '没有找到UKey驱动文件',
      '4': '插入太多的UKey',
      '7': '密码错误',
      '8': '非法授权UKey',
    };
    const iwebAssist = new window.iWebAssist({ cilentType: '0' });
    Promise.all([iwebAssist.promise]).then(function () {
      iwebAssist.getPin(_get(values, 'pin', ''), keySn).then(function (data: any) {
        if (data.result == true) {
          Auth.set('pin', _get(values, 'pin', ''));
          fzUkReport(currentId, index, errorCount, batch);
          onOk();
          return;
        } else {
          var messge = errorObj[data.errcode] || data.errmsg || '未知异常';
          message.error(messge || '操作失败');
          return false;
        }
      });
    });
  };
  const checkGjPin = async (values: any) => {
    const loginRes: any = await _requestGJ({
      function: 'SOF_Login',
      CertOptID: Auth.get('devSn'),
      PassWd: _get(values, 'pin', ''),
    });
    if (!_get(loginRes, 'RETURN', '')) {
      message.error('PIN不正确');
    } else {
      Auth.set('gjpin', _get(values, 'pin', ''));
      uKeyReport(batch);
      onOk();
    }

    // const res = await _checkPassword({
    //   PassWord: _get(values, 'pin', ''),
    // });
    // if (_get(res, 'return', '') === 0) {
    //   Auth.set('pin', _get(values, 'pin', ''));
    //   uKeyReport(currentId, index, errorCount, batch);
    //   onOk();
    // } else {
    //   message.error('PIN不正确');
    // }
    return;
  };

  return (
    <Modal
      visible
      title="请输入PIN"
      confirmLoading={loading}
      onCancel={() => {
        onCancel();
      }}
      onOk={() => {
        form.validateFields().then(async (values) => {
          setLoading(true);
          if (ukeyFactory === '1') {
            await checkGjPin(values);
          } else {
            await checkFzPin(values);
          }
          setLoading(false);
        });
      }}
    >
      <Form form={form} autoComplete="off">
        <Form.Item name="pin" label="PIN" rules={[{ whitespace: true, required: true, message: '请输入PIN' }]}>
          <Input placeholder="请输入PIN码" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
