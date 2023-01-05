import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';
import { AES_ENCRYPT, Auth, _get } from 'utils';
import { _getSysTime } from 'api';
import md5 from 'md5';

// 获取学员退学管理列表
// http://192.168.192.132:3000/project/193/interface/api/17440
export async function _getInfo(query: {
  page: number;
  limit: number;
  stunum?: string; // 学员统一编号
  isapply?: string; // 报审状态 0: 待提交（申请准备）   1：已提交（提交上报）  2：通过（同意）  3： 不通过（拒绝）  4：撤销   5：提交准备中
  idcard?: string; // 身份证件号码
  spell?: string; // 拼音码
  applydatebegin?: string; // 申请开始日期 yyyy-MM-dd
  applydateend?: string; // 申请结束日期 yyyy-MM-dd
}) {
  return await request(`${CORE_PREFIX}/v1/student/getStudentRetirePageList`, 'GET', query);
}

// 查询学员信息列表
// http://192.168.192.132:3000/project/193/interface/api/12722
export async function _getStudentInfo(query: { page: number; limit: number; status: string }) {
  const token = 'bearer' + Auth.get('token');
  const header = AES_ENCRYPT(md5(token)); //加密header,防爬虫
  const res = await _getSysTime();
  return await request(`${CORE_PREFIX}/v1/student/canRetireStuPageList`, 'GET', query, {
    customHeader: { [header]: AES_ENCRYPT(String(_get(res, 'data', ''))) },
  });
}

// 新增退学学员
// http://192.168.192.132:3000/project/193/interface/api/17461
export async function _addStudentRetire(query: { sid: string; reason?: string; applymemocode: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/saveStudentRetire`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentDropped', elementId: 'student/studentDropped:btn1' },
  });
}

// 撤销退学学员
// http://192.168.192.132:3000/project/193/interface/api/17468
export async function _deleteStudentRetire(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/deleteRetire/${query.id}`, 'DELETE');
}

// 审核学员信息
// http://192.168.192.132:3000/project/193/interface/api/17475
export async function _reviewStudentRetire(query: { id: string; isapply: string }, customHeader: any) {
  return await request(
    `${CORE_PREFIX}/v1/stuStageApply/updateByKey/${query.id}/retire/${query.isapply}`,
    'PUT',
    query,
    { customHeader: customHeader, withFeedbackAll: false },
  );
}

//http://192.168.192.132:3000/project/193/interface/api/24377
//学员退学-监管注销
export async function _cancelStuLation(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/cancelStuLation/${query.id}`, 'PUT', query, {
    customHeader: { menuId: 'studentDropped', elementId: 'student/studentDropped:btn5' },
  });
}

//http://192.168.192.132:3000/project/193/interface/api/46374
//检验学员电子教学日志是否已上传
export async function _checkSbjectClassUploadInfo(query: { id: any }) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/checkSbjectClassUploadInfo/${query.id}`, 'GET');
}

//http://192.168.192.132:3000/project/193/interface/api/49206
//学员注销申请-至正(上报监管审核)
export async function _upReview(query: any) {
  return await request(`${CORE_PREFIX}/v1/stuStageApply/logout`, 'POST', query, { withFeedback: true });
}
