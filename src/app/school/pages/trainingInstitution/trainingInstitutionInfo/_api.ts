import { request } from 'services';
import { USER_CENTER_PREFIX } from 'constants/env';

// 运维人员查看详情-(页面所有信息)
// http://192.168.192.132:3000/project/198/interface/api/17643
export async function _getInfo(query: {
  id: string; // 驾校id
}) {
  return await request(`${USER_CENTER_PREFIX}/v1/company/${query.id}/detail/sys`, 'GET', query);
}

// 查询基础信息
// http://192.168.192.132:3000/project/198/interface/api/17608
export async function _getBaseInfo(query: {
  id: string; // 驾校id
}) {
  return await request(`${USER_CENTER_PREFIX}/v1/company/${query.id}/basicInfo`, 'GET', query);
}

// 查询教学信息
// http://192.168.192.132:3000/project/198/interface/api/17692
export async function _getTeachInfo(query: {
  id: string; // 驾校id
}) {
  return await request(`${USER_CENTER_PREFIX}/v1/company/${query.id}/teachInfo`, 'GET', query);
}

// 查询培训机构图片
// http://192.168.192.132:3000/project/198/interface/api/17657
export async function _getImg(query: {
  id: string; // 驾校id
}) {
  return await request(`${USER_CENTER_PREFIX}/v1/company/${query.id}/imgs`, 'GET', query);
}

// 查询认证信息
// http://192.168.192.132:3000/project/198/interface/api/17601
export async function _getAuthInfo(query: {
  id: string; // 驾校id
}) {
  return await request(`${USER_CENTER_PREFIX}/v1/company/${query.id}/authInfo`, 'GET', query);
}
