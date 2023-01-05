import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

// 查询结算记录列表
// http://192.168.192.132:3000/project/193/interface/api/18707
export async function _getInfo(query: {
  currentPage: number;
  pageSize: number;
  studentName?: string; // 学员名字
  idNumber?: string;
  payFlowId?: string; // 交易流水号
  settleType?: string; // 结算类型，清查数据字典
  status?: string; // 结算状态   0：待结算 1、结算中，2、已结算，3、结算异常
  studentBankAccount?: string; //学员电子账户
}) {
  return await request(`${CORE_PREFIX}/v1/stuOrderSettlement/page`, 'GET', query);
}

// 获取结算金额
// http://192.168.192.132:3000/project/193/interface/api/18721
export async function _getTotalMoney(query: { sid?: any; status?: string }) {
  return await request(`${CORE_PREFIX}/v1/stuOrderSettlement/statistic`, 'GET', query);
}

//立即结算
export async function _manualSettle(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/stuOrderSettlement/manualSettle?id=${query.id}`, 'POST', query, {
    withFeedback: true,
  });
}

// 导出Excel前查询
// http://192.168.192.132:3000/project/193/interface/api/47058
export async function _exportBefore(query: any) {
  return await request(`${CORE_PREFIX}/v1/stuOrderSettlement/export/stuSettleDetailBefore`, 'GET', query);
}

//导出学员结算明细报表Excel
//http://192.168.192.132:3000/project/193/interface/api/47052
export async function _exportStuSettleDetail(query: any) {
  return await request(`${CORE_PREFIX}/v1/stuOrderSettlement/export/stuSettleDetail`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

export interface TransRecordDetail {
  awaitAmount: string; // 交易金额
  billStatus: string; // 交易对账状态
  busiType: string; // 业务类型(1, 支付,2.冻结支付,3.线下支付)
  userFlag: string; // 买家Id
  transferFee: string; // 交易手续费
  transType: string; // 交易类别(1.支、2.退、3.冻、4.解冻、5.结、6.充、7.提 8.转账(会员间) 9、会员内转账)
  transTime: string; // 交易时间
  tradeNo: string; // 充值流水交易id
  targetAccountEntity: string; //驾校端对方账户
  successTime: string; // 交易成功时间
  status: string; // 交易状态（0.待处理、1.处理中、2.交易成功、3.交易失败、4.交易关闭、5.退款、6.状态未知 7.待确认 8.超时异常 9.订单不存在、10.人工处理，11.人工处理中，12.人工处理成功，13.人工处理失败）
  shopId: string; //卖家id
  settleStatus: string; // 结算状态
  settleAccountId: string; // 结算账户id
  payType: string; // 支付类型(app支付、B2C网银支付、WeixinJsapi微信公众号支付等)
  resourceId: string; // 用户来源id
  payFlowId: string; // 交易流水主键
  payFactory: string; // 支付渠道id
  orderId: string; //订单id
  message: string; // 结算信息
  memo: string; // 备注
  fundtran: number; // 是否需要分账（0不分账 1分账）
  fundtranCAmount: number; // 教练分账金额
  fundtranCDate: string; // 教练分账时间
  fundtranSAmount: number; // 驾校分账金额
  fundtranSDate: string; // 驾校分账时间
  fundtranStatus: number; // 分账状态(0.未入账 1.已入账)
}
/**
 * @description 交易记录详情 查询单条交易记录
 * {@link http://192.168.192.132:3000/project/193/interface/api/52698}
 */
export function _getTransRecordDetail(query: { payFlowId: string }) {
  return request<TransRecordDetail>(`${CORE_PREFIX}/v1/stuOrderPay/transRecords/single`, 'GET', query, {
    withFailedFeedback: true,
  });
}
