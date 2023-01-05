import { request } from 'services';
import { CORE_PREFIX, NOT_CORE_PREFIX } from 'constants/env';
import { Auth } from 'utils';

// 删除排课信息
// http://192.168.192.132:3000/project/193/interface/api/17034
export async function _deleteSchedule(query: any) {
  return await request(`${CORE_PREFIX}/v1/schedule/delete`, 'DELETE', query);
}

// 获取排班信息
// http://192.168.192.132:3000/project/193/interface/api/20128
export async function _getScheduleCategory(query: { traincode: string }) {
  return await request(`${CORE_PREFIX}/v1/schedule/query/category`, 'GET', query);
}

// 学员约课
// http://192.168.192.132:3000/project/193/interface/api/18098
export async function _scheduleOrder(query: {
  sid: string; // 学员id
  cid: string; // 教练id
  traincode: string; // 预约类型 1-实操，2-课堂教学，3-模拟器教学，4-远程教学
  skuIds: any; // 商品id
  ifFree?: string; // 是否免单 1-免单 0(不传)-不免单
  stuschoolid?: any; //学员所属schoolId
  skuschoolid?: any; //课程所属schoolId
}) {
  return await request(
    `${CORE_PREFIX}/v1/schedule/direct/order`,
    'POST',
    { skuschoolid: Auth.get('schoolId'), stuschoolid: Auth.get('schoolId'), orderMode: '2', ...query }, // 约课类型 1-学员自主预约,2-驾校约课, 3- 直接安排
    {
      withFeedback: true,
      customHeader: { menuId: 'realTimeAppointment', elementId: 'teach/realTimeAppointment:btn2' },
    },
  );
}

// 修改排班信息
// http://192.168.192.132:3000/project/193/interface/api/17055

// applyNum: number; // 可约人数
// applyStatus: number; // 预约状态  1：可约 2：已约满 3：已过期
// beginhour: number; // 课程开始时间-小时
// beginmin: number; // 课程开始时间-分钟
// endhour: number; // 课程结束时间-小时
// endmin: number; // 课程结束时间-分钟
// classnum: number; // 班级人数
// cid: string; // 教练id
// subject: string; // 培训科目/部分/阶段(1-科目一 2-科目二 3-科目三 4- 科目四   0-科目二及科目三
// traintype: string; // 培训车型   编码单选C1/C2等
// price: number; // 课程价格
// saleable: number; // 发布状态 0 未发布 1已发布
// skuId?: number; // sku的库存Id 发布 取消发布用
// productId?: string; // 商品id
// date: string; // 排课日期 yyyy-MM-dd
// daytype: string; // 课程日期类型 1:工作日   2：休息日
export async function _updateSchedule(query: any) {
  return await request(`${CORE_PREFIX}/v1/schedule/updateByKey`, 'POST', query, { withFeedback: true });
}

// 教练培训订单信息列表
// http://192.168.192.132:3000/project/193/interface/api/16110
export async function _getCoaOrderList(query: {
  cid: string; // 教练id
  plan_id: string; // 订单id
  limit: number; // 分页参数
  page: number; // 分页参数
}) {
  return await request(`${CORE_PREFIX}/v1/coaOrderTrain/pageList`, 'GET', query);
}

// 获取实操模拟理论列表
// http://192.168.192.132:3000/project/193/interface/api/17069
export async function _getScheduleList(query: {
  cid: string; // 教练id
  endTime: string; // 结束时间
  limit: number; // 分页参数
  page: number; // 分页参数
  productId: string; // 商品id
  saleable?: string; // 发布状态 0 未发布 1已发布
  startTime: string; // 开始时间
  traincode?: string; //预约类型 1-实操，2-课堂教学，3-模拟器教学，4-远程教学
  classroomId?: string; //教室
  skuschoolid?: string;
}) {
  return await request(`${CORE_PREFIX}/v1/schedule/pageList`, 'GET', {
    skuschoolid: Auth.get('schoolId'),
    ...query,
  });
}

// 新增排班
// http://192.168.192.132:3000/project/193/interface/api/17048
export async function _addSchedule(query: {
  cid: string; // 教练id
  scheduleEDate: string; // 结束时间
  rid: number; // 时间规则方案主键
  saleable?: string; // 发布状态 0 未发布 1已发布
  scheduleSDate: string; // 开始时间
}) {
  return await request(`${CORE_PREFIX}/v1/schedule/save`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'realTimeAppointment', elementId: 'teach/realTimeAppointment:btn1' },
  });
}

// 查询教练信息列表
// http://192.168.192.132:3000/project/183/interface/api/14850
export async function _getCoachList(query: {
  type: '1' | '2' | '3'; // 查询类型1：教练员2：考核员3：安全员
  page: number;
  limit: number;
  coachname?: string; // 名字
  idcard?: string; // 身份证号
  registeredFlag?: string; // 教练员监管平台备案标记-  0 :未备案，1: 已备案
  employstatus?: string; // 教练员供职状态 (00-注册 01-在教 02-停教 03-转校 04-离职 05-注销 06-再教育)
  teachpermitted?: string; // 准驾车型
  mobile?: string; // 联系方式
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageList`, 'GET', query);
}

// 教学时段规则列表
// http://192.168.192.132:3000/project/193/interface/api/15116
export async function _getTimeRule(query: { page: number; limit: number; traincode: string }) {
  return await request(`${CORE_PREFIX}/v1/traTeachtimeRule/pageList`, 'GET', query);
}

// 查询教练信息列表
// http://192.168.192.132:3000/project/183/interface/api/14850
export async function _getInfo(query: {
  type: '1' | '2' | '3'; // 查询类型1：教练员2：考核员3：安全员
  page: number;
  limit: number;
  coachname?: string; // 名字
  idcard?: string; // 身份证号
  registeredFlag?: string; // 教练员监管平台备案标记-  0 :未备案，1: 已备案
  employstatus?: string; // 教练员供职状态 (00-注册 01-在教 02-停教 03-转校 04-离职 05-注销 06-再教育)
  teachpermitted?: string; // 准驾车型
  mobile?: string; // 联系方式
  coachtype?: any;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageList`, 'GET', query);
}

// 根据主键获取教练详情信息
// http://192.168.192.132:3000/project/183/interface/api/14864
export async function _getDetails(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/selectByKey`, 'GET', query);
}

// 根据主键删除教练信息
// http://192.168.192.132:3000/project/183/interface/api/14843
export async function _deleteInfo(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/deleteByKey`, 'DELETE', query);
}

// 新增教练信息
// http://192.168.192.132:3000/project/183/interface/api/16516
export async function _addInfo(query: {
  coachname: string; // 姓名
  sex: string; // 性别 1:男性;2:女性  0:未知
  idcard: string; // 身份证件号码
  mobile: string; // 手机号码
  address?: string; // 联系地址
  drilicence: string; // 驾驶证号
  fstdrilicdate: string; // 驾驶证初领日期YYYY-MM-DD
  dripermitted: string; // 准驾车型,编码单选
  occupationno?: string; // 职业资格证号/教练证号
  occupationlevel?: string; // 职业资格等级
  teachpermitted: string; // 准教车型,编码单选
  employstatusKhy?: string; // 考核员供职状态 (00-注册 01-在教 02-停教 03-转校 04-离职 05-注销 06-再教育)
  hiredate: string; // 入职日期YYYYMMDD
  leavedate?: string; // 离职日期YYYYMMDD
  coachtype?: string; // 教练员类型(1-理论教练员 2-驾驶教练员 3-理论/驾驶教练员 4-客货 5-危险品)
  headImgUrl?: string; // 教练员头像图片
  db: string | null;
  school_id: string | null;
  iscoach: number; // 是否教练(0-否 1-是)
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/save`, 'POST', query, { withFeedback: true });
}

// 编辑教练信息
// http://192.168.192.132:3000/project/183/interface/api/16523
export async function _updateInfo(query: {
  coachname: string; // 姓名
  sex: string; // 性别 1:男性;2:女性  0:未知
  idcard: string; // 身份证件号码
  mobile: string; // 手机号码
  address?: string; // 联系地址
  drilicence: string; // 驾驶证号
  fstdrilicdate: string; // 驾驶证初领日期YYYY-MM-DD
  dripermitted: string; // 准驾车型,编码单选
  occupationno?: string; // 职业资格证号/教练证号
  occupationlevel?: string; // 职业资格等级
  teachpermitted: string; // 准教车型,编码单选
  employstatusKhy?: string; // 考核员供职状态 (00-注册 01-在教 02-停教 03-转校 04-离职 05-注销 06-再教育)
  hiredate: string; // 入职日期YYYYMMDD
  leavedate?: string; // 离职日期YYYYMMDD
  coachtype?: string; // 教练员类型(1-理论教练员 2-驾驶教练员 3-理论/驾驶教练员 4-客货 5-危险品)
  headImgUrl?: string; // 教练员头像图片
  head_img_oss_id: string; // 图片id
  db: string | null;
  school_id: string | null;
  iscoach: number; // 是否教练(0-否 1-是)
  cid: string; // 主键
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/updateByKey`, 'PUT', query, { withFeedback: true });
}

// 教练员信息备案
// http://192.168.192.132:3000/project/183/interface/api/17181
export async function _recordCoach(query: { cid: string; type: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/recordCoach`, 'PUT', query);
}

// 修改排班信息
// http://192.168.192.132:3000/project/193/interface/api/17055
export async function _updateScheduleByKey(query: {
  beginhour: any; // 时段设置开始日期
  beginmin: any; // 时段设置结束日期
  endhour: any; // 时段设置开始日期
  endmin: any; // 时段设置结束日期
  subject: string; // 科目
  traintype: string; // 车型
  classnum: any; // 班级人数
  price: any; // 价格
  productId: any; // 主键
}) {
  return await request(`${CORE_PREFIX}/v1/schedule/updateByKey`, 'PUT', query, {
    withFeedback: true,
    customHeader: {
      menuId: 'timeRule',
      elementId: 'teach/timeRule:btn2',
    },
  });
}
