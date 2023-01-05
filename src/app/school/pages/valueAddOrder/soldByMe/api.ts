import { request } from 'services';
import { VIDEO_FACE, CORE_PREFIX } from 'constants/env';

// const api = '/api/video-face';
// 我推销的总计
// http://192.168.192.132:3000/project/193/interface/api/54804
async function _getSum(query: any) {
  return await request(`${CORE_PREFIX}/v1/orderPromote/sum`, 'GET', query);
}

// 获取提交下载数量
// http://192.168.192.132:3000/project/193/interface/api/55620
async function _exportBefore(query: any) {
  return await request(`${CORE_PREFIX}/v1/orderPromote/getImportCount`, 'GET', query);
}

// 获取提交下载数量
// http://192.168.192.132:3000/project/193/interface/api/55626
async function _exportDetail(query: any) {
  return await request(`${CORE_PREFIX}/v1/orderPromote/importSelectOrder`, 'POST', query, {
    responseType: 'arraybuffer',
  });
}

// 分销订单分页列表
// http://192.168.192.132:3000/project/193/interface/api/54798
export async function _getList(query: { page: number; limit: number }) {
  return await request(`${CORE_PREFIX}/v1/orderPromote/listpage`, 'GET', query);
}

// 分销订单分页列表
// http://192.168.192.132:3000/project/193/interface/api/54792
export async function _getDetail(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/orderPromote/detail`, 'GET', query);
}

// 提现申请
// http://192.168.192.132:3000/project/193/interface/api/54828
export async function _apply(query: any) {
  return await request(`${CORE_PREFIX}/v1/stuOrderPay/withdrawApply/apply`, 'POST', query);
}

export default {
  _exportDetail,
  _exportBefore,
  _getSum,
  _getDetail,
  _getList,
};
