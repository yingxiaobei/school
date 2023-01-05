import { useState, useEffect } from 'react';
import { Button, Modal, message, Row, Input, Form, Col, DatePicker, Select, Cascader } from 'antd';
import { ItemCol, Title, UploadPro, IF, Loading } from 'components';
import { RULES } from 'constants/rules';
import {
  _getBaseInfo,
  sendSMS,
  _openClassTwoBankAccount,
  _getCity,
  _getBankListInfo,
  _getBranchBankListInfo,
  _queryClass2BankAccountMessage,
} from './_api';
import { useCountdown, useFetch, useRequest, useOptions } from 'hooks';
import { Auth, _get, formatTime } from 'utils';
import moment from 'moment';
interface IProps {
  onCancel: (params: boolean) => void;
  _onCancel: (params: boolean) => void;
  onOk: () => void;
  bankChannelId: string;
  setOpenAccountAgain: (params: boolean) => void;
  openAccountAgain: boolean;
}

export default function OpenClassTwoAccountForm(props: IProps) {
  const { onCancel, _onCancel, onOk, bankChannelId, openAccountAgain, setOpenAccountAgain } = props;
  const [licenseSideUrl, setLicenseSideUrl] = useState(''); // 营业执照
  const [backAccountSideUrl, setBackAccountSideUrl] = useState(''); // 法人身份证背面
  const [frontAccountSideUrl, setFrontAccountSideUrl] = useState(''); // 法人身份证正面
  const [merBLNoEndDateUrl, setMerBLNoEndDateUrl] = useState(''); // 开户证明
  const [imgLicenseSideId, setImgLicenseSideId] = useState(''); // 营业执照
  const [backAccountSideId, setBackAccountSideId] = useState(''); // 法人身份证背面
  const [frontAccountSideId, setFrontAccountSideId] = useState(''); // 法人身份证正面
  const [MerBLNoEndDateId, setMerBLNoEndDateId] = useState(''); // 开户证明
  const [loading, setLoading] = useState(false);
  const [acctMobile, setAcctMobile] = useState('');
  const [bankchannelid, setBankchannelid] = useState(''); // 银行渠道ID
  const [bankaccount, setBankaccount] = useState(''); // 银行账户
  const [cityData, setCityData] = useState([]); // 请求的城市数据
  const [areaCode, setAreaCode] = useState([]); // 城市和区域的code
  const [bankName, setBankName] = useState(''); // 银行名称
  const [branchBankListData, setBranchBankListData] = useState([]); // 银行分支列表
  const [bankPayId, setBankPayId] = useState('');
  const [form] = Form.useForm();
  const { Option } = Select;
  const { count, isCounting, setIsCounting } = useCountdown(60);

  // 驾校基本信息详情
  const { data: schoolData, isLoading: schoolDataLoading } = useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getBaseInfo,
  });

  // 上次开户所填信息
  const { data: lastData, isLoading: load } = useFetch({
    query: {
      bankChannelId: bankChannelId,
    },
    request: _queryClass2BankAccountMessage,
  });

  // 提交开户申请
  const { loading: openClassTwoBankAccountLoading, run: openClassTwoBankAccountRun } = useRequest(
    _openClassTwoBankAccount,
    {
      onSuccess: () => {
        onCancel(false);
        _onCancel(false);
        onOk();
      },
    },
  );

  // 省市区连级选择器
  const { data = [], isLoading } = useFetch({
    request: _getCity,
    query: {
      codeType: 'address_type',
      parentCodeKey: '-1',
    },
    callback: (data) => {
      let cityInfo: any = [];
      cityInfo = data.map((item: any) => {
        return {
          value: _get(item, 'value'),
          label: _get(item, 'text'),
          isLeaf: ['710000', '810000', '820000'].includes(_get(item, 'value')), // 台湾香港澳门的编号不做下一级菜单其他可以做
        };
      });
      setCityData(cityInfo);
    },
  });

  // 查询银行列表
  const { data: bankListData = [], isLoading: bankListLoading } = useFetch({
    request: _getBankListInfo,
    query: { channelId: bankChannelId },
    depends: [bankChannelId],
  });

  const onChange = (value: any, selectedOptions: any) => {
    console.log(value, selectedOptions);
    setAreaCode(value);
  };

  const loadData = async (selectedOptions: any) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;

    // load options lazily
    const res = await _getCity({
      codeType: 'address_type',
      parentCodeKey: _get(selectedOptions, `${_get(selectedOptions, 'length', 0) - 1}.value`),
    });
    if (_get(res, 'data.length', 0) === 0) {
      return false;
    }
    const cityDataList = _get(res, 'data').map((item: any) => {
      return {
        value: _get(item, 'value'),
        label: _get(item, 'text'),
        isLeaf: _get(selectedOptions, 'length', 0) === 2,
      };
    });
    targetOption.loading = false;
    targetOption.children = cityDataList;
    setCityData([...cityData]);
  };

  // useEffect(() => {
  //   delete lastData?.proBeginDate;
  //   delete lastData?.proEndDate;
  //   let data = {
  //     ...lastData,
  //     chargePersonCertEndDate: lastData?.chargePersonCertEndDate ? moment(lastData?.chargePersonCertEndDate) : null,
  //     merNamec: _get(schoolData, 'name'), // 培训机构名称
  //     merBLNo: _get(schoolData, 'socialCredit'), // 社会信用代码
  //     // registeredCapital: _get(schoolData, 'socialCredit'),  // 注册资本
  //     locationAdd: _get(schoolData, 'area'), // 行政区划，例如：山西省阳泉市郊区
  //     merBLNoEndDate: _get(schoolData, 'licEndDate'), // 经营许可截止日期
  //     merChargePerson: _get(schoolData, 'legalPerson'), // 企业法人
  //     contactName: _get(schoolData, ' leader'), // 联系人
  //     contactPhone: _get(schoolData, 'leaderPhone'), // 联系人手机
  //     reprName: _get(schoolData, 'legalPerson'), //回显驾校全称、信用代码、法人名称
  //     reprGlobalType: '1', //证件类型默认身份证
  //   };

  //   form.setFieldsValue(data);
  // }, [lastData, schoolData]);
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
                if (moment().subtract(6, 'month').diff(_get(values, 'chargePersonCertEndDate', ''), 'months') > -12) {
                  message.error('法定代表人证照到期日到期不足6个月，无法开户');
                  return;
                }
                if (moment().subtract(6, 'month').diff(_get(values, 'merBLNoEndDate', ''), 'months') > -12) {
                  message.error('营业期限截止日不足6个月，无法开户');
                  return;
                }
                if (!imgLicenseSideId) {
                  message.error('未上传营业执照');
                  return;
                }
                if (!backAccountSideId) {
                  message.error('未上传法人身份证背面');
                  return;
                }
                if (!frontAccountSideId) {
                  message.error('未上传法人身份证正面');
                  return;
                }
                if (!MerBLNoEndDateId) {
                  message.error('未上传开户证明');
                  return;
                }
                if (!areaCode) {
                  message.error('请选择区域');
                  return;
                }
                if (!bankPayId) {
                  message.error('请选择开户银行');
                  return;
                }

                const query = {
                  acctBankName: bankName, // 开户银行
                  acctIdNo: _get(values, 'acctIdNo'), // 证件号码 这里传社会信用代码
                  acctBankNo: bankPayId, // 银联号
                  acctIdType: '1', // 证件类型,暂只支持：1：身份证 2 营业执照
                  acctMobile: _get(values, 'acctMobile'), // 账户预留手机号
                  acctName: _get(values, 'acctName'), // 账户名称
                  acctNo: _get(values, 'acctNo'), // 银行账号
                  acctStyle: '1', // 账户类型 0：个人银行卡 1：对公银行账户
                  backAccountSide: backAccountSideId, // 法定代表人身份证反面
                  bankChannelId: bankChannelId, // 开户渠道ID
                  captcha: _get(values, 'captcha'), // 短信验证码
                  chargePersonCertEndDate: formatTime(_get(values, 'chargePersonCertEndDate', ''), 'DATE'), // 法定代表人证照到期日 yyyy-MM-dd
                  contactName: _get(values, 'contactName'), // 经办人姓名
                  contactPhone: _get(values, 'contactPhone'), // 经办人手机
                  emailAddr: _get(values, 'emailAddr'), // 电子邮箱
                  frontAccountSide: frontAccountSideId, // 法定代表人身份证正面
                  frontLicenseSide: imgLicenseSideId, // 营业执照正面
                  locationAdd: areaCode[1], // 所属地区代码 传市级code
                  merBLNo: _get(values, 'merBLNo'), // 社会信用代码（注册号）
                  merBLNoEndDate: formatTime(_get(values, 'merBLNoEndDate', ''), 'DATE'), // 营业期限截止日 yyyy-MM-dd
                  merChargePerson: _get(values, 'merChargePerson'), // 法定代表人姓名
                  merNamec: _get(values, 'merNamec'), // 企业名称
                  merStyle: '1', // 商户类别 0：个体工商户；1：企业；2：党政、机关、民办非企业、社会团体、基金会
                  openAccountProve: MerBLNoEndDateId, // 开户证明
                  registeredCapital: Number(_get(values, 'registeredCapital')), // 注册资本
                  openCount: lastData ? 2 : undefined, //重新开户为2
                };
                openClassTwoBankAccountRun(query);
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
        condition={schoolDataLoading || isLoading || bankListLoading || load}
        then={<Loading />}
        else={
          <Form
            form={form}
            autoComplete="off"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            initialValues={{
              ...lastData,
              chargePersonCertEndDate: lastData?.chargePersonCertEndDate
                ? moment(lastData?.chargePersonCertEndDate)
                : null,
              merNamec: _get(schoolData, 'name'), // 培训机构名称
              merBLNo: _get(schoolData, 'socialCredit'), // 社会信用代码
              // registeredCapital: _get(schoolData, 'socialCredit'),  // 注册资本
              locationAdd: _get(schoolData, 'area'), // 行政区划，例如：山西省阳泉市郊区
              merBLNoEndDate: _get(schoolData, 'licEndDate'), // 经营许可截止日期
              merChargePerson: _get(schoolData, 'legalPerson'), // 企业法人
              contactName: _get(schoolData, ' leader'), // 联系人
              contactPhone: _get(schoolData, 'leaderPhone'), // 联系人手机
              reprName: _get(schoolData, 'legalPerson'), //回显驾校全称、信用代码、法人名称
              reprGlobalType: '1', //证件类型默认身份证
            }}
          >
            <Title>企业信息</Title>
            <Row>
              <ItemCol
                span={24}
                label="企业名称"
                name="merNamec"
                rules={[{ whitespace: true, required: true, message: '请输入企业名称' }, RULES.BANK_ACCOUNT]}
              >
                <Input disabled />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol
                span={24}
                label="社会信用代码（注册号）"
                name="merBLNo"
                rules={[
                  { whitespace: true, required: true, message: '请输入社会信用代码（注册号）' },
                  RULES.SOCIAL_CREDIT_CODE,
                ]}
              >
                <Input disabled />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol
                span={24}
                label="注册资本"
                name="registeredCapital"
                rules={[{ whitespace: true, required: true, message: '请输入注册资本' }, RULES.TOTAL_NUM]}
              >
                <Input />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={24} label="所属地区" required>
                <Cascader options={cityData} loadData={loadData} onChange={onChange} changeOnSelect />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol required span={24} label="营业执照">
                <UploadPro
                  disabled={false}
                  imageUrl={licenseSideUrl}
                  setImageUrl={setLicenseSideUrl}
                  setImgId={setImgLicenseSideId}
                />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol
                span={24}
                label="营业期限截止日"
                name="merBLNoEndDate"
                rules={[{ required: true, message: '请选择营业期限截止日' }]}
              >
                <DatePicker
                  disabledDate={(current: any): any => {
                    if (!current) return;
                    //只能选择当天及之后的日期 最大可选择日期为2099-12-31
                    return (
                      current.diff(moment(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'days')) < 0 ||
                      current.diff(moment('2100-1-1')) >= 0
                    );
                  }}
                />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol
                span={24}
                label="法定代表人姓名"
                name="merChargePerson"
                rules={[{ whitespace: true, required: true, message: '请输入法定代表人姓名' }]}
              >
                <Input disabled />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={24} label="法定代表人身份证" required>
                <UploadPro
                  uploadTitle="证件正面"
                  disabled={false}
                  imageUrl={frontAccountSideUrl}
                  setImageUrl={setFrontAccountSideUrl}
                  setImgId={setFrontAccountSideId}
                />
                <UploadPro
                  uploadTitle="证件反面"
                  disabled={false}
                  imageUrl={backAccountSideUrl}
                  setImageUrl={setBackAccountSideUrl}
                  setImgId={setBackAccountSideId}
                />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol
                span={24}
                label="法定代表人证照号码"
                name="acctIdNo"
                rules={[{ required: true, message: '请输入法定代表人证照号码' }, RULES.ID_CARD]}
              >
                <Input placeholder="请输入法定代表人证照号码" />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol
                span={24}
                label="法定代表人证照到期日"
                name="chargePersonCertEndDate"
                rules={[{ required: true, message: '请选择法定代表人证照到期日' }]}
              >
                <DatePicker
                  disabledDate={(current: any): any => {
                    if (!current) return;
                    //只能选择当天及之后的日期 最大可选择日期为2099-12-31
                    return (
                      current.diff(moment(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'days')) < 0 ||
                      current.diff(moment('2100-1-1')) >= 0
                    );
                  }}
                />
              </ItemCol>
            </Row>
            <Title>银行账户</Title>
            <Row>
              <ItemCol span={24} label="账户类型">
                对公银行账户
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={24} label="开户银行" required>
                <Select
                  style={{ width: '70%' }}
                  placeholder="选择银行"
                  onChange={(e: any) => {
                    // 选择银行会改变支行的数据
                    setBankPayId('');
                    setBranchBankListData([]);
                    setBankName(e);
                  }}
                >
                  {bankListData.map((x: any) => (
                    <Option key={x.bankCode} value={x.bankName}>
                      {x.bankName}
                    </Option>
                  ))}
                </Select>
                <Select
                  style={{ width: '70%' }}
                  getPopupContainer={(triggerNode) => triggerNode.parentElement}
                  placeholder="选择支行"
                  disabled={!bankName}
                  allowClear
                  showSearch
                  value={bankPayId}
                  onChange={(value: any) => {
                    setBankPayId(value);
                    console.log(value);
                  }}
                  filterOption={false}
                  onSearch={(value) => {
                    // 输入大于1个字符开始查询
                    if (_get(value, 'length', 0) > 1) {
                      const query = {
                        bankChannelId,
                        bankName,
                        branchBankName: value,
                      };
                      console.log(query);
                      _getBranchBankListInfo(query).then((res: any) => {
                        setBranchBankListData(_get(res, 'data', []));
                      });
                    }
                  }}
                >
                  {branchBankListData.map((item: any) => (
                    <Option key={item.value} value={item.value}>
                      {item.text}
                    </Option>
                  ))}
                </Select>
              </ItemCol>
            </Row>
            <Row>
              <ItemCol
                span={24}
                label="账户名称"
                name="acctName"
                rules={[{ whitespace: true, required: true, message: '请选择账户名称' }]}
              >
                <Input />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol
                span={24}
                label="银行账号"
                name="acctNo"
                rules={[{ whitespace: true, required: true, message: '请输入银行账号' }]}
              >
                <Input />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol span={24} label="开户证明" required>
                <UploadPro
                  disabled={false}
                  imageUrl={merBLNoEndDateUrl}
                  setImageUrl={setMerBLNoEndDateUrl}
                  setImgId={setMerBLNoEndDateId}
                />
              </ItemCol>
            </Row>
            <Row>
              <Col span={16} offset={2}>
                <Form.Item
                  label="账户预留手机号"
                  name="acctMobile"
                  rules={[{ whitespace: true, required: true, message: '请输入账户预留手机号' }, RULES.TEL_11]}
                >
                  <Input
                    onChange={(e) => {
                      setAcctMobile(e.target.value);
                    }}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Button
                  type="primary"
                  loading={loading}
                  disabled={isCounting}
                  onClick={async (e: any) => {
                    form.validateFields(['acctMobile']).then(async () => {
                      setLoading(true);
                      await sendSMS({
                        mobilePhone: acctMobile,
                      });
                      setLoading(false);
                      setIsCounting(true);
                    });
                  }}
                >
                  {isCounting ? `重新获取(${count})` : '获取验证码'}
                </Button>
              </Col>
            </Row>
            <Row>
              <ItemCol
                span={24}
                label="手机验证码"
                name="captcha"
                rules={[{ whitespace: true, required: true, message: '请输入手机验证码' }]}
              >
                <Input />
              </ItemCol>
            </Row>
            <Title>经办人</Title>
            <Row>
              <ItemCol
                span={24}
                label="经办人姓名"
                name="contactName"
                rules={[{ whitespace: true, required: true, message: '请输入经办人姓名' }, RULES.USERCENTER_NAME]}
              >
                <Input />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol
                span={24}
                label="经办人手机"
                name="contactPhone"
                rules={[{ whitespace: true, required: true, message: '请输入经办人手机' }, RULES.TEL_11]}
              >
                <Input />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol
                span={24}
                label="电子邮箱"
                name="emailAddr"
                rules={[{ whitespace: true, required: true, message: '请输入电子邮箱' }, RULES.EMAIL]}
              >
                <Input />
              </ItemCol>
            </Row>
          </Form>
        }
      ></IF>
    </Modal>
  );
}
