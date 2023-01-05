import { request } from 'services';
import { USER_CENTER_PREFIX } from 'constants/env';
const prefix = USER_CENTER_PREFIX;

// 查询树形组织
// http://192.168.192.132:3000/project/198/interface/api/19778
export async function _getOrganizationTree(query) {
  return request(`${prefix}/v1/org/treeByLoginUser`, 'GET', query);
}

// 添加组织
// http://192.168.192.132:3000/project/198/interface/api/19792
export async function _addOrganization(query) {
  return request(`${prefix}/v1/org/create`, 'POST', query, { withFeedback: true });
}

// 修改组织
// http://192.168.192.132:3000/project/198/interface/api/19799
export async function _editOrganization(query) {
  const { id, ...params } = query;
  return request(`${prefix}/v1/org/${id}/update`, 'PUT', params);
}

// 根据用户名删除用户
// http://192.168.192.132:3000/project/198/interface/api/19806
export async function _deleteOrganization(query) {
  const { id, ...params } = query;
  return request(`${prefix}/v1/org/${id}/delete`, 'DELETE', params);
}

// 关联用户
// http://192.168.192.132:3000/project/63/interface/api/1578
export async function _bindUser(query) {
  const { id, ...params } = query;
  return request(`${prefix}/v1/org/${id}/user/bind`, 'PUT', params);
}

// 查询非组织下用户
// http://192.168.192.132:3000/project/63/interface/api/1599
export async function _getUnbindUsers(query) {
  const { id } = query;
  return request(`${prefix}/v1/org/${id}/user/unbind/page`, 'GET');
}

// 查询非组织下用户
// http://192.168.192.132:3000/project/63/interface/api/1585
export async function _getBindUsers(query) {
  const { id, ...params } = query;
  return request(`${prefix}/v1/org/${id}/user/bind/page`, params, 'GET');
}

// 解除用户
// http://192.168.192.132:3000/project/63/interface/api/1592
export async function _unbindUser(query) {
  const { id, ...params } = query;
  return request(`${prefix}/v1/org/${id}/user/unbind`, params, 'PUT');
}
