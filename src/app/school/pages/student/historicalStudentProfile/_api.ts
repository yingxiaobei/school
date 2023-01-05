import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';
import { AxiosResponse } from 'axios';

export type HistoryOfStudent = {
  address: string;
  age: number;
  applydate: string;
  bankaccountflag: string;
  birthday: string;
  busitype: string;
  cardstu: string;
  cardtype: string;
  certproclass: string;
  contractflag: string;
  enterdays: string;
  idauthclosed: string;
  idcard: string;
  isbindecardno: string;
  isotherprovince: string;
  ispay: string;
  name: string;
  nationality: string;
  phone: string;
  registeredFlag: string;
  registeredNationalFlag: string;
  schoolid: string;
  sex: string;
  sid: string;
  status: string;
  stuchargemode: string;
  studentnum: string;
  studenttype: string;
  stutransareatype: string;
  stutransplatformtype: string;
  trainTimeApplyStatus: string;
  traintype: string;
  unregisteredFlag: string;
  [key: string]: any;
};

// 查看历史学员数据
// http://192.168.192.132:3000/project/193/interface/api/33596
export async function _getPageList(query: {
  page: number;
  limit: number;
  name?: string; // 学员姓名或拼音码
  idcard?: string; // 身份证件号码
  registeredFlag?: string; // 监管平台备案标记-  0 :未备案，1: 已备案
  status?: string; // 学员状态(00-报名 01-学驾中 02-退学 03-结业 04-注销 05-转校 99-归档)
  traintype?: string; // 培训车型   编码单选C1/C2等
  busitype?: string; // 业务类型 0:初领 1:增领 9:其他
  // contractflag?: string; // 合同签订标志 0 未签订  1已签订
  applydatebegin?: string; // 报名起始日期
  applydateend?: string; // 报名结束日期
  sid?: string;
  studenttype?: string; // 学员类型
  cid?: string;
}) {
  return await request<HistoryOfStudent>(`${CORE_PREFIX}/v1/stuStudentArchive/pageList`, 'GET', query);
}

// 查看详情
// http://192.168.192.132:3000/project/193/interface/api/33610
export async function _getDetails(query: { id: string }, customHeader: any) {
  return request(`${CORE_PREFIX}/v1/stuStudentArchive/selectByKey`, 'GET', query, { customHeader });
}

// 监管地址配置0：国交 1：至正
// http://192.168.192.132:3000/project/193/interface/api/25448
export async function _getJGRequestPlatformType() {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getJGRequestPlatformType`, 'GET');
}

// 历史学员转正
// http://192.168.192.132:3000/project/193/interface/api/36344
// /v1/stuStudentArchive/transforToStudent
export async function _changeNormalStudent(query: {
  bankAccount?: string; // 账户
  bankChannelId?: string; // 银行渠道id
  packageId: string; // 班级id
  packageName: string; // 班级名称
  sid: string; // 学员Id
}): Promise<AxiosResponse<any> | undefined> {
  return await request(`${CORE_PREFIX}/v1/stuStudentArchive/transforToStudent`, 'POST', query, {
    customHeader: {
      'Content-Type': 'application/json',
    },
  });
}

// 查询用户已开户的渠道列表
// http://192.168.192.132:3000/project/193/interface/api/26736
export async function _queryOpenedBanks(query: { userId: string }) {
  return await request(`${CORE_PREFIX}/v2/account/queryOpenedBanksByUserId`, 'GET', query);
}
