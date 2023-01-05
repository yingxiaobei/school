import { request } from 'services';
import {
  NOT_CORE_PREFIX,
  CORE_PREFIX,
  DATA_EXCHANGE_PREFIX,
  STATISTIC_PREFIX,
  USER_CENTER_PREFIX,
} from 'constants/env';

interface I_getFinalAssess extends IPaginationParams {
  carid?: string; // 车辆id
  checkstatus_jg?: string; // 监管审核状态
  checkstatus_jx?: string; // 驾校审核状态
  coa_idcard?: string; // 教练证件号码
  coachid?: string; // 教练id
  coachname?: string; // 教练姓名
  create_date_end?: string; // 上传时间结束
  create_date_start?: string; // 上传时间开始
  crstate?: string; // 电子教学日志状态
  iscyzg?: string; // 从业资格学时 9：全部 1：是
  licnum?: string; // 车牌号
  name?: string; // 学员姓名
  recnum?: string; // 电子教学日志编号
  signendtime_end?: string; // 签退时间结束
  signendtime_start?: string; // 签退时间开始
  signstarttime_end?: string; // 签到时间结束
  signstarttime_start?: string; // 签到时间开始
  stu_idcard?: string; // 学员证件号码
  stuid?: string; // 学员id
  stunum?: string; // 学员编号
  subjectcode?: string; // 课程部分
  traincode?: string; // 课程方式
  batchSetupFlag?: string; // 这个选填字段新加 目的在于过滤查询数据中系统自动审批但未上传的数据，这些数据可以批量审核
  isshare?: string; // 配比学时
}

// 电子教学日志分页列表
// http://192.168.192.132:3000/project/183/interface/api/17265
export async function _getFinalAssess(query: I_getFinalAssess) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/pageList`, 'GET', query);
}

interface TeachingRecord {
  checkstatus_jx: '0' | '1' | '2' | '9'; // 驾校初审状态 0:未初审 1:初审中 2:已初审 9:系统自动审批
  crstate: '0' | '1' | '2' | '3' | string; // 有效状态 0:待评判 1:整体有效 2:部分有效 3:整体无效
  checkstatus_jg: '0' | '1' | '2' | '3' | '4' | '5' | '6' | string; // 上传状态、监管状态 0:待上传 1:已上传 2:已初审 3:已复审 4:上传失败 5:上传中 6:日志上传中
  signstarttime: string; // 签到时间
  checkjg_stime: string; // 上传监管时间
  jg_check_validtime: string; // 监管侧审核有效学时
  jg_check_validmileage: string; // 审核有效里程
  reason: string; // 备注
  appealStatus: string; // 申诉状态 0：未申诉 1：待处理 2：已完成 3：驳回申诉
  appealReason: string; // 申诉原因
  checkjx_etime: string; // 初审时间
  checkjx_username: string; // 初审人员
  validtime_jx: string; // 初审有效学时
  validmileage_jx: string; // 初审有效里程
  msg_jx: string; // 审核意见
  recnum: string; // 电子教学日志编号
  coachname: string; // 教练姓名
  coa_idcard: string; // 教练证件号
  name: string; // 学员姓名
  stu_idcard: string; // 学员证件号
  subjectcode: string; // 培训部分 1:科目一 2:科目二 3:科目三 4:科目四
  traincode: string; // 课程方式 1:实操 2:课堂教学 3:模拟器教学 4:远程教学
  licnum: string; // 车牌号
  termcode: string; // 终端编号
  sourcetype: string; // 数据来源 0:本系统产生  1:老系统 2:第三方外部系统
  ins_name: string; // 培训机构
  create_date: string; // 采集时间
  iscyzg: string; // 从业资格学时 0：否，1：是
  isshare: string; // 配比学时
  signendtime: string; // 签退时间
  avevelocity: string; // 平均时速
  duration: string; // 训练时长
  movetotaltime: string; // 车动时长
  launchtotaltime: string; // 点火时长
  speed: string; // 停车时长
  speed5: string; // 速度≤5时长
  speed5up: string; // 速度＞5时长
  mileage: string; // 训练里程
  maxspeed: string; //  最高时速
}
/**
 * @desc 电子教学日志详情
 * @since unknown
 * {@link http://192.168.192.132:3000/project/183/interface/api/17244}
 */
export function _getDetails(query: { classid: string; signstarttime: string }) {
  return request<TeachingRecord>(`${NOT_CORE_PREFIX}/v1/studentClassrecord/getClassrecord`, 'GET', query);
}

// 分钟学时分页列表
// http://192.168.192.132:3000/project/183/interface/api/17279
export async function _getMinutes(query: {
  classid: string; // 电子教学日志id
  page: number;
  limit: number;
  signstarttime: string; // 签到开始时间
  // 是否有效
  crstate: string;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/trainingTimeMin/pageListTrainingTimeMin`, 'GET', query);
}

// 批量设置分钟学时为有效、无效
// http://192.168.192.132:3000/project/183/interface/api/11875
export async function _setMinState(
  query: {
    classid: string; // 电子教学日志主键
    crstate: string; // 有效还是无效
    msg_jx?: string; // 驾校侧说明（审核未通过原因
    signstarttime: string; // 签到时间
    subjectcode: string; // 培训部分
    trainids: string; // 分钟学时id，多个id以逗号分隔
  },
  customHeader: any,
) {
  return await request(`${NOT_CORE_PREFIX}/v1/trainingTimeMin/batchSetupTrainingTimeMinState`, 'POST', query, {
    withFeedback: true,
    customHeader: customHeader,
  });
}

// 获取培训照片详情
// http://192.168.192.132:3000/project/183/interface/api/18091
export async function _getTrainingPhotosDetail(query: {
  classid: string; // 电子教学日志id
  photoTypes?: string;
  signstarttime: string; // 签到开始时间
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/trainingTimeMin/getTrainingPhotosDetail`, 'GET', query);
}

// 电子教学日志上传
// http://192.168.192.132:3000/project/183/interface/api/18861
export async function _uploadLog(
  query: {
    classid: string; // 电子教学日志ID
    year: string; // 电子教学日志所属年份
    reqSource?: string; // 传 1 代表是 批量上传-确定上传按钮
    checkstatus_jg?: any; //监管审核状态
  },
  customHeader?: { withFeedback?: boolean },
) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/report`, 'POST', query, {
    withFeedback: true,
    ...customHeader,
  });
}

// 批量电子教学日志上传
// http://192.168.192.132:3000/project/183/interface/api/21017
export async function _uploadLogArr(query: {
  classids: any; // 电子教学日志ID
  year: string; // 电子教学日志所属年份
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/batchReport`, 'POST', query, { withFeedback: true });
}

// 设置电子教学日志有效无效-详情总审核
// http://192.168.192.132:3000/project/183/interface/api/11868
export async function _reviewLog(
  query: {
    classids: string; // 电子教学日志主键(因为改成支持多条，所有后端改成classids)
    crstate?: string; // 有效无效，1：有效；3：无效(整体无效)
    msg_jx?: string; // 驾校侧初审说明，无效时需提供此字段
    signstarttime: string; // 签到时间
  },
  customHeader?: { withFeedback?: boolean },
) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/setupClassrecordState`, 'POST', query, {
    withFeedback: true,
    ...customHeader,
  });
}

// 获取车辆轨迹
// http://192.168.192.132:3000/project/183/interface/api/17258
export async function _getVehicleTrajectory(query: {
  carid: string; // 教练车id
  signstarttime: string; // 签到开始时间
  signendtime: string; // 签到结束时间
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/getVehicleTrajectory`, 'GET', query);
}

//电子教学日志分页列表（所有）
//http://192.168.192.132:3000/project/183/interface/api/20135
export async function _getFinalAssessAll(query: { page: number; limit: number; stuid: string; subjectcode: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/pageListAll`, 'GET', query);
}

//查询教练员列表-下拉框
//http://192.168.192.132:3000/project/183/interface/api/18357
export async function _getCoachList(query: { coachname?: string; idcard?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageListCoach`, 'GET', query);
}

// 查询车辆列表下拉框
interface CarNum {
  text: string;
  value: string;
}
// http://192.168.192.132:3000/project/183/interface/api/20919
export async function _getCarList(query: { licnum?: string }) {
  return await request<CarNum[]>(`${NOT_CORE_PREFIX}/v1/schCar/listCar`, 'GET', query);
}

// 待上传电子教学日志分页列表
// http://192.168.192.132:3000/project/183/interface/api/21318
export async function _getWaitUpload(query: { signstarttime_start?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/pageListClassrecordCanBeUploaded`, 'GET', query);
}

//http://192.168.192.132:3000/project/193/interface/api/22613
//查询审核结果
export async function _getResult(query: { is?: string; sid?: string; subject?: string; signstarttime?: string }) {
  return await request(`${CORE_PREFIX}/v1/stuClassrecord/query/result`, 'GET', query);
}

// 分钟学时上传(省内至正补传)
// http://192.168.192.132:3000/project/203/interface/api/25679
export async function _getTrainningTimeMinPatch(query: {
  classid: string; // 电子教学日志ID
  uploadType?: string; // 上报类型 1：自动上报 2：应用中心要求上报 后端说不用传
  year: string; // 电子教学日志所属年份
}) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/jg/trainningTimeMinPatch`, 'POST', query);
}

// 培训过程拍摄图片信息接口(省内至正补传)
// http://192.168.192.132:3000/project/203/interface/api/25595
export async function _getJsImageupPatch(query: {
  classid: string; // 电子教学日志ID
  year: string; // 电子教学日志所属年份
}) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/jg/jsImageupPatch`, 'POST', query);
}

// 电子教学日志上报接口
// http://192.168.192.132:3000/project/203/interface/api/14899
export async function _getClassrecord(query: {
  classid: string; // 电子教学日志ID
  year: string; // 电子教学日志所属年份
  checkstatus_jg?: any; //监管审核状态
}) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/jg/classrecord`, 'POST', query);
}

// 重置电子教学日志编号
// http://192.168.192.132:3000/project/183/interface/api/32952
export async function _resetNumber(query: {
  classid: string; // 电子教学日志ID
  year: string; // 电子教学日志所属年份
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/resetRecnum`, 'POST', query, {
    withFeedback: true,
  });
}

// http://192.168.192.132:3000/project/183/interface/api/33148
export async function _selectPhoto(query: {
  poscode: string; // 设备编号
  starttime: string; // 签到开始时间
  endtime: string; // 签到结束时间
  classid: string; // 电子教学日志ID
  year: string; // 电子教学日志所属年份
}) {
  return await request(`${NOT_CORE_PREFIX}/deviceService/selectPhoto`, 'GET', query, {});
}

// 播放视频
// http://192.168.192.132:3000/project/183/interface/api/36614
export async function _playVideo(query: { id: string; carSchoolId: string }) {
  return await request(
    `${NOT_CORE_PREFIX}/v1/schTermVideo/playVideo`,
    'GET',
    { id: query.id },
    {
      customHeader: { carSchoolId: query.carSchoolId },
    },
  );
}

// 获取电子教学日志视频列表
// http://192.168.192.132:3000/project/183/interface/api/36599
export async function _getClassRecordList(query: { id: string; classid: string; signstarttime: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schTermVideo/classRecordList`, 'GET', query);
}

interface RecordList extends IPaginationParams {
  serviceName?: string; // 服务标识
  startLogTime?: string; // 查询开始时间
  endLogTime?: string; // 查询结束时间
}

// 服务交互日志管理接口
// http://192.168.192.132:3000/project/223/interface/api/21773
export function _getRecordList(query: RecordList) {
  return request<{ rows: LogRes[]; total: number }>(`${STATISTIC_PREFIX}/v1/dataexchange/record/page`, 'GET', query)!;
}

// 车、教练服务交互日志管理接口(新)
// http://192.168.192.132:3000/project/223/interface/api/51630
export function _getRecordListNew(query: {}) {
  return request<{ rows: LogRes[]; total: number }>(
    `${STATISTIC_PREFIX}/v1/dataexchange/record/pageNew`,
    'GET',
    query,
  )!;
}

// 查询服务错误日志分页数据
// http://192.168.192.132:3000/project/183/interface/api/51138
export async function _getRecordListLog(query: RecordList) {
  return await request(`${STATISTIC_PREFIX}/v1/serviceError/serviceErrorRecord/page`, 'GET', query);
}

interface IAppeal {
  appealReason: string; // 申诉原因
  recnum: string; // 电子教学日志编号
  sid: string; // 学员ID
  subject: string; // 培训部分
}

// 电子教学日志申诉
// http://192.168.192.132:3000/project/183/interface/api/38939
export async function _appeal(query: IAppeal) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/classrecordAppeal`, 'POST', query, {
    withFeedback: true,
  });
}

// 根据培训机构ID获取区域参数(电子教学日志规则)
// Note: 与接口文档的数据接口不符
interface Area {
  superviseComplainStatus: string;
  trainType: string;
}
// http://192.168.192.132:3000/project/198/interface/api/30243
export async function _appealArguments(query: { schoolId: string }) {
  return await request<Area[]>(`${USER_CENTER_PREFIX}/v1/region/common/trainTime/filterRule/list`, 'GET', query);
}

export interface EquipmentPhotoLog {
  db: string; // 驾校库编码
  id: string; // 主键
  classid: string; // 电子教学日志classid
  pid: string; // 照片编号(按设备终端产生的签到序号)
  licnum: string; // 车牌号
  poscode: string; // 终端编号
  commandType: number; // 命令类型。1:查询照片 2:获取照片
  requestcontent: string; // 发送内容
  responsecontent: string; // 返回内容
  sendTime: string; // 发送时间
  sendStatus: number; // 发送状态。0:待处理 1:发送中 2:发送失败 3:发送成功
  pullStatus: number; // 获取状态。0:待确认 1:无需获取 2:待获取 3:获取中 4:获取失败 5:获取成功
  crtTime: string; // 创建时间
  updateTime: string; // 更新时间
}
/**
 * @desc 获取设备照片交互日志
 * @since 1.0.67.0
 * {@link http://192.168.192.132:3000/project/183/interface/api/52020}
 */
export function _getSelectDevicePhotoLog(query: { classid: string; page: number; limit: number }) {
  return request<EquipmentPhotoLog>(`${NOT_CORE_PREFIX}/deviceService/getSelectDevicePhotoLog`, 'GET', query);
}

// 查看学员人脸模板
// http://192.168.192.132:3000/project/183/interface/api/17433
export async function _getStuMubanPic(query: { sid?: string; cid?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/stuFaceTemplate/view`, 'GET', query);
}

// 查看教练人脸模板
// http://192.168.192.132:3000/project/183/interface/api/17398
export async function _getCoMubanPic(query: { cid: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coaFaceTemplate/view`, 'GET', query);
}
