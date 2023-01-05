import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

// 提现申请单分页列表
// http://192.168.192.132:3000/project/193/interface/api/54840
export async function _getList(query: any) {
  return await request(`${CORE_PREFIX}/v1/stuOrderPay/withdrawApply/listPage`, 'GET', query);
}

// 提现申请单分页列表
// http://192.168.192.132:3000/project/193/interface/api/54840
export async function _getDetail(query: any) {
  return await request(`${CORE_PREFIX}/v1/stuOrderPay/withdrawApply/detail`, 'GET', query);
}
