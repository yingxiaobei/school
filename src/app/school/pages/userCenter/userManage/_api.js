import { request } from 'services';
import { USER_CENTER_PREFIX } from 'constants/env';
const prefix = USER_CENTER_PREFIX;

// 用户列表
// http://192.168.192.132:3000/project/198/interface/api/20303
export async function _getUserList(query) {
  return request(`${prefix}/user/page`, 'GET', query);
}

// 组织结构
// http://192.168.192.132:3000/project/198/interface/api/19778
export async function _getTreeByLoginUser(query) {
  return request(`${prefix}/v1/org/treeByLoginUser`, 'GET', query);
}

// 解除用户
// http://192.168.192.132:3000/project/198/interface/api/20331
export async function _deleteUser(query) {
  const { id, ...params } = query;
  return request(`${prefix}/user/${id}/deleteByCompany`, 'DELETE', params, {
    customHeader: { menuId: 'userCenter/userManage', elementId: 'userCenter/userManage:btn4' },
  });
}

// 添加用户
// http://192.168.192.132:3000/project/198/interface/api/20142
export async function _addUser(query) {
  return request(`${prefix}/user/createByCompany`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'userCenter/userManage', elementId: 'userCenter/userManage:btn1' },
  });
}

// 修改用户
// http://192.168.192.132:3000/project/198/interface/api/20149
export async function _editUser(query) {
  const { id, ...params } = query;
  return request(`${prefix}/user/${id}/update`, 'PUT', params, {
    customHeader: { menuId: 'userCenter/userManage', elementId: 'userCenter/userManage:btn3' },
  });
}

// 搜索用户
export async function _getSearchUserList(query) {
  const { key, value, ...params } = query;
  return request(`${prefix}/user/search?${[key]}=${[value]}`, 'GET', params);
}

// 核验用户是否存在
export async function _checkUsername(query) {
  return request(`/api/usercenter/user/username/check`, 'GET', query);
}

// 绑定用户（培训机构）
export async function _bindUser(query) {
  return request(`/api/usercenter/user/bindUserToCompanyAndOrgs`, 'POST', query, {
    withFeedback: true,
    customHeader: {
      menuId: 'userCenter/userManage',
      elementId: 'userCenter/userManage:btn5',
    },
  });
}

// 保存更新删除审核员
export async function _updateAuditUser(query) {
  return request(`${USER_CENTER_PREFIX}/user/updateAuditUser`, 'GET', query);
}

// 获取默认审核员
export async function _getAuditUser(query) {
  return request(`${USER_CENTER_PREFIX}/user/getAuditUser`, 'GET', query);
}
