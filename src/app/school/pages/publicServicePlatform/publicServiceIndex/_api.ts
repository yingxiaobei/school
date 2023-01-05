import { request } from 'services';
import { STATISTIC_PREFIX } from 'constants/env';

// http://192.168.192.132:3000/project/223/interface/api/27485
export async function _getStatisticCityInfo() {
  return await request(`${STATISTIC_PREFIX}/v1/statisticCityInfo/getStatisticCityInfo`, 'GET');
}

// http://192.168.192.132:3000/project/223/interface/api/27492
// 按地区、日期、学员状态查询学员日汇总统计
export async function _queryStatisticCityStudentDay(query: { queryDate: string; stuStatus: string }) {
  return await request(`${STATISTIC_PREFIX}/v1/statisticCityInfo/queryStatisticCityStudentDay`, 'GET', query);
}
