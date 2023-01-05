import { request } from 'services';
import { ORDER_PAY_PREFIX, CORE_PREFIX, USER_CENTER_PREFIX, VIDEO_FACE } from 'constants/env';

// 用户银行卡绑卡查询
// http://192.168.192.132:3000/project/188/interface/api/16558
export async function _getBankcardInfo(query: {
  walletId: string; // 钱包ID
}) {
  return await request(`${ORDER_PAY_PREFIX}/front/bankcard/info`, 'GET', query);
}

//绑卡支持的银行卡列表
//http://192.168.192.132:3000/project/188/interface/api/16530
export async function _getBankCardListInfo(query: { bankChannelId: string }) {
  return await request(`${ORDER_PAY_PREFIX}/front/bankcard/cardList`, 'GET', query);
}

//查询驾校的所有银行渠道
//http://192.168.192.132:3000/project/193/interface/api/19393
export async function _getBankList() {
  return await request(`${CORE_PREFIX}/v2/account/querySchoolAllAccountMerge`, 'GET');
}

//查询电子账户信息
// http://192.168.192.132:3000/project/193/interface/api/25756
export async function _getAccountInfo(query: {
  bankChannelId: string; //开户渠道ID
  bankAccount: string; //银行电子账户
  busiType: string; // 业务类型 1：买家 2：卖家
  personType: string; // 人员类型 1：学员 2：教练
  userId: string; // schoolId
}) {
  return await request(`${CORE_PREFIX}/v2/account/queryAccountInfo`, 'GET', query);
}

//驾校开户
//http://192.168.192.132:3000/project/193/interface/api/19197
export async function _openSchoolAccount(query: {
  bankChannelId: string; // 开户渠道ID+
  signChannel?: string;
  bankChannelType?: string;
  accId?: string; //证件号
  memberGlobalType?: string; //证件类型    :1-身份证；3-回乡证；4-中国护照；5-台胞证；19-外国护照；52-组织机构代码证；68-营业执照 ；73-统一社会信用代码
}) {
  return await request(
    `${CORE_PREFIX}/v2/account/openSchoolAccount`,
    'POST',
    { signChannel: 2, ...query }, //签约渠道(1-app 2-平台H5网页 3-公众号 4-小程序 默认传2
    {
      withFailedFeedback: true,
    },
  );
}

//驾校放弃开户
//http://192.168.192.132:3000/project/193/interface/api/36293
export async function _abandonSchoolAccount(query: {
  bankChannelId: string; // 开户渠道ID+
}) {
  const { bankChannelId = '' } = query;
  return await request(`${CORE_PREFIX}/v2/account/abandonSchoolAccount?bankChannelId=${bankChannelId}`, 'DELETE');
}

//银行卡绑卡查询
//http://192.168.192.132:3000/project/193/interface/api/19253
export async function _queryBankCard(query: {
  bankChannelId: string; //开户渠道ID
  bankAccount: string; //银行电子账户
}) {
  return await request(`${CORE_PREFIX}/v1/bankCardBinding/queryBankCard`, 'GET', query);
}

//绑定银行卡
//http://192.168.192.132:3000/project/193/interface/api/19239
export async function _bindBankCard(query: {
  accId: string; //证件号（证件类型对应的证件号）
  accMobile: string; //银行预留手机号
  accName: string; //银行开户名
  acctNo: string; //账号
  bankChannelId: string; //渠道ID
  bankName: string; //银行名称
  bankNo: string; //银行卡号
  branchName?: string; //支行名称
  cardType?: any; //非必须银行卡类型（1：借记卡，2：信用卡） 默认为借记卡
  credentType: any; //证件类型(1.身份证.73.社会信用代码)
  captcha: string; //验证码
  reprGlobalId: string; //法人证件号码（credentType=73对公绑卡时必传）
  reprGlobalType: string; //法人证件类型（credentType=73对公绑卡时必传）
  reprName: string; //法人名称（credentType=73对公绑卡时必传）
}) {
  return await request(`${CORE_PREFIX}/v1/bankCardBinding/bindBankCard`, 'POST', query, {
    withFeedback: true,
  });
}

//解绑银行卡
//http://192.168.192.132:3000/project/193/interface/api/19260
export async function _unbindBankCard(query: {
  bankAccount: string; //银行电子账户
  bankChannelId: string; //开户渠道ID
  userId?: string; //用户ID
  unbindType: string; //解绑类型 1：用户解绑 2：驾校解绑
}) {
  return await request(`${CORE_PREFIX}/v1/bankCardBinding/unbindBankCard`, 'POST', query, {
    withFeedback: true,
  });
}

//平安银行短信验证
//http://192.168.192.132:3000/project/193/interface/api/19246
export async function _bindConfirm(query: {
  bankAccount: string; //银行电子账户
  bankChannelId: string; //开户渠道ID
  bankName: string; //银行名称
  bankNo: string; //银行卡号
  bindApplicationId: string; //绑卡申请ID
  cardType?: any; //银行卡类型（1：借记卡，2：信用卡） 默认为借记卡
  userId: string; //用户ID
  validateCode: string; //短信验证码
}) {
  return await request(`${CORE_PREFIX}/v1/bankCardBinding/bindConfirm`, 'POST', query);
}

//对公绑卡发送短信验证
//http://192.168.192.132:3000/project/193/interface/api/19477
export async function sendSMS(query: { mobilePhone: string }) {
  //此处成功不提示，错误提示
  return await request(`${CORE_PREFIX}/v1/bankCardBinding/sendSMS`, 'POST', query, { withFailedFeedback: true });
}

//对公绑卡小额验证
//http://192.168.192.132:3000/project/193/interface/api/19400
export async function checkAmount(query: {
  bankAccount: string;
  bankChannelId: any;
  bankName: string;
  bankNo: string;
  bindApplicationId: string;
  cardType?: string;
  receiveAmt: any;
  orderNo: string; //短信指令号
}) {
  return await request(`${CORE_PREFIX}/v1/bankCardBinding/checkAmount`, 'POST', query, {
    withFeedback: true,
  });
}

// 提现入口
// http://192.168.192.132:3000/project/188/interface/api/15501
export async function _withdraw(query: {
  acctNo: string;
  bankChannelId: string;
  // callBackUrl: string; // 回调通知地址
  cashAmt: number; // 提现金额
  // idepment: string; // 幂等凭证（每次提现请求都必须有个唯一的凭证与之对应）
  messageCheckCode: string; //短信验证码
  messageOrderNo: string; //短信指令号
  remark?: string; // 备注
  seqNo?: string; //流水号
  shopId: string | null; // 所属驾校
  transferFee?: string; //手续费
  withdrawFee?: string; //提现手续费
  withrawApplyId?: string; //提现id
}) {
  return await request(`${ORDER_PAY_PREFIX}/front/withdraw`, 'POST', query, {
    withFailedFeedback: true,
    customHeader: { menuId: 'financial/wallet', elementId: 'financial/wallet:btn2' },
  });
}

// 提现申请动态验证码
// http://192.168.192.132:3000/project/188/interface/api/17104
export async function _sendMsg(query: {
  acctNo: string; // 账户
  bankChannelId: string; //渠道ID
  cashAmt: number; //提现金额
  mobile: string; // 手机号
}) {
  return await request(`${ORDER_PAY_PREFIX}/front/withdraw/sendMsg`, 'POST', query, {
    withFailedFeedback: true,
  });
}

//手续费计算
//http://192.168.192.132:3000/project/188/interface/api/17286
export async function _getBankFee(query: {
  bankChannelId: string; //渠道ID
  feeType: number; //手续费类型（1.充值 2.提现 ）
  acctNo: string; //银行找
}) {
  return await request(`${ORDER_PAY_PREFIX}/api/bankChannel/fee`, 'POST', query);
}

//查询查询正在绑卡中的申请记录
export async function _queryApplyingBankCard(query: {
  bankChannelId: string; //开户渠道ID
  bankAccount: string; //银行电子账户
}) {
  return await request(`${CORE_PREFIX}/v1/bankCardBinding/queryApplyingBankCard`, 'GET', query);
}

// 查询驾校基础信息
// http://192.168.192.132:3000/project/198/interface/api/17608
export async function _getBaseInfo(query: {
  id: string; // 驾校id
}) {
  return await request(`${USER_CENTER_PREFIX}/v1/company/${query.id}/basicInfo`, 'GET', query);
}

// 二类户驾校开户
// http://192.168.192.132:3000/project/193/interface/api/26673
export async function _openClassTwoBankAccount(query: {
  acctBankName: string; // 开户银行
  acctIdNo: string; // 证件号码
  acctIdType: string; // 证件类型,暂只支持：1：身份证
  acctMobile: string; // 账户预留手机号
  acctName: string; // 账户名称
  acctNo: string; // 银行账号
  acctStyle: string; // 账户类型 0：个人银行卡 1：对公银行账户
  backAccountSide: string; // 法定代表人身份证反面
  bankChannelId: string; // 开户渠道ID
  captcha: string; // 短信验证码
  chargePersonCertEndDate: string; // 法定代表人证照到期日 yyyy-MM-dd
  contactName: string; // 经办人姓名
  contactPhone: string; // 经办人手机
  emailAddr: string; // 电子邮箱
  frontAccountSide: string; // 法定代表人身份证正面
  frontLicenseSide: string; // 营业执照正面
  locationAdd: string; // 所属地区代码
  merBLNo: string; // 社会信用代码（注册号）
  merBLNoEndDate: string; // 营业期限截止日 yyyy-MM-dd
  merChargePerson: string; // 法定代表人姓名
  merNamec: string; // 企业名称
  merStyle: string; // 商户类别 0：个体工商户；1：企业；2：党政、机关、民办非企业、社会团体、基金会
  openAccountProve: string; // 开户证明
  registeredCapital: number; // 注册资本
  openCount?: number;
}) {
  return await request(`${CORE_PREFIX}/v2/account/openClass2BankAccount`, 'POST', query, {
    withFeedback: true,
  });
}

// 查询二类户开户状态
// http://192.168.192.132:3000/project/193/interface/api/26680
export async function _getClassTwoOpenAccountStatus(query: { bankChannelId: string }) {
  return await request(`${CORE_PREFIX}/v2/account/queryClass2OpenAccountStatus`, 'GET', query);
}

// 省市区连级选择器
export function _getCity(query: { codeType: string; parentCodeKey: string }) {
  return request(`${CORE_PREFIX}/v1/sysbase/code/get2`, 'GET', query);
}

// 获取可以绑卡的银行列表 （所有的银行）
// http://192.168.192.132:3000/project/193/interface/api/27387
export async function _getBankListInfo(query: { channelId: string }) {
  return await request(`${CORE_PREFIX}/v1/bankCardBinding/queryBankListCanBindByChannelId`, 'GET', query);
}

// 模糊查询支行名称列表
// http://192.168.192.132:3000/project/193/interface/api/27394
export async function _getBranchBankListInfo(query: {
  bankChannelId: string;
  bankName: string;
  branchBankName?: string;
}) {
  return await request(`${CORE_PREFIX}/v2/account/queryBranchBankList`, 'GET', query);
}

//获取验证码
// http://192.168.192.132:3000/project/193/interface/api/33582
export async function _getOpenZsSendMsg(query: {
  accMobile: string;
  msgType: string; //短信类型 0开户，1充值
}) {
  return await request(`${CORE_PREFIX}/v2/account/openZsSendMsg`, 'GET', query);
}

//查询开户行
//http://192.168.192.132:3000/project/188/interface/api/33771
export async function _searchBank(query: {
  type: string; // 查询类型 0:查总行 1:查支行
  bankName: any; //银行名称 支持模糊搜索
  bankBranchName?: string; //支行名称 支持模糊搜索
  pageIndex?: string; //不传默认1
  pageSize?: string; //不传默认10
}) {
  return await request(`${ORDER_PAY_PREFIX}/api/account/open/zs/searchBank`, 'GET', query);
}

// http://192.168.192.132:3000/project/193/interface/api/36566
// 充值
export async function _rechargeWithNoOrder(query: {
  bankChannelId: string; //渠道ID
  clientType: string; //终端类型（h5/pc）
  memo?: string; //备注
  recharegAmt: number; //充值金额
  returnUrl: string; //前端跳转地址
  transMethod: string; //支付方式（B2B）
}) {
  return await request(`${CORE_PREFIX}/v2/account/rechargeWithNoOrder`, 'POST', query);
}

//http://192.168.192.132:3000/project/193/interface/api/36569
// 获取充值二维码
export async function _queryPApayOrder(query: {
  bankChannelId: string; //渠道ID注
  recharegAmt: number; //充值金额
}) {
  return await request(`/api/jp-train-core-svc/v2/account/queryPApayOrder`, 'POST', query);
}

//http://192.168.192.132:3000/project/193/interface/api/42924
// 二类户驾校开户信息回查支付监管
export async function _queryClass2BankAccountMessage(query: { bankChannelId: string }) {
  // debugger
  return await request(`/api/jp-train-core-svc/v2/account/queryClass2BankAccountMessage`, 'GET', query);
}

// 统计 开通/绑卡点击率
export async function _addMessage(query: {
  sysType: string;
  userInfo: string;
  mobile: string;
  productName: string;
  msgDesc: string;
}) {
  //sysType:0其他 1、5g驾校 2、学员app
  // debugger
  return await request(`${VIDEO_FACE}/v1/consult/message/add`, 'POST', query, { withFailedFeedback: true });
}

// 对公绑卡支持的银行列表
//http://192.168.192.132:3000/project/188/interface/api/48582
export async function _getCardList(query: { bankName?: string }) {
  //sysType:0其他 1、5g驾校 2、学员app
  // debugger
  return await request(`${ORDER_PAY_PREFIX}/api/bankcard/getCardList`, 'GET', query);
}

// 推广商已经绑定的驾校
// http://192.168.192.132:3000/project/248/interface/api/55020
export async function _getSchool(query: any) {
  return await request(`${VIDEO_FACE}/v1/self/merchant/detailByProSchoolId`, 'GET', query);
}
