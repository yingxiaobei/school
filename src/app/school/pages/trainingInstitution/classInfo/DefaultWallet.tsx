import { useMemo, useEffect, useState } from 'react';
import { Modal, Form, Select, Spin, Button, Space, message } from 'antd';
import { useFetch, useGoto } from 'hooks';
import { OpenAccount, _checkAndSetDefaultWallet, _getOpenAccount } from './_api';
import { Auth, _get } from 'utils';

interface Props {
  selectedRowKeys: string[];
  _handleOk: () => void;
  setDefaultWalletVisible: () => void;
}

type FormValues = {
  bankChannelId: string;
};

export default function useDefaultWallet({ selectedRowKeys, setDefaultWalletVisible, _handleOk }: Props) {
  const { _push } = useGoto();
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm<FormValues>();

  const { data, isLoading }: { data: OpenAccount[]; isLoading: boolean } = useFetch({
    request: _getOpenAccount,
  });

  const openAccount = useMemo(() => {
    return ((data || []) as OpenAccount[]).reduce(
      (pre, acc) => {
        pre.push({
          label: _get(acc, 'acctBankName', ''),
          value: _get(acc, 'bankChannelId', ''),
        });
        return pre;
      },
      // [{ label: '请选择', value: '' }],
      [] as { label: string; value: string }[],
    );
  }, [data]);

  useEffect(() => {
    if (openAccount.length === 1) {
      form.setFieldsValue({ bankChannelId: _get(openAccount, [0, 'value'], '') });
    }
  }, [form, openAccount]);

  async function submit({ bankChannelId }: FormValues) {
    try {
      if (!bankChannelId) {
        return message.error('请选择收款钱包。');
      }
      setLoading(true);

      const currentBankchannelName = _get(
        openAccount.find((item) => item.value === bankChannelId),
        'label',
        '',
      );
      const query = {
        bankChannelId: bankChannelId,
        bankChannelName: currentBankchannelName,
        packageIds: selectedRowKeys,
        schoolId: Auth.get('schoolId') || '',
      };
      const response = await _checkAndSetDefaultWallet(query);
      const code = _get(response, 'code');

      if (code !== 200) {
        return message.error(_get(response, 'message'));
      }

      // 成功了关闭弹窗
      setDefaultWalletVisible();
      _handleOk();
    } finally {
      setLoading(false);
    }
  }

  function openAmount() {
    _push('financial/wallet');
    setDefaultWalletVisible();
  }

  return (
    <>
      <Modal
        title={'设置默认收款钱包'}
        visible
        onCancel={() => {
          setDefaultWalletVisible();
        }}
        onOk={() => {
          form.submit();
        }}
        confirmLoading={loading}
        maskClosable={false}
      >
        <Spin spinning={isLoading}>
          <Form form={form} onFinish={submit} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Form.Item label="收款钱包">
              <Space>
                <Form.Item noStyle name="bankChannelId">
                  <Select placeholder="请选择" options={openAccount} />
                </Form.Item>
                <Button type="link" onClick={openAmount}>
                  更多钱包
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  );
}
