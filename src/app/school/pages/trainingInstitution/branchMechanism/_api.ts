import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// 分支机构模块信息列表
// http://192.168.192.132:3000/project/183/interface/api/15312
export async function _getBranchMechanism(query: {
  branchname?: string; // 分支机构
  page: number;
  limit: number;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolbranch/pageList`, 'GET', query);
}

// 查看分支机构详情
// http://192.168.192.132:3000/project/183/interface/api/15326
export async function _getDetails(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolbranch/selectByKey`, 'GET', query);
}

// 删除分支机构
// http://192.168.192.132:3000/project/183/interface/api/15305
export async function _deleteTeBranchMechanism(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolbranch/deleteByKey`, 'DELETE', query, {
    customHeader: { menuId: 'branchMechanism', elementId: 'trainingInstitution/branchMechanism:btn2' },
  });
}

// 新增分支机构
// http://192.168.192.132:3000/project/183/interface/api/15319
export async function _addBranchMechanism(query: {
  branchname: string; // 分支机构名称
  contact?: string; // 联系人
  phone?: string; // 联系电话
  address: string; // 分支机构地址
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolbranch/save`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'branchMechanism', elementId: 'trainingInstitution/branchMechanism:btn1' },
  });
}

// 更新分支机构
// http://192.168.192.132:3000/project/183/interface/api/15333
export async function _updateBranchMechanism(query: {
  bid: string; // 分支机构主键
  branchname: string; // 分支机构名称
  contact?: string; // 联系人
  phone?: string; // 联系电话
  address: string; // 分支机构地址
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolbranch/updateByKey`, 'PUT', query, {
    customHeader: { menuId: 'branchMechanism', elementId: 'trainingInstitution/branchMechanism:btn3' },
  });
}
