import { NOT_CORE_PREFIX } from 'constants/env';
import { request } from 'services';

//新增学员评价
export async function _saveStuEvaluation(
  query: {
    cid: string;
    serviceQuality: string; //服务质量 1：满意 2：基本满意 3：不满意
    sid: string;
    teachQuality: string; //教学质量 1：满意 2：基本满意 3：不满意
  },
  customHeader?: any,
) {
  return await request(`/api/jp-portal-svc/v1/stuEvaluation/save`, 'POST', query, {
    withFeedback: true,
    customHeader,
  });
}

// 根据主键获取教练详情信息
// http://192.168.192.132:3000/project/183/interface/api/14864
export async function _getDetails(query: { id: string }, customHeader?: any) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/selectByKey`, 'GET', query, { customHeader });
}

//评价列表
// http://192.168.192.132:3000/project/233/interface/api/27401
export async function _getEvaluateList(query: any) {
  return request(`/api/jp-portal-svc/v1/stuEvaluation/pageList`, 'GET', query);
}
