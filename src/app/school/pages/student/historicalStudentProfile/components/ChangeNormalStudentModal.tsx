import * as React from 'react';
import { Form, message, Modal, Select } from 'antd';
import { _changeNormalStudent } from '../_api';
import { _get } from 'utils';
import { useEffect } from 'react';
import { useState } from 'react';
import { _queryDefaultChannelByPackage } from '../../studentInfo/_api';

interface Props {
  bankOptions: { label: string; value: string }[];
  classOptions: { label: string; value: string; price: number }[];
  sid: string;
  currentRecord: { [key: string]: any };
  // visible: boolean;
  setVisible: (visible: boolean) => void;
  refreshTable: () => void;
  cid?: string;
}

export type Values = {
  packageId: string;
  bankChannelId?: string;
};

/**
 *
 * 1. 判断是否又设置过班级
 * 1.1 如果已经设置过班级 班级和银行的展示
 * 1.2 如果没有设置过班级 就可自助选择 班级和所对应的银行
 * 1.3 如果是线下的就不用展示
 * 1.4 批量的转正（9-15）
 */

function ChangeNormalStudentModal({
  sid,
  currentRecord,
  // visible,
  setVisible,
  bankOptions,
  classOptions,
  refreshTable,
  cid,
}: Props) {
  const [form] = Form.useForm<Values>();
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isDefaultWalletLoading, setIsDefaultWalletLoading] = useState(false);
  const [isPackageDisabled, setIsPackageDisabled] = useState(false);
  const [isBankDisabled, setIsBankDisabled] = useState(false);

  // 根据该学员的当时存的银行是否依旧在目前现有数据中存在 判断是否禁用
  // 不应该根据学员的银行账户是否存在判断 避免镜像数据组织转正常学员
  // note: 班级同理
  useEffect(() => {
    if (bankOptions.length && currentRecord) {
      const res = bankOptions.find((bank) => bank.value === _get(currentRecord, 'bankChannelId'));
      if (!res) {
        setIsBankDisabled(false);
      } else {
        setIsBankDisabled(true);
      }
    }
  }, [bankOptions, currentRecord]);

  // 同银行禁用判断条件
  useEffect(() => {
    const res = classOptions.find((classOption) => classOption.value === _get(currentRecord, 'packageId'));
    if (!res) {
      setIsPackageDisabled(false);
      return;
    } else if (res && !_get(res, 'label')) {
      setIsPackageDisabled(false);
      return;
    } else {
      setIsPackageDisabled(true);
    }

    if (_get(currentRecord, 'packageId')) {
      if (_get(res, 'price') === 0) {
        setIsOffline(true);
        form.setFieldsValue({
          packageId: _get(currentRecord, 'packageId'),
        });
      } else {
        form.setFieldsValue({
          packageId: _get(currentRecord, 'packageId'),
          bankChannelId: _get(currentRecord, 'bankChannelId'),
        });
      }
    }
  }, [classOptions, currentRecord, form]);

  const onFinish = (values: Values) => {
    setConfirmLoading(true);
    const packageName = classOptions.find((classOption) => classOption['value'] === values['packageId'])?.label!;
    const query = { ...values, sid, packageName: packageName };
    _changeNormalStudent(query)
      .then((data) => {
        message.success(_get(data, 'message'));
      })
      .finally(() => {
        setConfirmLoading(false);
        setVisible(false);
        refreshTable();
      });
  };

  const setDefaultWallet = async (package_id: string) => {
    try {
      setIsDefaultWalletLoading(true);
      const defaultWalletRes = await _queryDefaultChannelByPackage({ package_id, cid })!;
      const defaultWallet = _get(defaultWalletRes, 'data');
      if (defaultWallet) {
        form.setFieldsValue({
          bankChannelId: _get(defaultWallet, 'bankChannelId'),
        });
      } else {
        form.setFieldsValue({
          bankChannelId: '',
        });
      }
    } finally {
      setIsDefaultWalletLoading(false);
    }
  };

  return (
    <Modal
      visible
      onOk={form.submit}
      onCancel={() => setVisible(false)}
      closable={false}
      maskClosable={false}
      title={'转正常学员'}
      width={400}
      confirmLoading={confirmLoading}
    >
      <Form wrapperCol={{ span: 14 }} labelCol={{ span: 6 }} form={form} onFinish={onFinish}>
        <Form.Item rules={[{ required: true }]} label="班级" name="packageId">
          <Select
            disabled={isPackageDisabled}
            options={classOptions}
            placeholder={'请选择班级'}
            showSearch={true}
            optionFilterProp={'label'}
            onChange={(value) => {
              const res = classOptions.find((classOption) => classOption.value === value);
              if (_get(res, 'price') === 0) {
                setIsOffline(true);
              } else {
                setIsOffline(false);
                // 1. 解决之前的遗留问题 替换班级的时候 银行的值应该 清空
                form.setFieldsValue({
                  bankChannelId: '',
                });
                // 2. 切换班级的时候去 发送查询是否有设置默认钱包
                setDefaultWallet(_get(res, 'value'));
              }
            }}
          />
        </Form.Item>
        {!isOffline && (
          <Form.Item rules={[{ required: true, message: '请选择银行' }]} label="银行" name="bankChannelId">
            <Select
              loading={isDefaultWalletLoading}
              options={bankOptions}
              disabled={isBankDisabled}
              placeholder={'请选择银行'}
              showSearch={true}
              optionFilterProp={'label'}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

export default React.memo(ChangeNormalStudentModal);
