import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// 监控列表
// http://192.168.192.132:3000/project/183/interface/api/24916
export async function _getCarList() {
  return await request(`${NOT_CORE_PREFIX}/v1/nvrSetup/listMonitor`, 'GET');
}

// 获取机器人教练车辆模型列表
// http://192.168.192.132:3000/project/183/interface/api/24132
export async function _getRobotCoachModelList(query: { carType: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/listCarModelByCarType`, 'GET', query);
}

// 获取机器人教练场地信息列表
// http://192.168.192.132:3000/project/183/interface/api/24160
export async function _getRobotCoachPlaceList() {
  return await request(`${NOT_CORE_PREFIX}/v1/schRegion/listPlaceInfo`, 'GET');
}

// 获取机器人教练场地信息详情
// http://192.168.192.132:3000/project/183/interface/api/24153
export async function _getRobotCoachPlace(query: { placeId: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schRegion/getPlaceInfoDetail`, 'GET', query);
}
