import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// 分页展示已复位信息列表
// http://192.168.192.132:3000/project/183/interface/api/17951
export async function _getTraStuSignList(query: {
  page: number;
  limit: number;
  type?: string; // 人员类别 0:全部，1:学员，2:教练
  name?: string; // 人员姓名
  licnum?: string; // 车牌号
  termcode?: string; // 设备号
  operatetimestart?: string; // 复位时间起
  operatetimeend?: string; // 复位时间止
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/traStuSignDev/pageList`, 'GET', query);
}

// 复位
// http://192.168.192.132:3000/project/183/interface/api/17965
export async function _updateTraSign(query: {
  ids: any; // 主键
  type: string; // 复位类型 1:学员2:教练员
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/traStuSignDev/updateTraSign`, 'POST', query, { withFeedback: true });
}

// 展示未复位信息列表
// http://192.168.192.132:3000/project/183/interface/api/17958
export async function _noResetList(query: {
  idcard: any; // 身份证号
  type: string; // 人员类别 1:学员，2:教练
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/traStuSignDev/pageListByIdcard`, 'GET', query);
}
