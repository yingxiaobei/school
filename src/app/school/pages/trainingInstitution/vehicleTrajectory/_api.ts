import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

interface IGetCarListParams extends IPaginationParams {
  licnum: string;
}

interface IGetVehicleTrajectoryParams {
  carid: string; // 教练车id
  signstarttime: string; // 签到开始时间
  signendtime: string; // 签到结束时间
}

// 查询车辆列表下拉框
// http://192.168.192.132:3000/project/183/interface/api/20919
export async function _getCarList(query: IGetCarListParams) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/pageListCar`, 'GET', query);
}

// 获取车辆轨迹
// http://192.168.192.132:3000/project/183/interface/api/17258
export async function _getVehicleTrajectory(query: IGetVehicleTrajectoryParams) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/getVehicleTrajectory`, 'GET', query);
}
