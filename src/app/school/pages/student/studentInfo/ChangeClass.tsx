import { useEffect, useState } from 'react';
import { Modal, Form, Select, Space, Spin } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { _updatePackageByKey, _getClassList, _getDetails, _queryDefaultChannelByPackage } from './_api';
import { _queryOpenedBanks } from '../historicalStudentProfile/_api';
import { useFetch, useRequest } from 'hooks';
import { Auth, _get } from 'utils';
import type { ClassList } from './_api';
interface IProps {
  visible: boolean;
  handleCancel: () => void;
  customSchoolId: string;
  sid: string;
  handleOk: () => void;
  cid?: string;
}

type ClassOption = { label: string; value: string; price: number };

const ChangeClass = (props: IProps) => {
  const { visible, handleCancel, sid, customSchoolId, handleOk, cid } = props;
  const [package_name, setPackage_name] = useState('');
  const [package_id, setPackage_id] = useState('');
  const [bankchannelid, setBankchannelid] = useState(''); // 开户银行ID
  const [train_price_online, setTrain_price_online] = useState(0);
  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
  const [defaultWalletLoading, setDefaultWalletLoading] = useState(false);
  const [form] = useForm();

  const { data: detail, isLoading } = useFetch({
    //个人信息
    query: {
      id: sid,
    },
    customHeader: { customSchoolId },
    request: _getDetails,
  });

  const { loading: confirmLoading, run } = useRequest(_updatePackageByKey, {
    onSuccess: () => {
      handleOk();
    },
  });

  const {
    data: banks = [],
  }: { data: { acctBankName: string; bankAccount: string; bankChannelId: string }[] } = useFetch({
    request: _queryOpenedBanks,
    query: {
      userId: Auth.get('schoolId'),
    },
    depends: [],
  });

  const bankOptions = banks.map((bank: { acctBankName: string; bankAccount: string; bankChannelId: string }) => {
    return {
      label: bank.acctBankName,
      value: bank.bankChannelId,
    };
  });

  const { data }: { data: ClassList } = useFetch({
    request: _getClassList,
    query: {
      page: 1,
      limit: 100,
      isEffective: 1, // 包含已经注销的班级 (更换班级的手段 是控制在服务工程师中 不是在驾校手中 实际是为了那些 好像是有些线下班级在注册的时候是 无法选择的 但是到了更换班级的时候 服务工程师需要切换到这些线下班级)
      traintype: detail?.traintype,
      studenttype: detail?.studenttype,
      isOnline: 1,
      isEnabled: 1,
    },
    depends: [sid, detail],
    requiredFields: ['traintype', 'studenttype'],
  });

  const setFormValue = async (classOptions: ClassOption[]) => {
    try {
      const package_id = _get(classOptions, ['0', 'value'], '');
      setPackage_name(_get(classOptions, ['0', 'label'], ''));
      setPackage_id(package_id);
      // 班级 银行联动
      const price = _get(classOptions, ['0', 'price'], '');
      setTrain_price_online(_get(classOptions, ['0', 'price'], ''));

      if (price && package_id) {
        setDefaultWalletLoading(true);
        const defaultWalletRes = await _queryDefaultChannelByPackage({ package_id, cid })!;
        const defaultWallet = _get(defaultWalletRes, 'data');
        if (defaultWallet) {
          // TODO: 可控操作和不可控选项都设置
          form.setFieldsValue({
            bankchannel: _get(defaultWallet, 'bankChannelId', ''),
          });
          setBankchannelid(_get(defaultWallet, 'bankChannelId', ''));
        } else {
          form.setFieldsValue({
            bankchannel: '',
          });
          setBankchannelid('');
        }
      }
    } finally {
      setDefaultWalletLoading(false);
    }
  };

  useEffect(() => {
    const classOptions = _get(data, 'rows', []).map((item) => {
      return { label: item.packlabel, value: item.packid, price: item.train_price_online };
    });
    setClassOptions(classOptions);
  }, [data]);

  useEffect(() => {
    if (classOptions.length === 1) {
      form.setFields([{ name: 'packageid', value: _get(classOptions, ['0', 'value'], '') }]);
      setFormValue(classOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classOptions, form]);

  return (
    <div>
      <Modal
        title="更换班级"
        visible={visible}
        confirmLoading={confirmLoading}
        onOk={() => {
          form.validateFields().then((res) => {
            // TODO: 可控操作和不可控选项都设置
            run({
              bankchannelid: bankchannelid || undefined,
              package_id: package_id,
              package_name: package_name,
              sid: sid,
            });
          });
        }}
        onCancel={handleCancel}
        okText="确定变更"
      >
        <Spin spinning={isLoading}>
          <Form form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
            <Form.Item label="学员姓名">{_get(detail, 'name')}</Form.Item>
            <Form.Item label="培训车型">{_get(detail, 'traintype')}</Form.Item>
            <Form.Item label="当前学员班级">
              <Space>
                {_get(detail, 'package_name')}
                {!!_get(detail, 'train_price_online') ? _get(detail, 'bankchannelname') : ''}
              </Space>
            </Form.Item>
            <Form.Item
              label="更换班级"
              extra={
                !!train_price_online && (
                  <div className="mt10" style={{ color: '#000' }}>
                    需学员在线缴费{train_price_online}
                  </div>
                )
              }
              name="packageid"
              rules={[{ required: true, message: '请选择更换班级' }]}
            >
              <Select
                options={classOptions}
                placeholder={'请选择班级'}
                showSearch={true}
                optionFilterProp={'label'}
                onChange={(value) => {
                  const effectiveClassData = classOptions.filter((x) => x.value === value);
                  setFormValue(effectiveClassData);
                  // 切换班级会清空银行账户的数据
                  form.setFields([{ name: 'bankchannel', value: '' }]);
                  setBankchannelid('');
                }}
              />
            </Form.Item>

            {!!train_price_online && (
              <Form.Item label="银行账号" name="bankchannel" rules={[{ required: true, message: '请选择银行账号' }]}>
                <Select
                  options={bankOptions}
                  loading={defaultWalletLoading}
                  placeholder={'请选择银行'}
                  showSearch={true}
                  optionFilterProp={'label'}
                  onChange={(value) => {
                    const openAccountDataInfo = bankOptions.filter((x) => x.value === value);
                    setBankchannelid(_get(openAccountDataInfo, '0.value', ''));
                  }}
                />
              </Form.Item>
            )}
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default ChangeClass;
