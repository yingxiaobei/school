import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

interface IGrtList extends IPagination {
  className?: string;
  startDate?: string;
}

// 分页展示已开班学员列表
// http://192.168.192.132:3000/project/193/interface/api/28864
export async function _getList(query: IGrtList) {
  return await request(`${CORE_PREFIX}/v1/stuStudentClass/pageList`, 'GET', query);
}
interface IReview {
  sid: string; // 学员主键
  auditStatus: string; // 审核状态
}

// 理科中心审核接口
// http://192.168.192.132:3000/project/193/interface/api/28892
export async function _getReview(query: IReview) {
  return await request(`${CORE_PREFIX}/v1/stuStudentClass/updateByKey`, 'PUT', query, {
    withFeedbackAll: false,
  });
}

interface IGetResult {
  sid: string;
}

// 获取备案审核结果
// http://192.168.192.132:3000/project/193/interface/api/29333
export async function _getClassRegisterResult(query: IGetResult) {
  return await request(`${CORE_PREFIX}/v1/stuStudentClass/getClassRegisterResult`, 'GET', query, {
    withFeedback: true,
  });
}

interface IClassRegister {
  sids: string[];
}

// 开班备案
// http://192.168.192.132:3000/project/193/interface/api/29340
export async function _getStudentClassRegister(query: IClassRegister) {
  return await request(`${CORE_PREFIX}/v1/stuStudentClass/studentClassRegister`, 'POST', query, {
    withFeedback: false,
  });
}

// 分页展示班次列表(班次管理按钮弹框打开列表数据)
// http://192.168.192.132:3000/project/193/interface/api/28976
export async function _getClassList(query: IGrtList) {
  return await request(`${CORE_PREFIX}/v1/schClassInfo/pageList`, 'GET', query);
}

interface IGetDetails {
  id: string;
}

// 根据主键查询并返回数据实体对象
// http://192.168.192.132:3000/project/193/interface/api/28997
export async function _getClassDetail(query: IGetDetails) {
  return await request(`${CORE_PREFIX}/v1/schClassInfo/selectByKey`, 'GET', query);
}

interface IAddClass {
  classFrequency: string; // 班次
  className: string; // 开班名称
  startDate: string; // 开班日期
  totalNum: number; // 总人数
  isEffective: string; // 是否有效 0：无效 1有效
  memo: string; // 备注
}

// 新增班次
// http://192.168.192.132:3000/project/193/interface/api/28990
export async function _addClass(query: IAddClass) {
  return await request(`${CORE_PREFIX}/v1/schClassInfo/save`, 'POST', query, {
    withFeedback: true,
  });
}

interface IEditClass {
  classId: string; // 开班主键
  classFrequency: string; // 班次
  className: string; // 开班名称
  startDate: string; // 开班日期
  totalNum: number; // 总人数
  isEffective: string; // 是否有效 0：无效 1有效
  memo: string; // 备注
}

// 编辑班次
// http://192.168.192.132:3000/project/193/interface/api/28990
export async function _editClass(query: IEditClass) {
  return await request(`${CORE_PREFIX}/v1/schClassInfo/updateByKey`, 'PUT', query, {
    withFeedback: true,
  });
}

interface IGetNotOpenClass extends IPagination {
  name?: string; // 学员姓名
  idcard?: string; //身份证号
  applyDateBegin?: string; // 报名日期起始
  applyDateEnd?: string; // applyD报名日期截止
  studenttype?: any; //学员类型 0:正常学员 1:转入学员  2:大货从业资格
}

// 分页展示未开班学员列表
// http://192.168.192.132:3000/project/193/interface/api/28871
export async function _getNotOpenClass(query: IGetNotOpenClass) {
  const { studenttype = [], ...rest } = query;
  return await request(`${CORE_PREFIX}/v1/stuStudentClass/pageListStudent`, 'GET', {
    ...rest,
    studenttype: studenttype.join(','),
  });
}

interface IGetClass extends IPagination {
  year: string;
}
// 分页展示可选择班次列表
// http://192.168.192.132:3000/project/193/interface/api/28983
export async function _getChooseClass(query: IGetClass) {
  return await request(`${CORE_PREFIX}/v1/schClassInfo/pageListSchClassInfo`, 'GET', query);
}

interface IOpenClass {
  sids: string[]; // sids 学员sid
  classId: string; // classId 班级id
}
// 开班接口
// http://192.168.192.132:3000/project/193/interface/api/28878
export async function _openClass(query: IOpenClass) {
  return await request(`${CORE_PREFIX}/v1/stuStudentClass/save`, 'POST', query, { withFeedback: true });
}

//开班管理导出
// http://192.168.192.132:3000/project/193/interface/api/47154
export async function _stuClassExportBefore(query: any) {
  return await request(`${CORE_PREFIX}/v1/stuStudentClass/export/stuStudentClassBefore`, 'GET', query);
}

//开班管理导出
// http://192.168.192.132:3000/project/193/interface/api/47154
export async function _stuClassExport(query: any) {
  return await request(`${CORE_PREFIX}/v1/stuStudentClass/export/stuStudentClass`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}
