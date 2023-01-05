import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

// 获取学时审核详情
// http://192.168.192.132:3000/project/193/interface/api/24657
export async function _getStudyDetail(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/stuTrainTimeApply/detail`, 'GET', query);
}

// 提交申报
// http://192.168.192.132:3000/project/193/interface/api/24685
export async function _submit(query: {}) {
  return await request(`${CORE_PREFIX}/v1/stuTrainTimeApply/submit`, 'POST', query, {
    withFeedback: true,
  });
}

// 编辑申报
// http://192.168.192.132:3000/project/193/interface/api/24685
export async function _editSubmit(query: {}) {
  return await request(`${CORE_PREFIX}/v1/stuTrainTimeApply/edit`, 'POST', query, {
    withFeedback: true,
  });
}

// 获取审核结果
// http://192.168.192.132:3000/project/193/interface/api/24671
export async function _getApplyResult(query: { sid: any }) {
  return await request(`${CORE_PREFIX}/v1/stuTrainTimeApply/getApplyResult`, 'GET', query);
}

// 获取其他材料显示内容组ID
// http://192.168.192.132:3000/project/193/interface/api/24678
export async function _getOtherInfoGroupid() {
  return await request(`${CORE_PREFIX}/v1/stuTrainTimeApply/getOtherInfoGroupid`, 'GET');
}
