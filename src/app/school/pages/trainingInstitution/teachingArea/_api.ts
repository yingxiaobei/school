import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// 查询教学区域
// http://192.168.192.132:3000/project/183/interface/api/14794
export async function _getTeachingArea(query: {
  name?: string; // 教学区域名称
  registered_flag?: string; // 审核状态0 :未备案， 1:   备案审核中   2: 备案同意启用 3: 备案不同意启用 4：编辑后待重新备案
  page: number;
  limit: number;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schRegion/pageList`, 'GET', query);
}

// 查看详情 - 根据主键查询并返回数据实体对象
// http://192.168.192.132:3000/project/183/interface/api/14808
export async function _getDetails(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schRegion/selectByKey`, 'GET', query);
}

// 根据主键删除数据实体对象
// http://192.168.192.132:3000/project/183/interface/api/14787
export async function _deleteTeachingArea(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schRegion/deleteByKey`, 'DELETE', query, {
    customHeader: { menuId: 'teachingArea', elementId: 'trainingInstitution/teachingArea:btn4' },
  });
}

// 经营属性(00-自有；01-租用)
export enum OperateProperty {
  OWN = '00',
  HIRE = '01',
}

// 教学区域类型 1：场地 2：道路
export enum Type {
  SPACE = 1,
  ROAD = 2,
}

// 新增教学区域
// http://192.168.192.132:3000/project/183/interface/api/14801
export async function _addTeachingArea(query: {
  name?: string; // 教学区域名称
  curvehnum?: number; // 已投放车辆数
  area: string; // 教学区域面积 单位:m2
  type: Type; // 教学区域类型 1：场地 2：道路
  vehicletype: string; // 培训车型  编码可多选 A1,A2 等
  totalvehnum?: number; // 可容纳车辆数
  address: string; // 教学区域地址
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schRegion/save`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'teachingArea', elementId: 'trainingInstitution/teachingArea:btn1' },
  });
}

// 编辑教练信息
// http://192.168.192.132:3000/project/183/interface/api/16523
export async function _updateTeachingArea(query: {
  name?: string; // 教学区域名称
  curvehnum?: number; // 已投放车辆数
  area: string; // 教学区域面积 单位:m2
  type: Type; // 教学区域类型 1：场地 2：道路
  vehicletype: string; // 培训车型  编码可多选 A1,A2 等
  totalvehnum?: number; // 可容纳车辆数
  address: string; // 教学区域地址
  rid: string;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schRegion/updateByKey`, 'PUT', query, {
    customHeader: { menuId: 'teachingArea', elementId: 'trainingInstitution/teachingArea:btn3' },
  });
}

// 更改教学区域使用状态
// http://192.168.192.132:3000/project/183/interface/api/18245
export async function _updateState(query: {
  rid: string; // 区域主键
  state: string; // 使用状态(1-使用 0-禁用)
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schRegion/updateState`, 'PUT', query);
}

// 教学区域备案
// http://192.168.192.132:3000/project/183/interface/api/18826
export async function _record(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schRegion/recordRegion`, 'PUT', query, {
    customHeader: { menuId: 'teachingArea', elementId: 'trainingInstitution/teachingArea:btn5' },
  });
}

// 解除教学区域备案
// http://192.168.192.132:3000/project/183/interface/api/18819
export async function _dismissRecord(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schRegion/deleteRecordRegion`, 'DELETE', query, {
    customHeader: { menuId: 'teachingArea', elementId: 'trainingInstitution/teachingArea:btn6' },
  });
}

// 教学区域审核结果查询接口
// http://192.168.192.132:3000/project/183/interface/api/20520
export async function _getReviewResult(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schRegion/regionReview`, 'GET', query, { withFeedback: true });
}

//更改教学区域场地属性(训练状态)
//http://192.168.192.132:3000/project/183/interface/api/20793
export async function _updatePlacetype(query: { rid: string; placetype: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schRegion/updatePlacetype`, 'PUT', query);
}

//获取机器人教练场地信息列表
//http://192.168.192.132:3000/project/183/interface/api/24160
export async function _getRobotCoachPlaceList() {
  return await request(`${NOT_CORE_PREFIX}/v1/schRegion/listPlaceInfo`, 'GET');
}

//获取机器人教练场地信息详情
//http://192.168.192.132:3000/project/183/interface/api/24153
export async function _getRobotCoachPlace(query: { placeId: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schRegion/getPlaceInfoDetail`, 'GET', query);
}

//绑定机器人教练场地模型
//http://192.168.192.132:3000/project/183/interface/api/24146
export async function _updateRobotCoachPlace(query: { placeId: string; rid: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schRegion/bindRobotPlace`, 'POST', query, {
    withFeedback: true,
  });
}

// 导出教学区域Excel前查询
// http://192.168.192.132:3000/project/183/interface/api/31636
export async function _exportBefore(query: {
  name?: string; // 教学区域名称
  registered_flag?: string; // 审核状态0 :未备案， 1:   备案审核中   2: 备案同意启用 3: 备案不同意启用 4：编辑后待重新备案
  placetype?: string; // 训练状态(1;允许训练;0:禁止训练)
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schRegion/exportRegionBefore`, 'GET', query);
}

// 导出教学区域Excel
// http://192.168.192.132:3000/project/183/interface/api/31629
export async function _export(query: {
  name?: string; // 教学区域名称
  registered_flag?: string; // 审核状态0 :未备案， 1:   备案审核中   2: 备案同意启用 3: 备案不同意启用 4：编辑后待重新备案
  placetype?: string; // 训练状态(1;允许训练;0:禁止训练)
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schRegion/exportRegion`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

/**
 * @description 查询教学区域信息变更记录
 * {@link http://192.168.192.132:3000/project/183/interface/api/52860}
 * @since 1.0.69.0
 */
export function _regionPageListKeyinfoChange(query: { rid: string }) {
  return request<ChangeRecordRes>(`${NOT_CORE_PREFIX}/v1/schRegion/regionPageListKeyinfoChange`, 'GET', query);
}
