import { request } from 'services';

// 查询树形菜单列表
// http://192.168.192.132:3000/project/98/interface/api/4301
interface I_getMenuTree {
  companyId: string | null;
  username: string | null;
}
export async function _getMenuTree(_: I_getMenuTree) {
  return request(`/api/usercenter/menu/tree?category=ERP`, 'GET');
}
//
export async function _getMenuTreeAboutExam(_: I_getMenuTree) {
  return request(`/api/usercenter/menu/tree?category=EXAMTOOL`, 'GET');
}

// 获取登录用户信息（基本信息，菜单，元素资源）
// http://192.168.192.132:3000/project/98/interface/api/3076
export async function _getUserInfo() {
  return request(`/api/usercenter/user/front/info?category=ERP`, 'GET');
}

// 获取当前驾校所有表头
export async function _getColumInfo() {
  return request(`/api/usercenter/form/listByUser`, 'GET');
}

// 获取当前驾校所有表头
// http://192.168.192.132:3000/project/98/interface/api/3076
export async function _saveColumInfo(query: any) {
  return request(`/api/usercenter/form/saveUserForm`, 'POST', query);
}
