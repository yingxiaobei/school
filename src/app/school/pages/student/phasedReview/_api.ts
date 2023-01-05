import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';
import { AxiosPromise } from 'axios';

// 初审管理-分页展示报审信息列表
// http://192.168.192.132:3000/project/193/interface/api/14402
export async function _getFinalAssess(query: {
  page: number;
  limit: number;
  subject?: string; // 报审类型 培训科目/部分/阶段(1-科目一 2-科目二 3-科目三 4- 科目四   5-组合报审   9-结业上报
  sid?: string; // 学员表主键
  isapply?: string; // 报审状态 0: 待提交（申请准备）   1：已提交（提交上报）  2：通过（同意）  3： 不通过（拒绝）  4：撤销
  sdate?: string;
  edate?: string;
  cid?: string;
}) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/pageList`, 'GET', query);
}

//  阶段报审详情
// http://192.168.192.132:3000/project/193/interface/api/14416
export async function _getDetails(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/selectByKey`, 'GET', query);
}

//  注销报审申请记录
// http://192.168.192.132:3000/project/193/interface/api/14423
export async function _cancelFinalAssess(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/cancel/${query.id}`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'phasedReview', elementId: 'student/phasedReview:btn2' },
  });
}

// 结业/阶段申请提交信息回调接口
// http://192.168.192.132:3000/project/193/interface/api/17076
export async function _updateStuIsApply(query: { id: string }, withFeedbackAll: any = true) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/upload/${query.id}`, 'PUT', query, {
    withFeedbackAll,
    customHeader: { menuId: 'phasedReview', elementId: 'student/phasedReview:btn4' },
  });
}

// 科目申请-满足科目报审条件的学员记录信息
// http://192.168.192.132:3000/project/193/interface/api/14437
export async function _getStudent(query: {
  page: number;
  limit: number;
  subject?: string; // 报审类型 培训科目/部分/阶段(1-科目一 2-科目二 3-科目三 4- 科目四   5-组合报审   9-结业上报
  sid?: string; // 学员表主键
}) {
  return await request(`${CORE_PREFIX}/v1/stuStageApplyPrestep/pageList`, 'GET', query);
}

// 新增阶段报审申请/结业报审申请
// http://192.168.192.132:3000/project/193/interface/api/14409
export async function _addReview(query: {
  applyPrestepId: string; // 学员报审申请前置表主键
}) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/save`, 'POST', query, {
    customHeader: { menuId: 'phasedReview', elementId: 'student/phasedReview:btn1' },
  });
}

// 查看监管审核结果
// http://192.168.192.132:3000/project/193/interface/api/19099
export async function _getResult(query: { id: string; withFeedbackAll?: boolean }) {
  const { withFeedbackAll = true } = query;
  return await request(
    `${CORE_PREFIX}/v1/stuStageApply/stageTrainningTimeReview/${query.id}`,
    'PUT',
    {},
    {
      withFeedbackAll: withFeedbackAll,
      customHeader: { menuId: 'phasedReview', elementId: 'student/phasedReview:btn3' },
    },
  );
}

// 查看阶段培训记录表
export async function _getReport(query: { id: string }) {
  return await request(
    `${CORE_PREFIX}/v1/stuStageApply/reBuildReport/${query.id}`,
    'GET',
    {},
    { withFailedFeedback: true },
  );
}

//科目上报的方式 1:ukey盖章 0：传统方式不用ukey
//http://192.168.192.132:3000/project/193/interface/api/22074
export async function _getReportType(query: { id: string; withFeedbackAll?: boolean }) {
  const { withFeedbackAll = false } = query;
  return await request(
    `${CORE_PREFIX}/v2/stuStageApply/getStageUploadType/${query.id}`,
    'GET',
    {},
    { withFailedFeedback: withFeedbackAll },
  );
}

//获取Ukey签字所需的报文原始数据
//http://192.168.192.132:3000/project/193/interface/api/22060
export async function _getUKeyData(query: { id: string; withFeedbackAll?: boolean }) {
  const { withFeedbackAll = false } = query;
  return await request(
    `${CORE_PREFIX}/v1/stuStageApply/getStageDataForSignature/${query.id}`,
    'GET',
    {},
    { withFeedbackAll: withFeedbackAll },
  );
}

//Ueky盖章与签字内容提交报审
//http://192.168.192.132:3000/project/193/interface/api/22067
export async function _uploadByKeyAndSignature(query: {
  id: string;
  fileId: string;
  signatureData: string;
  ukeyFactory?: string; //默认是 传统模式  // 1--传统模式，国交加签模式，通讯报文中需要加签数据，对图章不做签名   ； 2--福州地区Ukey模式。 对三联单pdf文件使用金格的组件 盖章，监管侧要
  keysn?: string;
  orgname?: string;
  seal?: string;
}) {
  return await request(
    `${CORE_PREFIX}/v2/stuStageApply/uploadByKeyAndSignature/${query.id}`,
    'PUT',
    {
      fileId: query.fileId,
      signatureData: query.signatureData,
      ukeyFactory: query.ukeyFactory,
      keysn: query.keysn,
      orgname: query.orgname,
      seal: query.seal,
    },
    {
      withFeedback: true,
    },
  );
}

// 导出阶段报审Excel
// http://192.168.192.132:3000/project/193/interface/api/22669
export async function _export(query: {
  sdate: string; // 初审开始时间 YYYY-MM-DD
  edate: string; // 初审截止时间 YYYY-MM-DD
}) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/export`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

// 导出阶段报审Excel查询
// http://192.168.192.132:3000/project/183/interface/api/23523
export async function _exportStageApplyBefore(query: {
  sdate: string; // 初审开始时间 YYYY-MM-DD
  edate: string; // 初审截止时间 YYYY-MM-DD
}) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/exportStageApplyBefore`, 'GET', query);
}

//学员报审科目签名提交
//http://192.168.192.132:3000/project/193/interface/api/17979
export async function _submitSignature(query: {
  sid: string;
  said: string; //报审科目记录编码
  fileid: string; //学员签字文件编码
  filetype: string; //1学员，2是教练，3是考核员
}) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/submitStuSignature`, 'PUT', query, {
    // withFeedback: true,
    withFeedbackAll: false,
  });
}

// 重新上传培训记录单到省监管平台
// http://192.168.192.132:3000/project/193/interface/api/26582
export async function _submitSupervisorPlatform(query: { id: string }) {
  const { id } = query;
  return await request(
    `${CORE_PREFIX}/v1/stuStageApply/uploadStagePdfToSupervisorPlatform/${id}`,
    'PUT',
    {},
    {
      withFeedback: true,
    },
  );
}

//修正异常学时
export async function _editAbnormalData(query: { id: string }) {
  const { id } = query;
  return await request(
    `${CORE_PREFIX}/v1/stuStageApply/build/abnormalData/${id}`,
    'POST',
    {},
    {
      withFeedback: true,
    },
  );
}

// http://192.168.192.132:3000/project/193/interface/api/39414
export async function _settleProducerPerson(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/stuOrderSettlement/settleProducerPerson`, 'GET', query, {
    // withFeedback: true,
  });
}

// 学员档案 - 详情中 - 驾训信息（阶段报审） 同步监管报审记录
export async function _getSyncInfoForJGReportAuditRecords(query: { [key: string]: unknown }) {
  return await request(
    `${CORE_PREFIX}/v1/stuStageApply/syncStageTrainningTime?sid=${query.sid}&subject=${query.subject}`,
    'POST',
    undefined,
    {
      withFeedback: false,
    },
  );
}

// 重新生成三联单
export async function _reSignName(query: { id: string }, customHeader?: any) {
  return await request(
    `${CORE_PREFIX}/v1/stuStageApply/reSignName/${query.id}`,
    'GET',
    {},
    { withFailedFeedback: true, customHeader },
  );
}

// 重新上报
export async function _reloadApp(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/reload/${query.id}`, 'PUT', {}, { withFeedbackAll: false });
}

export type AllocatedHour = {
  id: string;
  sid: string;
  schoolId: string;
  subjectCode: string;
  trainType: string;
  fileUrl: string;
  status: number;
  studentName: string;
  idCard: string;
  studentNum: string;
  firstAuditTime: string;
};

// 分页展示配比学时列表
// http://192.168.192.132:3000/project/193/interface/api/49776
export function _allocateHours(data: {
  page?: string;
  limit?: string;
  sid?: string; // 用户id
  cid?: string; // 教练id
  said?: string; // 阶段报审主键id
  subjectCode?: string; // 科目类型：1-科目一，2-科目二，3-科目三，4-科目四
  startDate?: string; // 初审开始时间
  endDate?: string; // 初审结束时间
  status?: string; // 配比学时状态：0初始状态已生成，1已删除
}): AxiosPromise<AllocatedHour> {
  return request(`${CORE_PREFIX}/v1/stuStageApplyRatioPeriod/pageList`, 'POST', data)!;
}

// 删除配比学时
// http://192.168.192.132:3000/project/193/interface/api/49794
export function _delAllocatedHours(id: string) {
  return request(`${CORE_PREFIX}/v1/stuStageApplyRatioPeriod/delete/${id}`, 'DELETE')!;
}

// 上传配比学时文件
// http://192.168.192.132:3000/project/193/interface/api/49782
export function _uploadRecord({ id, fileUrl }: { id: string; fileUrl: string }) {
  return request(
    `${CORE_PREFIX}/v1/stuStageApplyRatioPeriod/upload/${id}`,
    'PUT',
    {
      fileUrl,
    },
    {
      withFeedbackAll: false,
    },
  )!;
}

// 重新生成配比学时
// http://192.168.192.132:3000/project/193/interface/api/49860
export function _reGenerateAllocatedHours(id: string) {
  return request(`${CORE_PREFIX}/v1/stuStageApplyRatioPeriod/regenerateShareClassRecord/${id}`, 'POST')!;
}

// 查看配比学时证明文件
// http://192.168.192.132:3000/project/193/interface/api/49788
export function _getAllocatedHoursFile(id: string) {
  return request(`${CORE_PREFIX}/v1/stuStageApplyRatioPeriod/fileUrl/${id}`, 'GET')!;
}
// 推送公安
// http://192.168.192.132:3000/project/193/interface/api/49926
export async function _singlepxjl(query: { id: string }) {
  return await request(
    `${CORE_PREFIX}/v1/stuStageApply/singlepxjl/${query.id}`,
    'POST',
    {},
    { withFailedFeedback: true, withFeedbackAll: false },
  );
}

// 校验签名是否存在
export async function _checkSignExist(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/checkSignExist/${query.id}`, 'GET');
}

// 清空PDF
export async function _deleteReportPdf(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/deleteReportPdf/${query.id}`, 'GET');
}

// 查看PDF
export async function _viewReport(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/viewReport/${query.id}`, 'GET');
}
