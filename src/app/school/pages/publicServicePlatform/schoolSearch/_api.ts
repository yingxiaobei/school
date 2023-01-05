import { request } from 'services';

import { USER_CENTER_PREFIX } from 'constants/env';
const prefix = USER_CENTER_PREFIX;

//查询监管驾校列表
export async function _getSuperviseList(query: any) {
  return request(`${prefix}/v1/company/supervise/page`, 'GET', query);
}

//查询驾校简介
///usercenter/v1/company/ext/getDesc/{companyId}
export async function _getDesc(query: { companyId: string }) {
  return request(`${prefix}/v1/company/ext/getDesc/${query.companyId}`, 'GET', {});
}

//修改驾校简介
export async function _setDesc(query: { companyId: string; desc: string }) {
  return request(`${prefix}/v1/company/ext/setDesc/${query.companyId}`, 'POST', {
    desc: query.desc,
  });
}
