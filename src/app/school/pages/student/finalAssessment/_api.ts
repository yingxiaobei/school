import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';
import { CORE_PREFIX } from 'constants/env';

// 科目考核分页展示信息列表
// http://192.168.192.132:3000/project/183/interface/api/11119
export async function _getFinalAssess(query: {
  page: number;
  limit: number;
  studentname?: string; // 学员姓名
  stuidcard?: string; // 学员身份证
  appraisername?: string; // 考核人姓名
  subjectcode?: string; // 考核科目  1-科目一 2-科目二 3-科目三 4- 科目四
  sdate?: string; // 考核开始日期
  edate?: string; // 考核结束日期
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/stuAppraisalinfo/pageList`, 'GET', query);
}

//  根据主键查询并返回数据实体对象
// http://192.168.192.132:3000/project/183/interface/api/11133
export async function _getDetails(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/stuAppraisalinfo/selectByKey`, 'GET', query);
}

//  新增科目考核记录
// http://192.168.192.132:3000/project/183/interface/api/11126
export async function _addFinalAssess(query: {
  appraisaltime: string; // 考核日期YYYY-MM-DD
  studentnames: string; // 批量学员姓名,  以字符，隔开
  stuids: string; // 批量学员主键,  以字符，隔开
  appraiserid: string; // 考核人编号
  appraisername: string; // 考核人姓名
  subjectcode: string; // 考核科目  1-科目一 2-科目二 3-科目三 4- 科目四
  appraisalresult: string; // 考核结果(0-不合格 1-合格)
  achievement: number; // 考核成绩
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/stuAppraisalinfo/save`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'finalAssessment', elementId: 'student/finalAssessment:btn1' },
  });
}

//修改科目考核信息
//http://192.168.192.132:3000/project/183/interface/api/11140
export async function _editFinalAssess(query: {
  appraisaltime: string; // 考核日期YYYY-MM-DD
  studentname: string; // 学员姓名
  stuid: string; // 学员主键
  appraiserid: string; // 考核人编号
  appraisername: string; // 考核人姓名
  subjectcode: string; // 考核科目  1-科目一 2-科目二 3-科目三 4- 科目四
  appraisalresult: string; // 考核结果(0-不合格 1-合格)
  achievement: number; // 考核成绩
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/stuAppraisalinfo/updateByKey`, 'PUT', query, {
    customHeader: { menuId: 'finalAssessment', elementId: 'student/finalAssessment:btn2' },
  });
}

//查询科目考核信息
//http://192.168.192.132:3000/project/183/interface/api/11133
export async function _getFinalAssessDetail(query: { id?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/stuAppraisalinfo/selectByKey`, 'GET', query);
}

// 查询考核员列表
// http://192.168.192.132:3000/project/183/interface/api/16614
export async function _getCoaList(query: { coachname?: string; registered_examFlag?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageListExam`, 'GET', {
    registered_examFlag: '2', //备案状态精确搜索   0 :未备案，1: 备案审核中   2: 备案同意启用 3: 备案不同意启用  4：编辑后待重新备案
    employstatusKhy: '01', // 00-注册 01-在教 02-停教 03-转校 04-离职 05-注销 06-再教育
    limit: 5,
    page: 1,
    ...query,
  });
}

//基于教育大纲配置获取驾校培训阶段combo
//http://192.168.192.132:3000/project/193/interface/api/20681
export async function _getSchoolSubjectTrainCombo() {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getSchoolSubjectTrainCombo`, 'GET');
}

// 获取驾校科目结业鉴定的报审(包括从业)combo
// http://192.168.192.132:3000/project/193/interface/api/24846
export async function _getSchoolSubjectExamCombo() {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getSchoolSubjectExamCombo`, 'GET');
}

// 从业考核鉴定产出物 --考核成绩单是否要上传
// http://192.168.192.132:3000/project/193/interface/api/24909
export async function _isExamcertOutputsNeedFile() {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/isExamcertOutputsNeedFile`, 'GET');
}

//
// 查询学员网络学习阶段测试成绩
// http://192.168.192.132:3000/project/193/interface/api/36047
export async function _getStuNetStudyTestRecordVOBySid(query: any) {
  return await request(`${CORE_PREFIX}/v1/stuNetStudyTest/getStuNetStudyTestRecordVOBySid`, 'GET', query);
}
