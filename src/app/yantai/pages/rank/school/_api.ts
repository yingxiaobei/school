import { request } from 'services';

import { USER_CENTER_PREFIX } from 'constants/env';
const prefix = USER_CENTER_PREFIX;

//查询监管驾校列表
export async function _getSuperviseList(query: any) {
  return request(`${prefix}/v1/company/supervise/page`, 'GET', query);
}
