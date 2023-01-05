import { request } from 'services';
import { STATISTIC_PREFIX } from 'constants/env';

interface IGetTotalStuNumParams {
  year: string;
  status?: string; //（00-报名 01-学驾中 02-退学 03-结业 04-注销 05-转校 06-过期 99-归档）
}

interface IGetAnnualStuNumParams {
  startYear?: string;
  endYear?: string;
}

//驾校年度学员各状态人数查询
//http://192.168.192.132:3000/project/223/interface/api/21549
export async function _getTotalStuNum(query: IGetTotalStuNumParams) {
  return await request(`${STATISTIC_PREFIX}/v1/student/statistic/school/student`, 'GET', query);
}

//分阶段按年统计学员培训人数
//http://192.168.192.132:3000/project/223/interface/api/21542
export async function _getAnnualStuNum(query: IGetAnnualStuNumParams) {
  return await request(`${STATISTIC_PREFIX}/v1/student/statistic/school/stu/train`, 'GET', query);
}
