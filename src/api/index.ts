import { request } from 'services';
import { CORE_PREFIX, NOT_CORE_PREFIX, USER_CENTER_PREFIX, VIDEO_FACE, USER_CENTER_URL } from 'constants/env';
import { AES_ENCRYPT, Auth, _get } from 'utils';
import md5 from 'md5';

// 查询字典列表
// http://192.168.192.132:3000/project/193/interface/api/17307
interface IGetCode {
  codeType?: string;
  codeKey?: string;
  parentCodeKey?: string;
  pauseRequest?: boolean;
}

interface I_getTreeData extends IPaginationParams {
  pid: string; // 父级节点
  ptype: 'city' | 'area' | 'school' | 'car' | 'camera' | '-1'; // 节点类型    0-city  1-area   2-school   3-car  4-camera
  schoolType?: string; // 空或者0-维尔平台驾校,   3-维尔平台驾校 + 三方驾校,  1-三方驾校。
}

export async function _getCode(query: IGetCode) {
  const { pauseRequest, ...params } = query;
  if (pauseRequest) return;
  return await request<{ text: string; value: string }[]>(`${CORE_PREFIX}/v1/sysbase/code/get2`, 'GET', params);
}

// 获取驾校车型经营范围
// http://192.168.192.132:3000/project/193/interface/api/18343
export async function _getBusinessScope(query?: { customHeader?: any; coaTeachType?: string }) {
  const customHeader = _get(query, 'customHeader', {});
  const coaTeachType = _get(query, 'coaTeachType', '');
  return await request(
    `${CORE_PREFIX}/v1/sysbase/code/getSchoolBusiScopeCombo`,
    'GET',
    { coaTeachType },
    { customHeader },
  );
}

// 获取驾校报审 科目列表 combo
// http://192.168.192.132:3000/project/193/interface/api/19764
export async function _getSubjectApply() {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getSchoolSubjectApplyCombo`, 'GET');
}

// 获取驾校阶段 核实状态 combo
// http://192.168.192.132:3000/project/193/interface/api/19771
export async function _getApplyStatus() {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getSubjectApplyStatusCombo`, 'GET');
}
// 查看学员列表
// http://192.168.192.132:3000/project/193/interface/api/14143
export async function _getStudentList(
  query: { name?: string; idcard?: string; status?: string; stuschoolid?: any },
  customHeader?: any,
  isNotSimpleSelect?: boolean, // 保证除了搜索组件之外的不受影响
) {
  if (!isNotSimpleSelect) {
    // 搜索条件name小于2位时不发起请求
    if (!_get(query, 'idcard', '') && _get(query, 'name.length', 0) < 2) {
      return;
    }
    // 证件号小于5位不发起请求
    if (!_get(query, 'name', '') && _get(query, 'idcard.length', 0) < 5) {
      return;
    }
  }

  return await request(
    `${CORE_PREFIX}/v1/student/selectByNameOrIdCard`,
    'GET',
    {
      stuschoolid: _get(customHeader, 'customSchoolId') ? _get(customHeader, 'customSchoolId') : Auth.get('schoolId'),
      ...query,
      page: 1,
      limit: 100,
    },
    { customHeader },
  );
}

// 获取驾校可训课程范围combo
// http://192.168.192.132:3000/project/193/interface/api/21080
export async function _getCourse() {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getSchoolTrainClassCombo`, 'GET');
}

//查询所有关联主驾校（含当前驾校）
export async function _getSchoolList() {
  return await request(`${USER_CENTER_PREFIX}/v1/company/listAllMainCompany`, 'GET');
}

//查询营业网点绑定机构的下拉框接口，营业网点所属驾校+营业网点已绑驾
//http://192.168.192.132:3000/project/183/interface/api/21416
export async function _getSchoolCombo(query: { sbnid: any; traincode: any }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/getSchoolsByNetwork`, 'GET', query);
}

//查询教练员列表-下拉框
//http://192.168.192.132:3000/project/183/interface/api/18357
export async function _getCoachList(query: { coachname?: string; idcard?: string }, customHeader?: any) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageListCoach`, 'GET', query, { customHeader });
}

//上传图片
export async function _uploadImg(query: any) {
  return request(`/api/video-face/tmpFile/uploadImg`, 'POST', query, {
    customHeader: { 'Content-Type': 'multipart/form-data' },
  });
}

// 查询教练员、考核员、安全员审核结果
// http://192.168.192.132:3000/project/183/interface/api/23761
export async function _getCoachExamineResult(query: {
  id: string; // 人员id
}) {
  return await request(
    `${NOT_CORE_PREFIX}/v1/coa/recordCoachReview`,
    'GET',
    { type: '1', ...query }, //人员类型1:教练员2：考核员3：安全员
    { withFeedback: true },
  );
}

// 基于驾校经营范围获取业务类型
// http://192.168.192.132:3000/project/193/interface/api/23985
export async function _getBusinessType(query?: { customHeader?: any }) {
  const customHeader = _get(query, 'customHeader', {});
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getSchoolBusiTypeCombo`, 'GET', {}, { customHeader });
}

// 查询教学信息
// http://192.168.192.132:3000/project/198/interface/api/17692
export async function _getTeachInfo(query: {
  id: string; // 驾校id
}) {
  return await request(`${USER_CENTER_PREFIX}/v1/company/${query.id}/teachInfo`, 'GET', query);
}

// 查询基础信息
// http://192.168.192.132:3000/project/198/interface/api/17608
export async function _getBaseInfo(
  query: {
    id: string; // 驾校id
  },
  customHeader?: any,
) {
  return await request(`${USER_CENTER_PREFIX}/v1/company/${query.id}/basicInfo`, 'GET', query, { customHeader });
}

// http://192.168.192.132:3000/project/183/interface/api/25875
// 车辆监控树
export async function _getTreeData(query: I_getTreeData) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarMonitor/monitorTree`, 'GET', query);
}

// http://192.168.192.132:3000/project/183/interface/api/25882
// 监控树搜索关键字接口-支持 1-车牌； 2-驾校名称
export async function _getSearchText(query: {
  searchType: any; // 搜索类别  1-车牌； 2-驾校名称
  searchText: string; // 搜索关键字
  schoolType?: string; // 空或者0-维尔平台驾校,   3-维尔平台驾校 + 三方驾校,  1-三方驾校。
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCarMonitor/searchText`, 'GET', query);
}

// 查询培训机构图片
// http://192.168.192.132:3000/project/198/interface/api/17657
export async function _getImg(query: {
  id: string; // 驾校id
  permissionType?: number;
}) {
  return await request(`${USER_CENTER_PREFIX}/v1/company/${query.id}/imgs`, 'GET', query);
}

//添加培训机构图片
//http://192.168.192.132:3000/project/198/interface/api/17636
export async function _createImg(query: {
  id: any; // 驾校id
  tmpId: string;
  type?: string;
  permissionType?: number;
}) {
  return await request(
    `${USER_CENTER_PREFIX}/v1/company/${query.id}/createImg?permissionType=${query.permissionType}`,
    'POST',
    {
      tmpId: query.tmpId,
      type: query.type,
    },
  );
}

export async function _deleteImg(query: {
  id: any; // 驾校id
  tmpId: string;
  permissionType?: number;
}) {
  return await request(
    `${USER_CENTER_PREFIX}/v1/company/${query.id}/img/${query.tmpId}/delete?permissionType=${query.permissionType}`,
    'DELETE',
  );
}

// 电子教学日志分页列表
// http://192.168.192.132:3000/project/183/interface/api/17265
export async function _getFinalAssess(query: {
  page: number;
  limit: number;
  signstarttime_start: string;
  signstarttime_end: string;
  stuid: string;
  isTrainAnalysisQuery?: string;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/pageList`, 'GET', {
    isTrainAnalysisQuery: '0', //是否是学时分析查询 0：否 1：是"
    ...query,
  });
}

//根据培训机构ID获取自定义参数
//http://192.168.192.132:3000/project/198/interface/api/30138
export function _getCustomParam(query: any) {
  return request(`${USER_CENTER_PREFIX}/v1/region/common/param/custom`, 'GET', query);
}

export async function _getSysTime() {
  return request(`${CORE_PREFIX}/v1/sysbase/code/getSysTime`, 'GET');
}
export async function _getWallet() {
  return request(`${CORE_PREFIX}/v1/account/querySchoolAreadyOpenAccount`, 'GET', {});
}

// 查询学员信息列表
// http://192.168.192.132:3000/project/193/interface/api/12722
export async function _getStudentInfo(
  query: {
    page: number;
    limit: number;
    name?: string; // 学员姓名或拼音码
    idcard?: string; // 身份证件号码
    registered_Flag?: string; // 监管平台备案标记-  0 :未备案，1: 已备案
    status?: string; // 学员状态(00-报名 01-学驾中 02-退学 03-结业 04-注销 05-转校 99-归档)
    traintype?: string; // 培训车型   编码单选C1/C2等
    busitype?: string; // 业务类型 0:初领 1:增领 9:其他
    contractflag?: string; // 合同签订标志 0 未签订  1已签订
    applydatebegin?: string; // 报名起始日期
    applydateend?: string; // 报名结束日期
    sid?: string;
    trainTimeApplyTimeBegin?: string; // 申报申请日期开始 yyyy-MM-dd
    trainTimeApplyTimeEnd?: string; // 申报申请日期结束 yyyy-MM-dd
    trainTimeApplyStatus?: string; // 转入学员申报状态   0-待申请  ；1-待审核   2-审核通过  3-审核未通过
  },
  customHeader: any,
) {
  const token = 'bearer' + Auth.get('token');
  const header = AES_ENCRYPT(md5(token)); //加密header,防爬虫
  const res = await _getSysTime();

  return await request(`${CORE_PREFIX}/v1/student/pageList`, 'GET', query, {
    customHeader: { ...customHeader, [header]: AES_ENCRYPT(String(_get(res, 'data', ''))) },
  });
}

// 获取灰度版本
export function _getVersion(customHeader: any) {
  return request(`${CORE_PREFIX}/v1/sysbase/getPlatformVersionBySchoolId`, 'GET', {}, { customHeader });
}

// 系统公告-驾校消息查询
export function _getMessageList(query: any) {
  return request(`${VIDEO_FACE}/v1/message/push/school/list`, 'GET', query);
}

// 系统公告-消息已读或未读，驾校只用到已读
export function _messageRead(query: any) {
  return request(`${VIDEO_FACE}/v1/message/push/app/read`, 'PUT', query, {
    customHeader: { withFeedbackAll: false },
  });
}

// 系统公告-查询单条消息详情
export function _getMessageDetail(id: any) {
  return request(`${VIDEO_FACE}/v1/message/push/detail/${id}`, 'GET');
}

// 系统公告-批量删除
// http://192.168.192.132:3000/project/228/interface/api/43264
export function _deleteMessage(query: any) {
  return request(`${VIDEO_FACE}/v1/message/push/app/delete`, 'DELETE', query);
}

// 系统通知-列表
export function _getSchMsgList(query: any) {
  return request(`${NOT_CORE_PREFIX}/v1/schMsg/pageList`, 'GET', query);
}

// 系统通知-批量删除
export function _batchDeleteByKey(query: any) {
  return request(`${NOT_CORE_PREFIX}/v1/schMsg/batchDeleteByKey`, 'DELETE', query);
}

// 系统通知-批量已读更新
export function _batchUpdateByKey(query: any) {
  return request(`${NOT_CORE_PREFIX}/v1/schMsg/batchUpdateByKey`, 'PUT', query, {
    customHeader: { withFeedbackAll: false },
  });
}

//清理设备缓存
// http://192.168.192.132:3000/project/193/interface/api/49740
export async function _clearDeviceCache(query: {
  clearType: string;
  sid?: string;
  stunum?: string;
  coachNum?: string;
  licnum?: string;
}) {
  // 0学员 1教练 2设备
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/clearDeviceCache`, 'POST', query, {
    customHeader: { withFeedback: true },
  });
}
// 获取手机验证码
// http://192.168.192.132:3000/project/183/interface/api/51642
export async function sendSMS(query: { mobilePhone: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/sms/code`, 'GET', query);
}
// 获取手机验证码2
// http://192.168.192.132:3000/project/183/interface/api/51642
export async function sendSMS2(query: { mobilePhone: string }) {
  return await request(`${USER_CENTER_PREFIX}/user/sms/code`, 'GET', query);
}
