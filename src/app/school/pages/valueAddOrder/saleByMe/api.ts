import { request } from 'services';
import { VIDEO_FACE, CORE_PREFIX } from 'constants/env';

// const api = '/api/video-face';
// 我推销的总计
// http://192.168.192.132:3000/project/193/interface/api/54804
async function _getSum(query: any) {
  return await request(`${CORE_PREFIX}/v1/orderRetail/sum`, 'GET', query);
}

// 推广商已经绑定的驾校
// http://192.168.192.132:3000/project/248/interface/api/55020
async function _getSchool(query: any) {
  return await request(`${VIDEO_FACE}/v1/promote/manage/school/bind`, 'GET', query);
}

// 提现申请
// http://192.168.192.132:3000/project/193/interface/api/54828
export async function _apply(query: any) {
  return await request(`${CORE_PREFIX}/v1/stuOrderPay/withdrawApply/apply`, 'POST', query, {
    withFailedFeedback: true,
  });
}

// 提现申请
// http://192.168.192.132:3000/project/193/interface/api/54828
export async function _detailBySchoolId(query: any) {
  return await request(`${VIDEO_FACE}/v1/self/merchant/detailBySchoolId`, 'GET', query);
}

// 获取提交下载数量
// http://192.168.192.132:3000/project/193/interface/api/55620
async function _exportBefore(query: any) {
  return await request(`${CORE_PREFIX}/v1/orderRetail/getImportCount`, 'GET', query);
}

// 获取提交下载数量
// http://192.168.192.132:3000/project/193/interface/api/55626
async function _exportDetail(query: any) {
  return await request(`${CORE_PREFIX}/v1/orderRetail/importSelectOrder`, 'POST', query, {
    responseType: 'arraybuffer',
  });
}

export default {
  _exportDetail,
  _exportBefore,
  _detailBySchoolId,
  _apply,
  _getSum,
  _getSchool,
};
