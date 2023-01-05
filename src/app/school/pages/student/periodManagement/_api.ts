import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

interface IGetList extends IPagination {
  periodId?: string;
  periodNum?: string;
  periodYear?: string;
  sid?: string;
}
// 查询学员期数信息列表
// http://192.168.192.132:3000/project/193/interface/api/29452
export async function _getList(query: IGetList) {
  return await request(`${CORE_PREFIX}/v1/student/pageListStuByPeriod`, 'GET', query);
}
