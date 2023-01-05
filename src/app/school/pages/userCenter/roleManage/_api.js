import { request } from 'services';
import { USER_CENTER_PREFIX } from 'constants/env';
const prefix = USER_CENTER_PREFIX;

// 角色列表
// http://192.168.192.132:3000/project/198/interface/api/20191
export async function _getRoleList(query) {
  return request(`${prefix}/role/page`, 'GET', query);
}

// 删除角色
// http://192.168.192.132:3000/project/198/interface/api/20233
export async function _deleteRole(query) {
  const { id } = query;
  return request(
    `${prefix}/role/${id}/delete`,
    'DELETE',
    {},
    { customHeader: { menuId: 'userCenter/roleManage', elementId: 'userCenter/roleManage:btn6' } },
  );
}

// 添加角色
// http://192.168.192.132:3000/project/198/interface/api/20219
export async function _addRole(query) {
  return request(`${prefix}/role/create`, 'POST', query, {
    withFeedback: true,
    customHeader: {
      menuId: 'userCenter/roleManage',
      elementId: 'userCenter/roleManage:btn1',
    },
  });
}

// 修改角色
// http://192.168.192.132:3000/project/198/interface/api/20226
export async function _editRole(query) {
  const { id, ...params } = query;
  return request(`${prefix}/role/${id}/update`, 'PUT', params, {
    customHeader: {
      menuId: 'userCenter/roleManage',
      elementId: 'userCenter/roleManage:btn5',
    },
  });
}

// 查询角色下用户列表
// http://192.168.192.132:3000/project/198/interface/api/20261
export async function _getBindUsers(query) {
  const { id, ...params } = query;
  return request(`${prefix}/role/${id}/user/bind/page`, 'GET', params);
}

// 查询非角色下用户列表
// http://192.168.192.132:3000/project/198/interface/api/20268
export async function _getUnbindUsers(query) {
  const { id, ...params } = query;
  return request(`${prefix}/role/${id}/user/unbind/page`, 'GET', params, {
    customHeader: { menuId: 'userCenter/roleManage', elementId: 'userCenter/roleManage:btn3' },
  });
}

// 取消关联用户
// http://192.168.192.132:3000/project/198/interface/api/20282
export async function _unbindUser(query) {
  const { id, userIds } = query;
  return request(`${prefix}/role/${id}/user/unbind`, 'PUT', userIds, {
    customHeader: { menuId: 'userCenter/roleManage', elementId: 'userCenter/roleManage:btn4' },
  });
}

// 关联用户
// http://192.168.192.132:3000/project/198/interface/api/20275
export async function _bindUser(query) {
  const { id, userIds } = query;
  return request(`${prefix}/role/${id}/user/bind`, 'PUT', userIds, {
    customHeader: { menuId: 'userCenter/roleManage', elementId: 'userCenter/roleManage:btn3' },
  });
}

// 查询树形菜单列表
// http://192.168.192.132:3000/project/98/interface/api/4301
export async function _getMenuTree(query) {
  const { category = 'ERP', ...params } = query;
  return request(`${prefix}/menu/tree?category=${category}`, 'GET', params);
}

// 根据菜单ID查询元素资源列表
// http://192.168.192.132:3000/project/98/interface/api/4329
export async function _getMenuElements(query) {
  const { id, ...params } = query;
  return request(`${prefix}/menu/${id}/element`, 'GET', params);
}

// 查询角色下菜单，元素资源
// http://192.168.192.132:3000/project/98/interface/api/3356
export async function _getRoleResource(query) {
  const { id, category = 'ERP', ...params } = query;
  return request(`${prefix}/role/${id}/resource?category=${category}`, 'GET', params);
}

// 分配资源
// http://192.168.192.132:3000/project/198/interface/api/20247
export async function _putRoleResource(query) {
  const { id, ...params } = query;
  return request(`${prefix}/role/${id}/resource`, 'PUT', params, {
    customHeader: { menuId: 'userCenter/roleManage', elementId: 'userCenter/roleManage:btn2' },
  });
}

// 角色导出
// http://192.168.192.132:3000/project/198/interface/api/47574
export async function _exportRole(query) {
  return request(`/api/usercenter/role/${query.id}/exportRole`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

// 角色导出
// http://192.168.192.132:3000/project/198/interface/api/47574
export async function _exportRoleBefore(query) {
  return request(`/api/usercenter/role/${query.id}/exportRoleBefore`, 'GET', query);
}
