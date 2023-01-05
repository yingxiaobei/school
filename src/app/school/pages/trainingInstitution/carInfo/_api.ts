import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';
// 车辆信息查询
// http://192.168.192.132:3000/project/183/interface/api/11763
export async function _getCarList(query: { page: number; limit: number }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/pageList`, 'GET', query);
}

// 车牌颜色(1:蓝色, 2:黄色, 3:黑色, 4:白色, 5:绿色, 9:其他)
export enum PlateColor {
  BLUE = '1',
  YELLOW = '2',
  BLACK = '3',
  WHITE = '4',
  GREEN = '5',
  OTHER = '9',
}

// 状态(1-启用 2-停用 3-注销 4-转校 5-未审核,9-上锁)
export enum CarStatus {
  ENABLED = '1',
  DISABLED = '2',
  REVOKED = '3',
  TRANSFER = '4',
  NOT_APPROVED = '5',
  LOCKED = '6',
}

// 新增车辆
// http://192.168.192.132:3000/project/183/interface/api/16537
export async function _addCar(query: {
  brand: string; // 车辆品牌
  buydate: string; // 购买日期
  franum: string; // 车架号
  licnum: string; // 车辆牌号
  manufacture: string; // 生产厂家
  platecolor: PlateColor; // 车牌颜色(1:蓝色, 2:黄色, 3:黑色, 4:白色, 5:绿色, 9:其他)
  status?: CarStatus; // 状态(1-启用 2-停用 3-注销 4-转校 5-未审核,9-上锁)
  engnum?: string; // 发动机号
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/save`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'carInfo', elementId: 'trainingInstitution/carInfo:btn1' },
  });
}

// 编辑车辆信息
// http://192.168.192.132:3000/project/183/interface/api/16551
export async function _editCar(query: {
  brand: string; // 车辆品牌
  buydate: string; // 购买日期
  franum: string; // 车架号
  licnum: string; // 车辆牌号
  manufacture: string; // 生产厂家
  platecolor: PlateColor; // 车牌颜色(1:蓝色, 2:黄色, 3:黑色, 4:白色, 5:绿色, 9:其他)
  status?: CarStatus; // 状态(1-启用 2-停用 3-注销 4-转校 5-未审核,9-上锁)
  engnum?: string; // 发动机号
  isChange: string;
  carid: string; // 主键
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/updateByKey`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'carInfo', elementId: 'trainingInstitution/carInfo:btn3' },
  });
}

// 监管车辆信息删除
// http://192.168.192.132:3000/project/183/interface/api/18833
export async function _deleteCar(query: {
  carid: string; // 车辆id
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/recordDeleteCar`, 'DELETE', query, {
    withFeedback: true,
    customHeader: { menuId: 'carInfo', elementId: 'trainingInstitution/carInfo:btn7' },
  });
}

// 获取车辆信息详情
// http://192.168.192.132:3000/project/183/interface/api/11777
export async function _getCarInfo(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/selectByKey`, 'GET', query);
}

// 车辆信息备案
// http://192.168.192.132:3000/project/183/interface/api/16698
export async function _recordCar(query: { carid: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/recordCar`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'carInfo', elementId: 'trainingInstitution/carInfo:btn6' },
  });
}

// -------车辆技术等级评定开始---------------

// 车辆技术等级评定分页查询
// http://192.168.192.132:3000/project/183/interface/api/13128
export async function _getTechnologyRate(query: { page: number; limit: number; carid: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarTchlevel/pageList`, 'GET', query);
}

// 删除车辆技术等级评定
// http://192.168.192.132:3000/project/183/interface/api/11497
export async function _deleteTechnologyRate(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarTchlevel/deleteByKey`, 'DELETE', query);
}

// 新增车辆技术等级评定
// http://192.168.192.132:3000/project/183/interface/api/11511
export async function _addTechnologyRate(query: {
  techlevelcode: string; // 技术等级证书编号
  techlevel?: string; // 技术等级（1:一级 2:二级 3:三级）
  auditdate: string; // 评定日期YYYYMMDD
  auditenddate?: string; // 评定到期日期
  auditdept?: string; // 评定单位
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarTchlevel/save`, 'POST', query, { withFeedback: true });
}

// 编辑车辆技术等级评定
// http://192.168.192.132:3000/project/183/interface/api/11525
export async function _updateTechnologyRate(body: {
  techlevelcode: string; // 技术等级证书编号
  techlevel?: string; // 技术等级（1:一级 2:二级 3:三级）
  auditdate: string; // 评定日期YYYYMMDD
  auditenddate?: string; // 评定到期日期
  auditdept?: string; // 评定单位
  id?: string;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarTchlevel/updateByKey`, 'PUT', body);
}

// -------车辆技术等级评定结束---------------

// -----------------检测开始-------------------------

// 车辆检测信息分页查询
// http://192.168.192.132:3000/project/183/interface/api/15193
export async function _getDetect(query: { page: number; limit: number }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarDetection/pageList`, 'GET', query);
}

// 新增车辆检测信息
// http://192.168.192.132:3000/project/183/interface/api/15200
export async function _addDetect(query: {
  carid: string; // carid
  detectdate: string; // 检测日期YYYYMMDD
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarDetection/save`, 'POST', query, { withFeedback: true });
}

// 更新车辆检测信息
// http://192.168.192.132:3000/project/183/interface/api/15214
export async function _updateDetect(query: {
  carid: string; // carid
  detectdate: string; // 检测日期YYYYMMDD
  id: string;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarDetection/updateByKey`, 'PUT', query, { withFeedback: true });
}

// 删除车辆检测信息
// http://192.168.192.132:3000/project/183/interface/api/15186
export async function _deleteDetect(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarDetection/deleteByKey`, 'DELETE', query);
}

// ----------------------检测结束----------------------------

// ------------------二级维护记录开始-------------------------

// 分页展示信息列表
// http://192.168.192.132:3000/project/183/interface/api/15228
export async function _getProtect(query: { page: number; limit: number }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarServiceinfo/pageList`, 'GET', query);
}

// 新增车辆二级维护
// http://192.168.192.132:3000/project/183/interface/api/15235
export async function _addProtect(query: {
  carid: string; // carid
  starttime: string; // 维护开始日期YYYYMMDD
  endtime: string; // 维护结束日期YYYYMMDD
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarServiceinfo/save`, 'POST', query, { withFeedback: true });
}

// 更新车辆二级维护
// http://192.168.192.132:3000/project/183/interface/api/15249
export async function _updateProtect(query: {
  carid: string; // carid
  starttime: string; // 维护开始日期YYYYMMDD
  endtime: string; // 维护结束日期YYYYMMDD
  id: string;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarServiceinfo/updateByKey`, 'PUT', query, { withFeedback: true });
}

// 删除车辆二级维护
// http://192.168.192.132:3000/project/183/interface/api/15221
export async function _deleteProtect(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarServiceinfo/deleteByKey`, 'DELETE', query);
}

// -------二级维护记录结束---------------

// 车辆启用/停用
// http://192.168.192.132:3000/project/183/interface/api/16712
export async function _updateStatus(query: { carid: string; status: string }, customHeader: any) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/updateCarStatus`, 'PUT', query, {
    withFeedback: true,
    customHeader: customHeader,
  });
}

// 查询车辆备案审核结果（至正）
// http://192.168.192.132:3000/project/183/interface/api/23768
export async function _getResult(query: { carid: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/recordCoachReview`, 'GET', query, { withFeedback: true });
}

/*

--------------------------------机器人教练区域模块------------------------------------

*/

//获取机器人教练车辆模型列表
//http://192.168.192.132:3000/project/183/interface/api/24132
export async function _getRobotCoachModelList(query: { carType: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/listCarModelByCarType`, 'GET', query);
}

//获取机器人教练车辆模型
//http://192.168.192.132:3000/project/183/interface/api/24125
export async function _getRobotCoachModel(query: { carModelId: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/getCarModelDetailById`, 'GET', query);
}

//绑定车辆模型
//http://192.168.192.132:3000/project/183/interface/api/24118
export async function _updateRobotCoachModel(query: { carId: string; modelId: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/bindModel`, 'POST', query, {
    withFeedback: true,
  });
}

// 导出车辆Excel前查询
// http://192.168.192.132:3000/project/183/interface/api/31608
export async function _exportBefore(query: {
  licnum: string; // 车辆牌号
  status?: string; // 状态(1-启用 2-停用 3-注销 4-转校 5-未审核,9-上锁)
  perdritype?: string; // 培训车型 编码单选：A1,A2
  registered_flag?: string; // 监管平台备案标记-  0 :未备案，1: 备案审核中   2: 备案同意启用 3: 备案不同意启用  4：编辑后待重新备案
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/exportCarBefore`, 'GET', query);
}

// 导出车辆Excel
// http://192.168.192.132:3000/project/183/interface/api/31601
export async function _export(query: {
  licnum: string; // 车辆牌号
  status?: string; // 状态(1-启用 2-停用 3-注销 4-转校 5-未审核,9-上锁)
  perdritype?: string; // 培训车型 编码单选：A1,A2
  registered_flag?: string; // 监管平台备案标记-  0 :未备案，1: 备案审核中   2: 备案同意启用 3: 备案不同意启用  4：编辑后待重新备案
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/exportCar`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

interface IObdProps extends IPaginationParams {
  carid: string; // 车辆id
}
// obd审核记录
// http://192.168.192.132:3000/project/183/interface/api/36470
export async function _getObdList(query: IObdProps) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/pagelistObdStatusLog`, 'GET', query);
}

interface IReview {
  carid: string; // 车辆id
  obdauditstatus: string; // OBD审核状态(0-待审核；1-已审核)
  obdflag?: string; // 车辆有obd装置(1-有   0-没有)
}
// obd状态审核
// http://192.168.192.132:3000/project/183/interface/api/36476
export async function _getObdReview(query: IReview) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/updateObdByKey`, 'PUT', query);
}

// 恢复obd
// 请确认是否将改车辆OBD状态从无OBD调整为有OBD
export async function _updateObdFlagByKey(query: any) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/updateObdFlagByKey`, 'PUT', query);
}

// --------------------------------保险记录------------------------------------

export type InsuranceQuery = {
  carid: string;
  limit: string;
  page: string;
};

export type InsuranceDate = {
  insuranceDate: string; // 保险时间
  createtime: string; // 操作时间
  overinsuranceDate: string; // 过保时间
  insuranceFileUrl: string; // 附件
  id: string;
  updatetime: string;
  carid: string;
  createuserid: string; // 操作人
};

// http://192.168.192.132:3000/project/183/interface/api/39659
// 车辆保险信息列表
export async function _getInsuranceList(query: InsuranceQuery) {
  // TODO: 11-10 ZhenJiang
  return await request(`${NOT_CORE_PREFIX}/v1/schCarInsurance/pageList`, 'GET', query);
}

export type InsuranceAddOrEditQuery = {
  cardid: string;
  id: string;
  insuranceDate: string; // 保险时间
  insuranceFileOssId: string; // 附件地址ossid
  insuranceFileUrl: string; // 附件地址Url
  overinsuranceDate: string; // 过保时间
  [key: string]: string;
};

// http://192.168.192.132:3000/project/183/interface/api/39674
// 更新保险信息
export async function _updateInsurance(query: Partial<InsuranceAddOrEditQuery>) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarInsurance/updateByKey`, 'PUT', query);
}

// http://192.168.192.132:3000/project/183/interface/api/39664
// 新增车辆保险信息
export async function _addInsurance(query: Partial<InsuranceAddOrEditQuery>) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarInsurance/save`, 'POST', query);
}

// http://192.168.192.132:3000/project/183/interface/api/39654
// 删除车辆保险信息
export async function _deleteInsurance(id: string) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarInsurance/delete/${id}`, 'DELETE');
}

// http://192.168.192.132:3000/project/183/interface/api/39669
// 车辆保险详情
export async function _getInsuranceDetail(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarInsurance/selectByKey`, 'GET', query);
}

// 教练车切换浙里办
// http://192.168.192.132:3000/project/183/interface/api/40929
export async function _schCarChangeZLB(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/schCarChangeZLB`, 'PUT', query);
}

// 教练车同步接口
// http://192.168.192.132:3000/project/183/interface/api/43454
export async function _SyncCar(query: {}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/getCarVehicles`, 'GET', query, {
    withFailedFeedback: true,
    customHeader: { menuId: 'carInfo', elementId: 'trainingInstitution/carInfo:btn18' },
  });
}

// 查询车辆变更记录
interface CarChangeRecord extends IPaginationParams {
  carid: string;
}
// http://192.168.192.132:3000/project/183/interface/api/51624
export function _carPageListKeyinfoChange(query: CarChangeRecord) {
  return request<ChangeRecordRes>(`${NOT_CORE_PREFIX}/v1/schCar/carPageListKeyinfoChange`, 'GET', query);
}
