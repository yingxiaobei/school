import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

// 获取排班信息
// http://192.168.192.132:3000/project/193/interface/api/20128
export async function _getScheduleCategory(query: { traincode: string }) {
  return await request(`${CORE_PREFIX}/v1/schedule/query/category`, 'GET', query);
}

// 教学时段规则列表
// http://192.168.192.132:3000/project/193/interface/api/15116
export async function _getTimeRule(query: { page: number; limit: number }) {
  return await request(`${CORE_PREFIX}/v1/traTeachtimeRule/pageList`, 'GET', query);
}

// 新增教学时段规则
// http://192.168.192.132:3000/project/193/interface/api/15123
export async function _addTimeRule(query: {
  rulename?: any; // 规则名称
  traincode?: any; // 培训课程方式码 1-实操，2-课堂教学，3-模拟器教学，4-远程教学
  classperiod: any; // classperiod
  dclassnum: any; // 默认可约人数
  traintype?: any; // 培训车型   编码单选C1/C2等
  workdprice?: any; // 工作日课程默认价格
  weekdprice?: any; // 休息日课程默认价格
  beginhour: any; // 时段设置开始日期
  beginmin: any; // 时段设置结束日期
  endhour: any; // 时段设置开始日期
  endmin: any; // 时段设置结束日期
}) {
  return await request(`${CORE_PREFIX}/v1/traTeachtimeRule/save`, 'POST', query, {
    withFeedback: true,
    customHeader: {
      menuId: 'timeRule',
      elementId: 'teach/timeRule:btn1',
    },
  });
}

// 修改教学时段规则
// http://192.168.192.132:3000/project/193/interface/api/15144
export async function _updateTimeRule(query: {
  rulename?: any; // 规则名称
  traincode?: any; // 培训课程方式码 1-实操，2-课堂教学，3-模拟器教学，4-远程教学
  classperiod: any; // classperiod
  dclassnum: any; // 默认可约人数
  traintype?: any; // 培训车型   编码单选C1/C2等
  workdprice?: any; // 工作日课程默认价格
  weekdprice?: any; // 休息日课程默认价格
  beginhour: any; // 时段设置开始日期
  beginmin: any; // 时段设置结束日期
  endhour: any; // 时段设置开始日期
  endmin: any; // 时段设置结束日期
  rid: any; // 主键
}) {
  return await request(`${CORE_PREFIX}/v1/traTeachtimeRule/updateByKey`, 'PUT', query, {
    withFeedback: true,
    customHeader: {
      menuId: 'timeRule',
      elementId: 'teach/timeRule:btn2',
    },
  });
}

// 查看教学时段规则
// http://192.168.192.132:3000/project/193/interface/api/15130
export async function _getTimeRuleDetails(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/traTeachtimeRule/selectByKey`, 'GET', query);
}

// 教学时段规则设置
// http://192.168.192.132:3000/project/193/interface/api/16509
export async function _updateEnableFlag(query: { id: string; enableflag: string }) {
  return await request(
    `${CORE_PREFIX}/v1/traTeachtimeRule/update/${query.id}/enableflag/${query.enableflag}`,
    'PUT',
    query,
  );
}

// 删除教学时段规则
// http://192.168.192.132:3000/project/193/interface/api/15109
export async function _deleteTimeRule(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/traTeachtimeRule/delete/${query.id}`, 'DELETE', {
    customHeader: {
      menuId: 'timeRule',
      elementId: 'teach/timeRule:btn3',
    },
  });
}

// 生成时段规则明细
// http://192.168.192.132:3000/project/193/interface/api/15102
export async function _generateTimeRule(query: {
  classperiod: any; // 课程时长(单位:分钟)
  dclassnum: any; // 默认可约人数
  rulename: any; // 规则名称
  traincode: any; // 培训课程方式码 1-实操，2-课堂教学，3-模拟器教学，4-远程教学
  traintype: any; // 培训车型   编码单选C1/C2等
  weekdprice: any; // 休息日课程默认价格
  workdprice: any; // 工作日课程默认价格
  beginhour: any; // 时段设置开始日期
  beginmin: any; // 时段设置结束日期
  endhour: any; // 时段设置开始日期
  endmin: any; // 时段设置结束日期
  subject: any;
}) {
  return await request(`${CORE_PREFIX}/v1/traTeachtimeRule/createTeachTimeRuleitem`, 'POST', query);
}
