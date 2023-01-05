import { request } from 'services';
import { STATISTIC_PREFIX } from 'constants/env';

interface IGetInfoParams extends IPaginationParams {
  cname?: string;
  idCardNo?: string;
  licnum?: string;
  phone?: string;
  statisticType?: string; // 统计类型: 0.周、1.月、2.季度、3.年
  subjectCode?: string;
}

interface IGetCoachClassRecordParams extends IPaginationParams {
  opraStartDay?: string;
  opraEndDay?: string;
  sname?: string;
  cid?: string;
}

//学员信息管理接口
//http://192.168.192.132:3000/project/223/interface/api/21528
export async function _getInfo(query: IGetInfoParams) {
  return await request(`${STATISTIC_PREFIX}/v1/student/statistic/school/coach/train`, 'GET', query);
}

//查询教练员带教学员电子教学日志分页数据
//http://192.168.192.132:3000/project/223/interface/api/21563
export async function _getCoachClassRecord(query: IGetCoachClassRecordParams) {
  return await request(`${STATISTIC_PREFIX}/v1/student/statistic/school/coach/classrecord`, 'GET', query);
}
