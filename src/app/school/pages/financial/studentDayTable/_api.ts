import { request } from 'services';
import { ORDER_PAY_PREFIX, CORE_PREFIX } from 'constants/env';

export async function _getList(query: {}) {
  return await request(`${ORDER_PAY_PREFIX}/admin/billReport/listStuDayBillReport`, 'GET', query);
}

export async function _getBankType() {
  return request(`${CORE_PREFIX}/v1/account/querySchoolAreadyOpenAccount`, 'GET');
}

export async function _getTotal(query: any) {
  return await request(`${ORDER_PAY_PREFIX}/admin/billReport/sumStuDayBillReport`, 'GET', query);
}

export async function _export(query: any) {
  return await request(`${ORDER_PAY_PREFIX}/admin/billReport/downloadStuDayBillReport`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}
