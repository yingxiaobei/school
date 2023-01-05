import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

interface IGetCarAlarmList extends IPaginationParams {
  alarmBeginTime?: string; // 报警起始时间
  alarmEndTime?: string; // 报警结束时间
  licnum?: string; // 车牌号码
  coaname?: string; // 教练姓名
  type?: string; // 报警结束时间
}

// 查询车辆报警列表分页
// http://192.168.192.132:3000/project/183/interface/api/37099
export async function _getCarAlarmList(query: IGetCarAlarmList) {
  return await request(`${NOT_CORE_PREFIX}/v1/schTermVideo/carAlarmPage`, 'GET', query);
}
