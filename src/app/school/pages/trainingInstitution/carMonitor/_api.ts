import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

interface IGetCarListParams extends IPaginationParams {
  licnum: string;
}

interface IGetPhotoListParams extends IPaginationParams {
  carid: string; // 车辆编码
  date: string; // 查询日期YYYY-MM-DD
  stime: string; // 	开始时间HH-MI-SS
  etime: string; // 结束时间HH-MI-SS
  phototype?: string; // 图片类型   0-全部
}

// 分页返回在线与非在线车牌号节点信息，优先返回在线车辆
// http://192.168.192.132:3000/project/183/interface/api/24230
export async function _getCarList(query: IGetCarListParams) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarMonitor/pageListSchCarLicnum`, 'GET', query);
}

// 返回车辆的最近点位详细培训信息，最多一次查询10个车辆
// http://192.168.192.132:3000/project/183/interface/api/24237
export async function _getCarDetails(query: { carids: any }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarMonitor/getGpsCarInfoByCarids`, 'GET', query);
}

// 分页返回指定车辆指定时间范围内的照片列表
// http://192.168.192.132:3000/project/183/interface/api/24258
export async function _getPhotoList(query: IGetPhotoListParams) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarMonitor/pageListPhoteByCar`, 'GET', query);
}

// 获取车辆对应终端编号
// http://192.168.192.132:3000/project/193/interface/api/43349
export async function _getPoscode(query: { carid: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarMonitor/car-poscode`, 'GET', query);
}

// 立即拍照
// http://192.168.192.132:3000/project/193/interface/api/43369
export async function _getPhotograph(query: { poscode: string }) {
  return await request(`${NOT_CORE_PREFIX}/deviceService/photograph`, 'POST', query);
}
