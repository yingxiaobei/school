import { request } from 'services';
import { EXAM_PREFIX } from 'constants/env';

interface IPersonType extends IPaginationParams {
  period?: 'week' | 'month' | 'trimonth' | 'year'; // (week:近一周;month:近一月;trimonth:'近三月';year:'近一年')
  startDate?: string;
  endDate?: string;
}

// 按车型统计人数
// http://192.168.192.132:3000/project/223/interface/api/21710
export async function _getSumByCarList(query: IPersonType) {
  return await request(`${EXAM_PREFIX}/v1/statistic/stuCount/byCartype`, 'GET', query);
}

// 按教练统计人数
// http://192.168.192.132:3000/project/223/interface/api/21717
export async function _getSumByCoachList(query: IPersonType) {
  return await request(`${EXAM_PREFIX}/v1/statistic/stuCount/byCoach`, 'GET', query);
}

// 按年龄统计人数
// http://192.168.192.132:3000/project/223/interface/api/21738
export async function _getSumByAgeList(query: IPersonType) {
  return await request(`${EXAM_PREFIX}/v1/statistic/stuCount/byAge`, 'GET', query);
}
