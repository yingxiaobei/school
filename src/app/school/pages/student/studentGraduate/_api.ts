import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

// 学员结业管理列表
// http://192.168.192.132:3000/project/193/interface/api/14395
export async function _getStudentFace(query: {
  page: number;
  limit: number;
  name?: string; // 学员姓名
  idcard?: string; // 学员身份证号
  sdate?: string; // 申请开始日期 yyyy-MM-dd
  edate?: string; // 申请结束日期 yyyy-MM-dd
  isapply?: string; //上传状态 0：未上传； 1：已上传； 不传：全部；
  sid?: string; // 学员id
  notapply?: string; //不包括的上传状态
  traintype?: string; //车型
}) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/pageGraduatesList`, 'GET', query);
}

// 获取满足结业申请的学员列表
// http://192.168.192.132:3000/project/193/interface/api/14430
export async function _applyGraduatesList(query: { page: number; limit: number; sid: string; traintype?: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApplyPrestep/pageGraduatesList`, 'GET', query);
}

// 电子档案--结业证书
// http://192.168.192.132:3000/project/193/interface/api/17300
export async function _getFileUrl(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/student/getGraduateReport`, 'GET', query);
}

// 新增阶段报审申请/结业报审申请
// http://192.168.192.132:3000/project/193/interface/api/14409
export async function _addReview(query: {
  applyPrestepId: string; // 学员报审申请前置表主键
  graduateUpload: any; // 是否需要直接上传监管
}) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/graduate`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentGraduate', elementId: 'student/studentGraduate:btn1' },
  });
}

// 结业证上传
// http://192.168.192.132:3000/project/193/interface/api/20289
export async function _upload(query: { said: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/uploadGraduateStu/${query.said}`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentGraduate', elementId: 'student/studentGraduate:btn3' },
  });
}

// 结业审核(批量)
// http://192.168.192.132:3000/project/193/interface/api/23922
export async function _endReview(query: {
  saidList: any; // 结业主键list
  isapply: any; // 审核状态 0: 待审核     2：同意--  3： 拒绝
  respmsg?: string; // 拒绝时填写原因
}) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/batch/audit/graduates`, 'PUT', query, {
    withFeedbackAll: false,
  });
}

// 导出学员结业Excel前查询
// http://192.168.192.132:3000/project/193/interface/api/24559
export async function _exportGraduatesListBefore(query: {
  sdate: any; // 结业开始时间 YYYY-MM-DD
  edate?: string; // 结业截止时间 YYYY-MM-DD
}) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/exportGraduatesListBefore`, 'GET', query);
}

// 导出学员结业Excel
// http://192.168.192.132:3000/project/193/interface/api/24552
export async function _export(query: {
  sdate: any; // 结业开始时间 YYYY-MM-DD
  edate?: string; // 结业截止时间 YYYY-MM-DD
}) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/exportGraduatesList`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

interface IGetPageListResetStuStageApply extends IPaginationParams {
  equalStatus: any; // 学员状态，写死   01,03
  sid?: string; // sid学员主键
  subject: string; // subject科目，写实 9
}
// 分页展示可重置结业学员列表
// http://192.168.192.132:3000/project/193/interface/api/36719
export async function _getPageListResetStuStageApply(query: IGetPageListResetStuStageApply) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/getPagelistResetStuStageApply`, 'GET', query);
}

// 批量重置学员结业
// http://192.168.192.132:3000/project/193/interface/api/36709
export async function _auditResetGraduates(query: { saidList: string[] }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/AuditResetGraduates`, 'PUT', query);
}
