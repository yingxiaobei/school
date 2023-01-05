import { request } from 'services';
import { CORE_PREFIX, NOT_CORE_PREFIX } from 'constants/env';

export interface DataType {
  packid: string;
  registered_flag: string;
  note: string;
  traintype: string;
  status_cd: string;
  train_price_online: number;
  studenttype: string;
  packlabel: string;
  train_price: number;
  bankChannelName: string;
  bankChannelId: string;
}

// 查询班级列表 分页展示班级信息
// http://192.168.192.132:3000/project/183/interface/api/14234
export async function _getClassList(query: {
  page: number;
  limit: number;
  packlabel?: string; // 班级名称
  traintype?: string; // 培训车型 编码单选C1/C2等
  studenttype?: string; // 学员类型
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolPackage/pageList`, 'GET', query);
}

// 新增班级、课程列表清单数据
// http://192.168.192.132:3000/project/183/interface/api/14241
export async function _addClassInfo(query: {
  status_cd: string; // 1初始，2 启用
  give_price?: string; // 优惠金额 单位：元
  note: string; // 备注
  packlabel: string; // 班级名称
  traintype: string; // 培训车型 编码单选C1/C2等
  train_price?: string; // 培训金额 单位：元
  schChargeStandardDtoList?: any; // 课程列表清单
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolPackage/save`, 'POST', query, { withFeedback: true });
}

// 查询课程套餐下拉列表-根据培训机构ID、车型、实操模拟理论获取课程套餐
// http://192.168.192.132:3000/project/183/interface/api/14185
export async function _getRegionCourse(query: {
  carType: string; // 培训车型
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schChargeStandard/getRegionCourseTemplateBySchoolId`, 'GET', query);
}

// 查询课程套餐详情 基于模板套餐id，获取用户中心的培训课程信息模板列表
// http://192.168.192.132:3000/project/183/interface/api/14178
export async function _getCourseTemplate(query: {
  packId: string; // 培训车型
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schChargeStandard/getRegionCourseChargeTemplateById`, 'GET', query);
}

// 新增班级、课程列表清单数据
// http://192.168.192.132:3000/project/183/interface/api/14241
export async function _addSchoolPackage(query: {
  note: string; // 备注
  packlabel: string; // 班级名称
  traintype: string; // 培训车型 编码单选C1/C2等
  give_price?: string; // 优惠金额   单位：元
  packid?: string;
  train_price?: string; // 培训金额  单位：元
  status_cd?: string; // 1初始，2 启用
  schChargeStandardDtoList?: any; // 课程列表清单
  studenttype?: string;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolPackage/save`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'classInfo', elementId: 'trainingInstitution/classInfo:btn1' },
  });
}

// 根据主键修改班级、课程列表清单数据
// http://192.168.192.132:3000/project/183/interface/api/14255
export async function _updateSchoolPackage(query: {
  note: string; // 备注
  packlabel: string; // 班级名称
  traintype: string; // 培训车型 编码单选C1/C2等
  give_price?: string; // 优惠金额   单位：元
  packid?: string;
  train_price?: string; // 培训金额  单位：元
  status_cd?: string; // 1初始，2 启用
  schChargeStandardDtoList?: any; // 课程列表清单
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolPackage/updateByKey`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'classInfo', elementId: 'trainingInstitution/classInfo:btn3' },
  });
}

// 查询班级详情- 根据班级主键查询并返回班级课程实体对象
// http://192.168.192.132:3000/project/183/interface/api/14248
export async function _getClassDetail(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolPackage/selectByKey`, 'GET', query);
}

// 更新课程启用/停用标志
// http://192.168.192.132:3000/project/183/interface/api/14262
export async function _updateStatusCD(query: { packid: string; status_cd: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolPackage/updateStatusCDByKey`, 'PUT', query);
}

// 删除班级
// http://192.168.192.132:3000/project/183/interface/api/14227
export async function _deleteClass(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolPackage/delete/${query.id}`, 'DELETE', {
    customHeader: { menuId: 'classInfo', elementId: 'trainingInstitution/classInfo:btn2' },
  });
}

// 备案班级
// http://192.168.192.132:3000/project/183/interface/api/19092
export async function _registerClass(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolPackage/register/${query.id}`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'classInfo', elementId: 'trainingInstitution/classInfo:btn4' },
  });
}

//http://192.168.192.132:3000/project/183/interface/api/31594
//班级初始化
export async function _createAllClassByOneButton() {
  return await request(
    `${NOT_CORE_PREFIX}/v1/schSchoolPackage/createAllClassByOneButton`,
    'POST',
    {},
    {
      withFeedback: true,
      customHeader: { menuId: 'classInfo', elementId: 'trainingInstitution/classInfo:btn5' },
    },
  );
}

export type OpenAccount = {
  bankChannelType: string;
  bankchannelid: string;
  bankName: string;
  chargeNum: number;
  openedAccount: boolean;
  bankaccount: string;
};

// 查询驾校的已开户银行渠道
// http://192.168.192.132:3000/project/193/interface/api/49062
export async function _getOpenAccount() {
  return await request(`${CORE_PREFIX}/v1/account/querySchoolAvailableAccount`, 'GET');
}

// 设置默认钱包
// http://192.168.192.132:3000/project/183/interface/api/49050
export function _checkAndSetDefaultWallet(query: {
  bankChannelId: string;
  bankChannelName: string;
  packageIds: string[];
  schoolId: string;
}) {
  return request(`${NOT_CORE_PREFIX}/v1/schSchoolPackage/setDefaultWallet`, 'POST', query);
}
