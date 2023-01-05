import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// 学员人脸模板分页列表
// http://192.168.192.132:3000/project/183/interface/api/17412
export async function _getStudentFace(query: {
  page: number;
  limit: number;
  name?: string; // 学员姓名
  idcard?: string; // 学员身份证号
  create_date_start?: string; // 申请开始日期 yyyy-MM-dd
  create_date_end?: string; // 申请结束日期 yyyy-MM-dd
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/stuFaceTemplate/pageList`, 'GET', query);
}

// 查看学员人脸模板
// http://192.168.192.132:3000/project/183/interface/api/17433
export async function _getDetails(query: { sid: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/stuFaceTemplate/view`, 'GET', query);
}

// 人工审核学员人脸模板
// http://192.168.192.132:3000/project/183/interface/api/17405
export async function _handleReview(query: {
  sid: string; // 教练主键id
  handcheckflag: string; // 人工审核结果
  memo?: string; // 备注
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/stuFaceTemplate/approve`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentFace', elementId: 'student/studentFace:btn2' },
  });
}

// 作废学员人脸模板
// http://192.168.192.132:3000/project/183/interface/api/22585
export async function _cancelTemp(query: { sid: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/stuFaceTemplate/cancel/${query.sid}`, 'PUT');
}
