import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// 查询教练信息列表
// http://192.168.192.132:3000/project/183/interface/api/14850
export async function _getInfo(query: {
  type: '1' | '2' | '3'; // 查询类型1：教练员2：考核员3：安全员
  page: number;
  limit: number;
  coachname?: string; // 名字
  idcard?: string; // 身份证号
  registeredSafeFlag?: string; // 考核员监管平台备案标记-  0 :未备案，1: 已备案
  employstatusAqy?: string; // 考核员供职状态 (00-注册 01-在教 02-停教 03-转校 04-离职 05-注销 06-再教育)
  teachpermitted?: string; // 准驾车型
  mobile?: string; // 联系方式
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageList`, 'GET', query);
}

// 查看详情 - 根据主键查询并返回数据实体对象
// http://192.168.192.132:3000/project/183/interface/api/14864
export async function _details(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/selectByKey`, 'GET', query);
}

// 教练员信息监管删除
// http://192.168.192.132:3000/project/183/interface/api/18791
export async function _deleteInfo(query: {
  id: string;
  type: '1' | '2' | '3'; // 查询类型1：教练员2：考核员3：安全员
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/recordDeleteCoach`, 'DELETE', query, {
    withFeedback: true,
    customHeader: { menuId: 'securityOfficerInfo', elementId: 'coach/securityOfficerInfo:btn3' },
  });
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
  employstatusAqy?: string; // 考核员供职状态 (00-注册 01-在教 02-停教 03-转校 04-离职 05-注销 06-再教育)
  hiredate: string; // 入职日期YYYYMMDD
  leavedate?: string; // 离职日期YYYYMMDD
  head_img_oss_id: string; // 图片id
  issafe: number; // 是否安全员(0-否 1-是)
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/save`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'securityOfficerInfo', elementId: 'coach/securityOfficerInfo:btn6' },
  });
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
  employstatusAqy?: string; // 考核员供职状态 (00-注册 01-在教 02-停教 03-转校 04-离职 05-注销 06-再教育)
  hiredate: string; // 入职日期YYYYMMDD
  leavedate?: string; // 离职日期YYYYMMDD
  cid: string; // 主键
  head_img_oss_id: string; // 图片id
  issafe: number; // 是否安全员(0-否 1-是)
  isChange: string; // 编辑时必传基本信息是否变更0：未变更1：变更
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/updateByKey`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'securityOfficerInfo', elementId: 'coach/securityOfficerInfo:btn2' },
  });
}

// 备案-教练员信息备案
// http://192.168.192.132:3000/project/183/interface/api/17181
export async function _record(query: {
  id: string;
  type: '1' | '2' | '3'; // 查询类型1：教练员2：考核员3：安全员
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/recordCoach`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'securityOfficerInfo', elementId: 'coach/securityOfficerInfo:btn4' },
  });
}

// 注销人员接口
// http://192.168.192.132:3000/project/183/interface/api/20296
export async function _logoutPerson(query: {
  cid: string;
  type: '1' | '2' | '3'; // 查询类型1：教练员2：考核员3：安全员
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/disableByKey`, 'PUT', query, {
    withFeedback: true,
  });
}

// 变更教练员、考核员、安全员供职状态
// http://192.168.192.132:3000/project/183/interface/api/20933
export async function _changeStatus(
  query: {
    cid: string;
    type: '1' | '2' | '3'; // 查询类型1：教练员2：考核员3：安全员
    status: string;
  },
  customHeader: any,
) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/updateCoaEmploystatus`, 'PUT', query, {
    withFeedback: true,
    customHeader,
  });
}

// 导出教练Excel前查询
// http://192.168.192.132:3000/project/183/interface/api/31622
export async function _exportBefore(query: {
  type: string; // 查询类型1：教练员2：考核员3：安全员
  coachname?: string; // 名字
  idcard?: string; // 身份证号
  registeredSafeFlag?: string; // 考核员监管平台备案标记-  0 :未备案，1: 已备案
  employstatusAqy?: string; // 考核员供职状态 (00-注册 01-在教 02-停教 03-转校 04-离职 05-注销 06-再教育)
  teachpermitted?: string; // 准驾车型
  mobile?: string; // 联系方式
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/exportCoaBefore`, 'GET', query);
}

// 导出教练Excel
// http://192.168.192.132:3000/project/183/interface/api/31615
export async function _export(query: {
  type: string; // 查询类型1：教练员2：考核员3：安全员
  coachname?: string; // 名字
  idcard?: string; // 身份证号
  registeredSafeFlag?: string; // 考核员监管平台备案标记-  0 :未备案，1: 已备案
  employstatusAqy?: string; // 考核员供职状态 (00-注册 01-在教 02-停教 03-转校 04-离职 05-注销 06-再教育)
  teachpermitted?: string; // 准驾车型
  mobile?: string; // 联系方式
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/exportCoa`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}
