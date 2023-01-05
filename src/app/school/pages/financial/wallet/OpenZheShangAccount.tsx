import { useState } from 'react';
import { Button, Modal, message, Row, Input, Form, Col, Select, Space } from 'antd';
import { IF, Loading } from 'components';
import { RULES } from 'constants/rules';
import { _getBaseInfo, _getOpenZsSendMsg, _openSchoolAccount, _searchBank } from './_api';
import { useCountdown, useFetch, useRequest, useOptions } from 'hooks';
import { Auth, _get } from 'utils';
interface IProps {
  onCancel: (params: boolean) => void;
  onOk: () => void;
  bankChannelId: string;
}

export default function OpenZheShangAccount(props: IProps) {
  const { onCancel, onOk, bankChannelId } = props;
  const [loading, setLoading] = useState(false);
  const [acctMobile, setAcctMobile] = useState('');
  const [acctName, setAcctName] = useState('');
  const [bankName, setBankName] = useState(); // 银行名称
  const [form] = Form.useForm();
  const { Option } = Select;
  const { count, isCounting, setIsCounting } = useCountdown(60);
  const [searchHeadBankName, setSearchHeadBankName] = useState(null) as any;
  const [searchBranchBankName, setSearchBranchBankName] = useState(null) as any;
  const [headBankName, setHeadBankName] = useState('');
  const cardTypeOptions = useOptions('organ_credentials_type');
  const [captchaNo, setCaptchaNo] = useState('');
  const [cardType, setCardType] = useState('2');

  // 驾校基本信息详情
  const { data: schoolData, isLoading: schoolDataLoading } = useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getBaseInfo,
    callback(data: any) {
      setAcctName(_get(data, 'name', ''));
    },
  });

  // 提交开户申请
  const { loading: openClassTwoBankAccountLoading, run: openBankAccountRun } = useRequest(_openSchoolAccount, {
    onSuccess: () => {
      onCancel(false);
      onOk();
    },
  });
  //总行
  const { data: bankListData = {} } = useFetch({
    request: _searchBank,
    query: {
      type: '0', // 查询类型 0:查总行 1:查支行
      bankName: searchHeadBankName, //银行名称 支持模糊搜索
    },
    depends: [searchHeadBankName],
    requiredFields: ['bankName'],
  });
  //支行
  const { data: branchBankListData = {} } = useFetch({
    request: _searchBank,
    query: {
      type: '1', // 查询类型 0:查总行 1:查支行
      bankName: headBankName,
      bankBranchName: searchBranchBankName, //银行名称 支持模糊搜索
    },
    depends: [searchBranchBankName],
    requiredFields: ['bankName'],
  });

  return (
    <Modal
      visible
      title={'资料填写'}
      maskClosable={false}
      onCancel={() => onCancel(false)}
      footer={
        <>
          <Button key="back" onClick={() => onCancel(false)}>
            取消
          </Button>
          <Button
            key="submit"
            loading={openClassTwoBankAccountLoading}
            type="primary"
            onClick={() => {
              form.validateFields().then((values) => {
                if (!bankName) {
                  message.error('请选择开户银行');
                  return;
                }

                const query = {
                  bankChannelId: bankChannelId, // 开户渠道ID
                  bankName: bankName, // 开户银行
                  accId: _get(values, 'accId'), // 证件号码 这里传社会信用代码
                  acctNo: _get(values, 'acctNo'), // 银联号
                  credentialType: _get(values, 'credentialType'), // 证件类型,暂只支持：1：身份证 2 营业执照
                  accMobile: _get(values, 'accMobile'), // 账户预留手机号
                  acctName, // 账户名称
                  bankNo: _get(values, 'bankNo'), // 银行账号
                  captcha: _get(values, 'captcha'), // 短信验证码
                  captchaNo,
                  // merNamec: _get(values, 'merNamec'), // 企业名称
                };
                openBankAccountRun(query);
              });
            }}
          >
            确定
          </Button>
        </>
      }
      width={800}
    >
      <IF
        condition={schoolDataLoading}
        then={<Loading />}
        else={
          <Form
            form={form}
            autoComplete="off"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            initialValues={{
              componyName: _get(schoolData, 'name'),
              credentialType: '2',
              accId: _get(schoolData, 'socialCredit'),
            }}
          >
            <Form.Item
              label="企业名称"
              name="componyName"
              rules={[{ whitespace: true, required: true, message: '请输入企业名称' }, RULES.COMPANY_NAME]}
            >
              <Input
                value={acctName}
                onChange={(e: any) => {
                  setAcctName(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item
              label="证件类型"
              name="credentialType"
              rules={[{ whitespace: true, required: true, message: '请选择证件类型' }]}
            >
              <Select
                options={cardTypeOptions}
                onChange={(v: string) => {
                  setCardType(v);
                  if (v === '2') {
                    form.setFieldsValue({ accId: _get(schoolData, 'socialCredit') });
                  } else {
                    form.setFieldsValue({ accId: '' });
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              label="证件号码"
              name="accId"
              rules={[{ whitespace: true, required: true, message: '请输入证件号码' }, RULES.CARD_NUMBER]}
            >
              <Input disabled={cardType === '2'} />
            </Form.Item>
            <Form.Item label="银行账户开户行" required>
              <Input.Group>
                <Form.Item
                  name={['totalBankName', 'bank']}
                  noStyle
                  rules={[{ required: true, message: '请输入总行名称' }]}
                >
                  <Select
                    style={{ width: '70%' }}
                    showSearch
                    allowClear
                    placeholder="请输入总行名称"
                    onChange={(e: any) => {
                      setHeadBankName(e);
                    }}
                    onSearch={(e: any) => {
                      setSearchHeadBankName(e);
                    }}
                  >
                    {_get(bankListData, 'content', []).map((x: any, index: any) => (
                      <Option key={index} value={x.bankName}>
                        {x.bankName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name={['bank', 'subBankName']}
                  noStyle
                  rules={[{ required: true, message: '请输入支行名称' }]}
                >
                  <Select
                    style={{ width: '70%' }}
                    // className="ml10"
                    placeholder="先选总行再选支行"
                    disabled={!headBankName}
                    allowClear
                    showSearch
                    value={bankName}
                    onChange={(value: any) => {
                      setBankName(value);
                    }}
                    filterOption={false}
                    onSearch={(value) => {
                      setSearchBranchBankName(value);
                    }}
                  >
                    {_get(branchBankListData, 'content', []).map((item: any, index: any) => (
                      <Option key={index} value={item.bankBranchName}>
                        {item.bankBranchName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Input.Group>
            </Form.Item>

            <Form.Item label="银行账户名" required>
              <Input disabled value={acctName} />
            </Form.Item>

            <Form.Item
              label="银行账号"
              name="bankNo"
              rules={[{ whitespace: true, required: true, message: '请输入银行账号' }, RULES.BANK_CARD]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="accMobile"
              label="银行账户预留手机号"
              rules={[{ whitespace: true, required: true, message: '请输入银行账户预留手机号' }, RULES.TEL_11]}
            >
              <Input
                onChange={(e) => {
                  setAcctMobile(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item label="短信验证码" required>
              <Space>
                <Form.Item
                  noStyle
                  name="captcha"
                  rules={[{ whitespace: true, required: true, message: '请输入短信验证码' }, RULES.CODE_NUMBER_4_6]}
                >
                  <Input />
                </Form.Item>
                <Button
                  type="primary"
                  className="ml10"
                  loading={loading}
                  disabled={isCounting}
                  onClick={async (e: any) => {
                    form.validateFields(['accMobile']).then(async (values) => {
                      setLoading(true);
                      const res = await _getOpenZsSendMsg({
                        accMobile: _get(values, 'accMobile'),
                        msgType: '0',
                      });
                      setCaptchaNo(_get(res, 'data', ''));
                      setLoading(false);
                      setIsCounting(true);
                    });
                  }}
                >
                  {isCounting ? `重新获取(${count})` : '获取验证码'}
                </Button>
              </Space>
            </Form.Item>

            <Form.Item label="开户类型">驾校</Form.Item>
            <Form.Item label="注">只能用填写的银行账号向电子账户充值或从电子账户提现</Form.Item>
          </Form>
        }
      ></IF>
    </Modal>
  );
}
