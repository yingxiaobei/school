import { request } from 'services';

// 分页查询
// http://192.168.192.132:3000/project/233/interface/api/27961
export async function _getPageList(query: any) {
  return request(`/api/jp-portal-svc/v1/portalArticle/pageList`, 'GET', query);
}

// 根据主键查询并返回数据实体对象
// http://192.168.192.132:3000/project/233/interface/api/27975
export async function _getDetails(query: { id: string }) {
  return request(`/api/jp-portal-svc/v1/portalArticle/selectByKey`, 'GET', query);
}

// 根据主键修改数据实体对象
// http://192.168.192.132:3000/project/233/interface/api/27989
export async function _updateByKey(query: any) {
  return request(`/api/jp-portal-svc/v1/portalArticle/updateByKey`, 'PUT', query, { withFeedback: true });
}

// 新增
// http://192.168.192.132:3000/project/233/interface/api/27989
export async function _addNews(query: any) {
  return request(`/api/jp-portal-svc/v1/portalArticle/save`, 'POST', query, { withFeedback: true });
}

// 根据主键删除数据实体对象
// http://192.168.192.132:3000/project/233/interface/api/27954
export async function _delete(query: { id: string }) {
  return request(`/api/jp-portal-svc/v1/portalArticle/delete/${query.id}`, 'DELETE', query);
}

//置顶
//http://192.168.192.132:3000/project/233/interface/api/27982
///v1/portalArticle/top
export async function _portalArticleTop(query: { id: string; type: string; isTop: string }) {
  return request(`/api/jp-portal-svc/v1/portalArticle/top`, 'POST', query, { withFeedback: true });
}

export async function _getListByType() {
  //类别类型 1：文章 2：栏目
  return request(`/api/jp-portal-svc/v1/portalCategory/listByType`, 'GET', { categoryType: 1 });
}
