import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

//查询账单列表
//http://192.168.192.132:3000/project/193/interface/api/20954
export async function _getInfo(query: { page: number; limit: number; startDate: string; endDate: string }) {
  return await request(`${CORE_PREFIX}/v1/schStatement/selectPage`, 'GET', query);
}

//下载地址
//http://192.168.192.132:3000/project/193/interface/api/20961
export async function _getDownLoadAddress(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/schReconciliation/${query.id}/download`, 'GET', query);
}

//手动对账
//http://192.168.192.132:3000/project/193/interface/api/20947
export async function _reconciliationManual() {
  return await request(`${CORE_PREFIX}/v1/schReconciliation/reconciliationManual`, 'POST');
}
