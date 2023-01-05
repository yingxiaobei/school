import { request } from 'services';
import { STATISTIC_PREFIX } from 'constants/env';

interface IGetInfoParams {
  year?: string;
  status?: string;
  month?: string;
}

//驾校月度学员各状态人数查询
//http://192.168.192.132:3000/project/223/interface/api/21675
export async function _getInfo(query: IGetInfoParams) {
  return await request(`${STATISTIC_PREFIX}/v1/student/statistic/school/student/month`, 'GET', {
    status: '00', //00-报名 01-学驾中 02-退学 03-结业 04-注销 05-转校 06-过期 99-归档
    ...query,
  });
}
