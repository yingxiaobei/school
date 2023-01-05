import { PORTAL_PREFIX } from 'constants/env';
import { request } from 'services';

// import { request } from 'services/mock';

// 查询栏目
// http://192.168.192.132:3000/project/233/interface/api/29550
export async function _getList(query: any) {
  return await request(`${PORTAL_PREFIX}/v1/portalItem/selectItems`, 'GET', query);
}

// 查询栏目机构树
// http://192.168.192.132:3000/project/233/interface/api/29543
export async function _getTreeData(query: any) {
  return await request(`${PORTAL_PREFIX}/v1/portalItem/selectItemTreeVO`, 'GET', query);
}
// 添加栏目信息
// http://192.168.192.132:3000/project/233/interface/api/29529
export async function _addTopic(query: any) {
  return await request(`${PORTAL_PREFIX}/v1/portalItem/addItem`, 'POST', query, { withFeedback: true });
}

// 修改栏目信息
// http://192.168.192.132:3000/project/233/interface/api/29557
export async function _updateTopic(query: any) {
  const { id, ...rest } = query;
  return await request(`${PORTAL_PREFIX}/v1/portalItem/updateItem`, 'PUT', query);
}
export async function _deleteTopic(query: any) {
  return await request(`${PORTAL_PREFIX}/v1/portalItem/deleteItem?id=${query.id}`, 'DELETE');
}

export async function _getMockDetail(query: any) {
  const { id } = query;
  return await request(`mocks/${id}`, 'GET');
}

// 查询模板
// http://192.168.192.132:3000/project/233/interface/api/29620
export async function _getTemplatesList(query: any) {
  return await request(`${PORTAL_PREFIX}/v1/portalTemplate/selectTemplates`, 'GET', query);
}

// http://192.168.192.132:3000/project/233/interface/api/29606
// 添加模板信息
export async function _addTemplate(query: any) {
  return await request(`${PORTAL_PREFIX}/v1/portalTemplate/addTemplate`, 'POST', query, { withFeedback: true });
}

// http://192.168.192.132:3000/project/233/interface/api/29627
// 修改模板信息
export async function _updateTemplate(query: any) {
  return await request(`${PORTAL_PREFIX}/v1/portalTemplate/updateTemplate`, 'PUT', query);
}

// http://192.168.192.132:3000/project/233/interface/api/29613
// 删除模板
export async function _deleteTemplate(query: any) {
  return await request(`${PORTAL_PREFIX}/v1/portalTemplate/deleteTemplate?id=${query.id}`, 'DELETE', query);
}

// http://192.168.192.132:3000/project/233/interface/api/29592
// 分页查询栏目根据页面位置
export async function _getTplConfigList(query: any) {
  const { site = [], ...rest } = query;
  return await request(`${PORTAL_PREFIX}/v1/portalItemConfig/selectItemConfigs`, 'GET', {
    ...rest,
    site: site.join(','),
  });
}
export async function _getSearchList(query: any) {
  const { site = [], ...rest } = query;
  return await request(`${PORTAL_PREFIX}/v1/portalItemConfig/searchItemConfigs`, 'GET', {
    ...rest,
  });
}

// http://192.168.192.132:3000/project/233/interface/api/29564
// 批量添加配置项配置信息
export async function _addItemConfig(query: any) {
  return await request(`${PORTAL_PREFIX}/v1/portalItemConfig/addItemConfig`, 'POST', query);
}

// http://192.168.192.132:3000/project/233/interface/api/29599
// 修改配置项信息
export async function _editItemConfig(query: any) {
  return await request(`${PORTAL_PREFIX}/v1/portalItemConfig/updateItemConfig`, 'PUT', query);
}

// http://192.168.192.132:3000/project/233/interface/api/29571
// 删除配置项信息
export async function _deleteItemConfig(query: any) {
  return await request(`${PORTAL_PREFIX}/v1/portalItemConfig/deleteItemConfig?id=${query.id}`, 'DELETE');
}

// http://192.168.192.132:3000/project/233/interface/api/33099
// 导入模板配置项
export async function _importTemplate(query: any) {
  return await request(`${PORTAL_PREFIX}/v1/portalTemplate/importTemplate`, 'POST', query);
}

// http://192.168.192.132:3000/project/233/interface/api/33092
// 导出模板配置项
export async function _exportTemplate(query: any) {
  return await request(`${PORTAL_PREFIX}/v1/portalTemplate/exportTemplate`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

// http://192.168.192.132:3000/project/233/interface/api/33736
// /v1/portalTemplate/deleteLogUrl
export async function _deleteLogUrl(query: any) {
  return await request(`${PORTAL_PREFIX}/v1/portalTemplate/deleteLogUrl?id=${query.id}`, 'DELETE', query);
}
