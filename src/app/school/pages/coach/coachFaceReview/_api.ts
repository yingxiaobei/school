import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// 教练人脸模板分页列表
// http://192.168.192.132:3000/project/183/interface/api/17377
export async function _getCoachFace(query: {
  page: number;
  limit: number;
  name?: string; // 教练员姓名
  idcard?: string; // 学员身份证号
  create_date_start?: string; // 上传时间开始
  create_date_end?: string; // 上传时间结束
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coaFaceTemplate/pageList`, 'GET', query);
}

// 查看教练人脸模板
// http://192.168.192.132:3000/project/183/interface/api/17398
export async function _getDetails(query: { cid: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coaFaceTemplate/view`, 'GET', query);
}

// 人工审核教练人脸模板
// http://192.168.192.132:3000/project/183/interface/api/17370
export async function _handleReview(query: {
  cid: string; // 教练主键id
  handcheckflag: string; // 人工审核结果
  memo?: string; // 备注
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coaFaceTemplate/approve`, 'POST', query, {
    customHeader: { menuId: 'coachFaceReview', elementId: 'coach/coachFaceReview:btn2' },
  });
}

//作废教练人脸模板
//http://192.168.192.132:3000/project/183/interface/api/22130
export async function _deleteCoaFaceTemplate(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coaFaceTemplate/delete`, 'DELETE', query);
}
