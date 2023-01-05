import { NOT_CORE_PREFIX } from 'constants/env';
import { request } from 'services';

///v1/studentClassrecord/getReviewDetail
export async function _getReviewDetail(query: any) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/getReviewDetail`, 'GET', query);
}

/**
 * @description 计时申诉
 * @param data
 * @since v1.0.71.0
 */
interface TimeAppealReq {
  classid: string;
  signstarttime: string;
  updateType: '1';
}
export function _timeAppeal(data: TimeAppealReq) {
  return request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/classrecordAppealJx`, 'POST', data);
}
