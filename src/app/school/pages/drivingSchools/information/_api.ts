import { DRIVING_SHOW } from 'constants/env';
import { request } from 'services';

type IsOpen = 0 | 1;

// Note: bannerImg(详情中是url 但是新增或者编辑中是传id的)

export type Infrastructure = {
  canteen: IsOpen;
  freeNet: IsOpen;
  shop: IsOpen;
  locker: IsOpen;
  internetBar: IsOpen;
  cofferShop: IsOpen;
  bathroom: IsOpen;
  restArea: IsOpen;
};

export type BaseInfo = {
  name: string;
  shotName: string;
  recordStatus: 0 | 1 | number; // 备案状态：0未备案，1已备案
  address: string;
  totalCoachCnt: number; // 教练员总数
  totalCoachArea: number; // 教练场总面积
  totalCoachCar: number; // 教练车总数
  description: string;
  bannerImg: string;
  bannerImgUrl: string;
  isShare: number;
  isMineDisplay: number;
  facilityInfo: Partial<Infrastructure>;
};

// 查询驾校基本信息
// http://192.168.192.132:3000/project/291/interface/api/47466
export const _getSchoolDetail = async () => {
  return await request(`${DRIVING_SHOW}/v1/fission/sch/querySchoolDetail`, 'GET');
};

// 编辑驾校基本信息
// http://192.168.192.132:3000/project/291/interface/api/47478
export const _updateSchoolDetail = async (
  query: Partial<Omit<BaseInfo, 'shotName' | 'isShare' | 'isMineDisplay' | 'recordStatus'>>,
) => {
  return await request(`${DRIVING_SHOW}/v1/fission/sch/updateSchool`, 'PUT', query);
};

// 展示（或隐藏）驾校分享入口
// http://192.168.192.132:3000/project/291/interface/api/47628
export const _changeIsPlayShare = async (query: { isShare: number }) => {
  return await request(`${DRIVING_SHOW}/v1/fission/sch/displayShare`, 'PUT', query);
};

// 展示（或隐藏）我的驾校入口
// http://192.168.192.132:3000/project/291/interface/api/47628
export const _changeIsDisplayMine = async (query: { isMineDisplay: number }) => {
  return await request(`${DRIVING_SHOW}/v1/fission/sch/displayMine`, 'PUT', query);
};

export type ClassesForAPP = {
  readonly id: string;
  name: string;
  carType: string;
  trainFee: number; // APP展示培训费
  tags: string[];
  isDisplay: 0 | 1 | number;
};

export type LocationForApp = {
  readonly id: string;
  name: string;
  bannerImg: string;
  bannerImgUrl: string;
  type: 2 | 3; // 场地类型：2 科目二 3 科目三
  address: string;
  isDisplay: 0 | 1 | number;
};

// APP上展示班级
// http://192.168.192.132:3000/project/291/interface/api/47484
export const _getSchoolClassesForAPP = async () => {
  return await request(`${DRIVING_SHOW}/v1/fission/sch/class/queryList`, 'GET');
};

// APP上班级新增
// http://192.168.192.132:3000/project/291/interface/api/47502
export const _addSchoolClassForAPP = async (query: Omit<ClassesForAPP, 'id' | 'isDisplay'>) => {
  return await request(`${DRIVING_SHOW}/v1/fission/sch/class/save`, 'POST', query);
};

// APP上班级编辑
// http://192.168.192.132:3000/project/291/interface/api/47508
export const _updateSchoolClassForAPP = async (query: { id: string; current: ClassesForAPP }) => {
  return await request(`${DRIVING_SHOW}/v1/fission/sch/class/update/${query.id}`, 'PUT', query.current);
};

// APP上班级删除
// http://192.168.192.132:3000/project/291/interface/api/47514
export const _delSchoolClassForAppById = async (query: { id: string }) => {
  return await request(`${DRIVING_SHOW}/v1/fission/sch/class/delete/${query.id}`, 'DELETE');
};

// 线上展示（或隐藏）驾校班型
// http://192.168.192.132:3000/project/291/interface/api/47520
export const _changeSchoolClassStatusForAppById = async (query: {
  id: string;
  body: Pick<ClassesForAPP, 'isDisplay'>;
}) => {
  return await request(`${DRIVING_SHOW}/v1/fission/sch/class/display/${query.id}`, 'PUT', query.body);
};

// APP上展示场地
// http://192.168.192.132:3000/project/291/interface/api/47490
export const _getSchoolLocationsForAPP = async () => {
  return await request(`${DRIVING_SHOW}/v1/fission/sch/site/queryList`, 'GET');
};

// 删除场地
// http://192.168.192.132:3000/project/291/interface/api/47538
export const _delLocationForAppById = async (query: { id: string }) => {
  return await request(`${DRIVING_SHOW}/v1/fission/sch/site/delete/${query.id}`, 'DELETE');
};

// 场地新增
// http://192.168.192.132:3000/project/291/interface/api/47526
export const _addLocationForAPP = async (query: Omit<LocationForApp, 'id' | 'isDisplay'>) => {
  return await request(`${DRIVING_SHOW}/v1/fission/sch/site/save`, 'POST', query);
};

// 场地编辑
// http://192.168.192.132:3000/project/291/interface/api/47508
export const _updateLocationForAPP = async (query: { id: string; current: LocationForApp }) => {
  return await request(`${DRIVING_SHOW}/v1/fission/sch/site/update/${query.id}`, 'PUT', query.current);
};

// 线上展示（或隐藏）驾校场地
// http://192.168.192.132:3000/project/291/interface/api/47544
export const _changeLocationStatusForAppById = async (query: {
  id: string;
  body: Pick<LocationForApp, 'isDisplay'>;
}) => {
  return await request(`${DRIVING_SHOW}/v1/fission/sch/site/display/${query.id}`, 'PUT', query.body);
};
