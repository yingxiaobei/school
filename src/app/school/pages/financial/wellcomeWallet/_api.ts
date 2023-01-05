import { request } from 'services';
import { DATA_EXCHANGE_PREFIX, CORE_PREFIX } from 'constants/env';

interface IQueryApplicationRecharge extends IPaginationParams {
  endTime: any; //查询结束日期 格式：yyyy-MM-dd
  rechargeNumber?: string; //充值单号
  startTime: any; //查询开始日期 格式：yyyy-MM-dd
  subAccountType: string; //子账户类型 00:点卡账户 01:IC卡(始) 02:IC卡(补) 03:教练虚拟点卡
}

interface IQueryJfRechargeApplyInfo extends IPaginationParams {
  endTime: string; //查询结束日期 格式：yyyy-MM-dd
  startTime: string; //查询开始日期 格式：yyyy-MM-dd
  rechargeNumber: string;
}

// 取消订单
// http://192.168.192.132:3000/project/203/interface/api/27849
export async function _cancelPayment(query: {
  rechargeApplyCode: string; // 充值申请记录流水
}) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/welleams/wallet/cancelPayment`, 'POST', query, {
    withFeedback: true,
  });
}

// 积分兑换
// http://192.168.192.132:3000/project/203/interface/api/27863
export async function _integralExchange(query: {
  creator?: string; // 操作人
  inscode?: string; // 驾校统一编码
  rechargeNumApply: number; // 兑换其他子账户数
  rechargeNumber?: string; // 申请单号
  subAccountType: string; // 兑换子账户类型 00-点卡账户；01-IC卡; 02-IC卡补卡
}) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/welleams/wallet/integralExchange`, 'POST', query, {
    withFeedback: true,
  });
}

// 查询手续费
// http://192.168.192.132:3000/project/203/interface/api/27919
export async function _queryOrderFee(query: {
  bankId: string; // 银行ID
  feeType: string; // 手续费类型 1.充值 2.提现
}) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/welleams/wallet/queryOrderFee`, 'GET', query);
}

// 付款（生成支付订单）
// http://192.168.192.132:3000/project/203/interface/api/27870
export async function _preparePayment(query: {
  bankId: string; // 银行ID
  payWay: string; // 支付方式 0线下支付，1在线支付
  queryOperator: string; // 操作人 操作者人员的：编码+姓名+证件号码
  rechargeNumApply: number; // 申请充值额
  subAccountType: string; // 子账号类型 00:点卡账户 01:IC卡(始) 02:IC卡(补) 03:教练虚拟点卡
}) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/welleams/wallet/preparePayment`, 'POST', query);
}

// 确认付款
// http://192.168.192.132:3000/project/203/interface/api/27856
export async function _confirmPayment(query: {
  applyTime?: string; // 申请时间 yyyy-MM-dd HH:mm:ss
  bankFlowId?: string; // 银行交易流水号（线下方式必填）
  bankId: string; // 银行ID
  insCode?: string; // 驾校统一编码
  payTime?: string; // 付款时间（线下方式必填）
  payWay: string; // 支付方式 0线下支付，1在线支付
  payer?: string; // 付款人（线下方式必填）
  queryOperator?: string; // 操作人
  rechargeNumApply: number; // 申请充值额
  rechargeNumber: string; // 申请单号
  rechargeVoucherUrl?: string; // 银行转账凭证图片的url地址（线下方式必填，前端页面传临时文件ID）
  remark?: string; // 备注
  subAccountType: string; // 子账户类型 00:点卡账户 01:IC卡(始) 02:IC卡(补) 03:教练虚拟点卡
  paySendReturnUrl?: string; //支付中心支付成功前端回调地址
  payMode?: string;
}) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/welleams/wallet/confirmPayment`, 'POST', query, {
    withFeedback: true,
  });
}

// 查询余额（所有）
// http://192.168.192.132:3000/project/203/interface/api/27877
export async function _queryAccountBalanceAll(query: {
  accountType: string; // 账户类型 00:普通 10-代理商
}) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/welleams/wallet/queryAccountBalanceAll`, 'GET', query);
}

// 查询余额
// http://192.168.192.132:3000/project/203/interface/api/27884
export async function _queryAccountBalanceBySubType(query: {
  accountType: string; // 账户类型 00:普通 10-代理商
  subAccountType: string; //子账号类型 00:点卡账户 01:IC卡(始) 02:IC卡(补) 03:教练虚拟点卡 04:积分
}) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/welleams/wallet/queryAccountBalanceBySubType`, 'GET', query);
}

// 查询充值申请记录
// http://192.168.192.132:3000/project/203/interface/api/27891
export async function _queryApplicationRecharge(query: IQueryApplicationRecharge) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/welleams/wallet/queryApplicationRecharge`, 'GET', query);
}

// 查询银行清单
// http://192.168.192.132:3000/project/203/interface/api/27898
export async function _queryBankList(query: {
  onlineCharge: string; //是否支持在线收款：默认0否，1是
  queryOperator: string; //操作人（编码+姓名+证件号码）
  subAccountType?: string;
}) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/welleams/wallet/queryBankList`, 'GET', query);
}

// 查询积分明细
// http://192.168.192.132:3000/project/203/interface/api/27905
export async function _queryJfDetailInfo(query: any) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/welleams/wallet/queryJfDetailInfo`, 'GET', query);
}

// 查询兑换明细
// http://192.168.192.132:3000/project/203/interface/api/27912
export async function _queryJfRechargeApplyInfo(query: IQueryJfRechargeApplyInfo) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/welleams/wallet/queryJfRechargeApplyInfo`, 'GET', query);
}

// 查询点卡消费记录
// http://192.168.192.132:3000/project/203/interface/api/39399
export async function _consumeRecord(query: any) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/welleams/wallet/queryConsumeDetail`, 'GET', query);
}

// 基于车型获取业务类型combo
// http://192.168.192.132:3000/project/193/interface/api/23887
export async function _getTrainType() {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getBusiTypeComboForTraintype/A2`, 'GET');
}

// 查询驾校指定月份退学学员列表
// http://192.168.192.132:3000/project/193/interface/api/55530
export async function _selectDropOutStudent(query: any) {
  return await request(`${CORE_PREFIX}/v1/stuApplyFormTotal/selectDropOutStudent`, 'GET', query);
}

// 驾校平台新增申请记录
// http://192.168.192.132:3000/project/193/interface/api/49302
export async function _addApplyRecord(query: any) {
  return await request(`${CORE_PREFIX}/v1/stuApplyFormTotal/addApplyRecord`, 'POST', query);
}

// 分页展示信息列表
//http://192.168.192.132:3000/project/193/interface/api/49272
export async function _getList(query: any) {
  return await request(`${CORE_PREFIX}/v1/stuApplyFormTotal/pageList`, 'GET', query);
}

// 查询单个审核详情，根据类型（1、报审补录，2更换班级，3提前结清）
// http://192.168.192.132:3000/project/193/interface/api/49278
export async function _selectByKey(query: any) {
  return await request(`${CORE_PREFIX}/v1/stuApplyFormTotal/selectByKey`, 'GET', query);
}
