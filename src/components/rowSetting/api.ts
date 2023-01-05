import { request } from 'services';

// 获取当前驾校所有表头
export async function _getColumInfo() {
  return request(`/api/usercenter/form/listByUser`, 'GET');
}

// 获取当前驾校所有表头
// http://192.168.192.132:3000/project/98/interface/api/3076
export async function _saveColumInfo(query: any) {
  return request(`/api/usercenter/form/saveUserForm`, 'POST', query);
}
