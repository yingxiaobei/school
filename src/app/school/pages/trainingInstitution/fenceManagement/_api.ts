import { request } from 'services';
import { NOT_CORE_PREFIX, PUBLIC_URL } from 'constants/env';

function getVersion() {
  return window.location.pathname === `${PUBLIC_URL}fenceManagementNew` ? '/v2' : '/v1';
}

function getType() {
  return window.location.pathname === `${PUBLIC_URL}fenceManagementNew` ? 'new' : '';
}

// 分页展示电子围栏信息列表
// http://192.168.192.132:3000/project/183/interface/api/18273
export async function _getInfo(query: {
  type: '0' | '1' | '2'; // type 0：全部 1：通用 2：车辆特定
  page: number;
  limit: number;
  licnum?: string; // licnum 车牌号
  regionseq?: string; // regionseq 区域编号
}) {
  return await request(`${NOT_CORE_PREFIX}${getVersion()}/schElectronfence/pageList`, 'GET', query);
}

// 获取版本记录列表
// http://192.168.192.132:3000/project/183/interface/api/18266
export async function _getVersionList(query: {
  carid: string; // carid 车辆主键
  type: string; // 1：驾校通用版本2：车辆特定版本
}) {
  return await request(`${NOT_CORE_PREFIX}${getVersion()}/schElectronfence/getVersionRecode`, 'GET', query);
}

// 教学区域下拉列表
// http://192.168.192.132:3000/project/183/interface/api/18259
export async function _getTeachAreaList() {
  return await request(`${NOT_CORE_PREFIX}${getVersion()}/schElectronfence/getSchRegionList`, 'GET');
}

// 分页展示可选场地信息
// http://192.168.192.132:3000/project/183/interface/api/18280
export async function _getPlaceList(query: {
  page: number;
  limit: number;
  name?: string; // 场地名称
}) {
  return await request(`${NOT_CORE_PREFIX}${getVersion()}/schElectronfence/pageListSchRegion`, 'GET', query);
}

// 新增教学区域电子围栏版本
// http://192.168.192.132:3000/project/183/interface/api/18287
export async function _addVersion(query: {
  carid: string;
  rids: any; // 场地id
  type?: string; // 对象类型 1：通用 2：车辆特定
}) {
  return await request(`${NOT_CORE_PREFIX}${getVersion()}/schElectronfence/save`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'fenceManagement', elementId: `trainingInstitution/fenceManagement${getType()}:btn2` },
  });
}

// 注销教学区域电子围栏版本
// http://192.168.192.132:3000/project/183/interface/api/18301
export async function _deleteVersion(query: { fid: string }) {
  return await request(`${NOT_CORE_PREFIX}${getVersion()}/schElectronfence/updateByKey`, 'PUT', query, {
    withFeedback: true,
  });
}

// 根据主键查询电子围栏版本信息
// http://192.168.192.132:3000/project/183/interface/api/18294
interface I_getVersionDetail extends IPaginationParams {
  fid: string;
}
export async function _getVersionDetail(query: I_getVersionDetail) {
  return await request(`${NOT_CORE_PREFIX}${getVersion()}/schElectronfence/selectByKey`, 'GET', query);
}
