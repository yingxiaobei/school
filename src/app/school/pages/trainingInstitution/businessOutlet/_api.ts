import { request } from 'services';
import { NOT_CORE_PREFIX, USER_CENTER_PREFIX } from 'constants/env';

// 查询营业网点信息
// http://192.168.192.132:3000/project/183/interface/api/14325
export async function _getBusinessOutlet(query: {
  branchname?: string; // 网点名称
  page: number;
  limit: number;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/pageList`, 'GET', query);
}

// 查看详情 - 根据主键查询并返回数据实体对象
// http://192.168.192.132:3000/project/183/interface/api/14339
export async function _details(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/selectByKey`, 'GET', query);
}

// 根据主键删除数据实体对象
// http://192.168.192.132:3000/project/183/interface/api/14318
export async function _deleteBusinessOutlet(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/deleteByKey`, 'DELETE', query, {
    customHeader: { menuId: 'businessOutlet', elementId: 'trainingInstitution/businessOutlet:btn8' },
  });
}

// 新增营业网点
// http://192.168.192.132:3000/project/183/interface/api/14332
export async function _addBusinessOutlet(query: {
  branchname: string;
  shortname: string;
  contact?: string;
  phone: string;
  address: string;
  orgIds: any;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/save`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'businessOutlet', elementId: 'trainingInstitution/businessOutlet:btn1' },
  });
}

// 根据主键修改数据实体对象-编辑
// http://192.168.192.132:3000/project/183/interface/api/14346
export async function _updateBusinessOutlet(query: {
  branchname: string;
  shortname: string;
  contact?: string;
  phone: string;
  address: string;
  sbnid: string;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/updateByKey`, 'PUT', query, {
    customHeader: { menuId: 'businessOutlet', elementId: 'trainingInstitution/businessOutlet:btn3' },
  });
}

// 分页查询已预赋权课堂理论/模拟教学驾校列表
// http://192.168.192.132:3000/project/183/interface/api/16397
export async function _configSchoolPage(query: {
  page: number;
  limit: number;
  sbnid: string; // 营业网点表主键
  traincode: string; // 培训课程方式码 1-实操，2-课堂教学，3-模拟器教学，4-远程教学
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/pageSelectedAssociatedCompany`, 'GET', query);
}

// 查询可预赋权课堂理论/模拟教学驾校列表-配置驾校
// http://192.168.192.132:3000/project/183/interface/api/16383
export async function _configSchool(query: {
  sbnid: string; // 营业网点表主键
  traincode: string; // 培训课程方式码 1-实操，2-课堂教学，3-模拟器教学，4-远程教学
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/associatedCompany`, 'GET', query);
}

// 保存预赋权课堂理论/模拟教学驾校列表
// http://192.168.192.132:3000/project/183/interface/api/16404
export async function _addConfigSchool(query: {
  traincode: string; // 培训课程方式码 1-实操，2-课堂教学，3-模拟器教学，4-远程教学
  sbnid?: string; // 营业网点表主键
  associatedCompanyDtos?: object; // 预约驾校主键
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/saveCompany`, 'POST', query, { withFeedback: true });
}

// 删除预赋权驾校
// http://192.168.192.132:3000/project/183/interface/api/16390
export async function _deleteCompany(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/deleteCompany`, 'DELETE', query);
}

// 查询教室列表
// http://192.168.192.132:3000/project/183/interface/api/19694
export async function _getClassList(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/getClassroomList`, 'GET', query);
}

// 删除教室
// http://192.168.192.132:3000/project/183/interface/api/19687
export async function _deleteClassRoom(query: { classid: string; sbnid: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/deleteClassroomByKey`, 'DELETE', query);
}

// 新增教室
// http://192.168.192.132:3000/project/183/interface/api/19736
export async function _addClassRoom(query: {
  sbnid: string; // sch_branch_network营业网点表主键
  classroom: string; // 教室号
  seatnum: string; // 座位数
  traincode: string; // 可培训类型
  remark: string; // 备注
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/saveClassroom`, 'POST', query, { withFeedback: true });
}

// 编辑教室
// http://192.168.192.132:3000/project/183/interface/api/19757
export async function _updateClassRoom(query: {
  classid: string;
  sbnid: string; // sch_branch_network营业网点表主键
  classroom: string; // 教室号
  seatnum: string; // 座位数
  traincode: string; // 可培训类型
  remark: string; // 备注
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/updateClassroomByKey`, 'PUT', query);
}

// 待选教练员列表
// http://192.168.192.132:3000/project/183/interface/api/19722
export async function _getCoachList(query: {
  limit: string;
  page: string;
  idcard: string; // 身份证号
  coachname: string; //  姓名
  coachnum: string; // 统一编码
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/pageListCoaCoach`, 'GET', query);
}

// 保存配置教练
// http://192.168.192.132:3000/project/183/interface/api/19743
export async function _saveCoachList(query: {
  coaCoachDtos: any; // 已选择教练员
  sbnid: string; // 营业网点id
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/saveCoaCoach`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'businessOutlet', elementId: 'trainingInstitution/businessOutlet:btn6' },
  });
}

// 已选教练员列表
// /v1/schBranchNetwork/getListCoaCoach
export async function _selectedCoach(query: { sbnid: any }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/getListCoaCoach`, 'GET', query);
}

// 查询驾校下拉选项
// http://192.168.192.132:3000/project/183/interface/api/19715
export async function _getSchoolList() {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/getSchoolList`, 'GET');
}

// 可配置车辆列表查询
// http://192.168.192.132:3000/project/183/interface/api/19729
interface I_getCoachCarList extends IPaginationParams {
  franum: string; // 车架号
  licnum: string; //  车牌号
  carnum: string; // 统一编码
}
export async function _getCoachCarList(query: I_getCoachCarList) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/pageListSchCar`, 'GET', query);
}

// 保存配置车辆
// http://192.168.192.132:3000/project/183/interface/api/19750
export async function _saveCoachCarList(query: {
  carids: any; // 车辆carid
  sbnid: string; // 营业网点id
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/saveSchCar`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'businessOutlet', elementId: 'trainingInstitution/businessOutlet:btn7' },
  });
}

// 已配置车辆列表
// http://192.168.192.132:3000/project/183/interface/api/19708
export async function _selectedCoachCar(query: { sbnid: any }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/getListSchCar`, 'GET', query);
}

// 查询可预赋权课堂理论/模拟教学驾校列表
// http://192.168.192.132:3000/project/183/interface/api/16383
interface I_getSchoolPageList extends IPaginationParams {
  sbnid: any;
  traincode: string; //1-实操，2-课堂理论教学，3-模拟教学，4-远程教学
  leaderPhone: string; // 联系电话
  name: string; // 驾校全称
  shortName: string; // 驾校简称
}
export async function _getSchoolPageList(query: I_getSchoolPageList) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/associatedCompany`, 'GET', query);
}

// 分页查询已预赋权课堂理论/模拟教学驾校列表
// http://192.168.192.132:3000/project/183/interface/api/16397
export async function _selectedSchoolPageList(query: {
  sbnid: any;
  traincode: string; //2：课堂理论  4：模拟
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/pageSelectedAssociatedCompany`, 'GET', query);
}

// 保存预赋权课堂理论/模拟教学驾校列表
// http://192.168.192.132:3000/project/183/interface/api/16397
export async function _saveSchool(query: {
  associatedCompanyDtos: any;
  sbnid: string;
  traincode: string; //培训课程方式码1-实操，2-课堂理论教学，3-模拟教学，4-远程教学
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/saveCompany`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'businessOutlet', elementId: 'trainingInstitution/businessOutlet:btn4' },
  });
}

// 获取当前用户所属组织列表
// http://192.168.192.132:3000/project/198/interface/api/19778
export async function _getTreeByLoginUser() {
  return await request(`${USER_CENTER_PREFIX}/v1/org/treeByLoginUser`, 'GET');
}

// 查询教学信息
// http://192.168.192.132:3000/project/198/interface/api/17692
export async function _getTeachInfo(query: {
  id: string; // 驾校id
}) {
  return await request(`${USER_CENTER_PREFIX}/v1/company/${query.id}/teachInfo`, 'GET', query);
}
