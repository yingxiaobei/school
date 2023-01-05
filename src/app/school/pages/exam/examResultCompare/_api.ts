import { request } from 'services';
import { STATISTIC_PREFIX } from 'constants/env';

interface ITestResultCompareParams {
  year: string;
}
//考出成绩同比
//http://192.168.192.132:3000/project/223/interface/api/21472
export async function _testResultCompare(query: ITestResultCompareParams) {
  return await request(`${STATISTIC_PREFIX}/v1/statistic/testResult/success/compare`, 'GET', query);
}
