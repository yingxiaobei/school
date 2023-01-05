import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';
import { Auth } from 'utils';

export interface ApplicationItem {
  orderId: string;
  sid: string;
  studentName: string;
  idCard: string;
  carType: string;
  applyType: string;
  applyTime: string;
  applyUser: string;
  auditStatus: string;
  auditTime: string;
  auditUser: string;
  remark: string;
  schoolName: string;
  area: string;
  orgName: string;
  updateUser: string; // 更新人
  updateTime: string; // 更新时间
  // schoolName:string;
  schoolId: string;
  applyFileObject: string;
}

export type PartTime = string | null;

export interface BaseApplication {
  id?: string;
  sid: string;
  schoolId?: string;
  applyType?: string;
  applyMessage?: string;
  applyTempId?: string[];
  applyFileUrls?: string[];
  studentName?: string;
  versionId?: string;
  idCard: string;
}

export interface ReportRecord {
  id?: string;
  firstPartTime?: string;
  secondPartTime?: string;
  thirdPartTime?: string;
  fourthPartTime?: string;
}

export interface PackageChange {
  id?: string;
  oldPackId?: string;
  oldPackName?: string;
  oldBankChannelId?: string;
  oldBankChannelName?: string;
  newPackId?: string;
  newPackName?: string;
  // 本期只能选择线下班级 所以也就不存在所谓的 newBankChannelId newBankChannelName
  newBankChannelId?: string;
  newBankChannelName?: string;
}

export interface Settlement {
  id?: string;
  packageamount?: string; // 套餐总额
  rechargeamount?: string; // 充值总额
  currentbalance?: string; // 当前余额
  settledamount?: string; // 已结算金额
  tobesettledamount?: string; // 待结算金额
  bankChannelId?: string; // 收款钱包
  bankChannelName?: string; // 收款钱包名称
}

export interface ApplyDate {
  id?: string;
  oldApplyDate?: string; // 原报名日期
  newApplyDate?: string; // 新报名日期
}

export interface TrainTypeChange {
  id?: string;
  oldTrainType?: string; // 原培训车型
  newTrainType?: string; // 新培训车型
}

export interface ApplicationDetail {
  stuApplyFormTotalVO: BaseApplication;
  stuReportRecordDetailVo: ReportRecord; // 报审补录
  stuPackageChangeApplyVo: PackageChange; // 更换班级
  stuSettlementDetailVo: Settlement; // 提前结清
  stuChangeApplydateDetailVo: ApplyDate; // 报名日期（监管审核
  stuChangeTraintypeDetailVo: TrainTypeChange; // 修改车型（监管审核
}

// 查询学员申请列表
export function _getApplicationList(
  query: Partial<{
    applyTimeStart: string;
    applyTimeEnd: string;
    sid: string;
    applyType: string;
    auditStatus: string;
    orderId: string;
  }>,
) {
  return request(`${CORE_PREFIX}/v1/stuApplyFormTotal/pageList`, 'GET', {
    ...query,
    schoolId: Auth.get('schoolId') || '',
  })!;
}

export function _updateApplicationInfo(body: any) {
  return request(`${CORE_PREFIX}/v1/stuApplyFormTotal/updateApplyRecord`, 'PUT', body, {
    withFailedFeedback: false,
    withFeedback: false,
    withFeedbackAll: false,
  });
}

// 驾校平台新增申请记录
// http://192.168.192.132:3000/project/193/interface/api/49302
export function _insertApplicationInfo(data: {
  stuApplyFormTotalVO: {
    id?: string;
    schoolId?: string;
    sid?: string;
    applyType?: string;
    applyTempId?: string[];
    applyMessage?: string;
    versionId?: string;
  };
  stuPackageChangeApplyVo?: PackageChange;
  stuReportRecordDetailVo?: ReportRecord;
  stuSettlementDetailVo?: Settlement;
  stuChangeApplydateDetailVo?: ApplyDate;
  stuChangeTraintypeDetailVo?: TrainTypeChange;
}) {
  return request(`${CORE_PREFIX}/v1/stuApplyFormTotal/addApplyRecord`, 'POST', data);
}

// http://192.168.192.132:3000/project/193/interface/api/49278
// 查询单个审核详情
export function _getApplicationDetail(query: { id: string }) {
  return request(`${CORE_PREFIX}/v1/stuApplyFormTotal/selectByKey`, 'GET', query);
}

// http://192.168.192.132:3000/project/193/interface/api/49326
// 提前结清检查
export function _checkBeforeAdvanceSettlement(query: { sid: string }) {
  return request(`${CORE_PREFIX}/v1/stuApplyFormTotal/auditAdvanceSettlementCheck`, 'GET', query);
}
