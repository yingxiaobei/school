import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

// 分支机构模块信息列表
// http://192.168.192.132:3000/project/183/interface/api/15312
export async function _getList(query: any) {
  return await request(`${CORE_PREFIX}/v1/student/pageListStageApply`, 'GET', query);
}
