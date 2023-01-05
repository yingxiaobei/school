import { request } from 'services';

// 分页展示信息列表
// http://192.168.192.132:3000/project/233/interface/api/28003
export async function _getPageList(query: any) {
  return request(`/api/jp-portal-svc/v1/portalSubject/pageList`, 'GET', query);
}

// 根据主键查询并返回数据实体对象
// http://192.168.192.132:3000/project/233/interface/api/28017
export async function _getDetails(query: { id: string }) {
  return request(`/api/jp-portal-svc/v1/portalSubject/selectByKey`, 'GET', query);
}

// 根据主键修改数据实体对象
// http://192.168.192.132:3000/project/233/interface/api/28024
export async function _updateByKey(query: any) {
  return request(`/api/jp-portal-svc/v1/portalSubject/updateByKey`, 'PUT', query, { withFeedback: true });
}

// 新增
// http://192.168.192.132:3000/project/233/interface/api/28010
export async function _addNews(query: any) {
  return request(`/api/jp-portal-svc/v1/portalSubject/save`, 'POST', query, { withFeedback: true });
}

// 根据主键删除数据实体对象
// http://192.168.192.132:3000/project/233/interface/api/27996
export async function _delete(query: { id: string }) {
  return request(`/api/jp-portal-svc/v1/portalSubject/delete/${query.id}`, 'DELETE', query);
}
