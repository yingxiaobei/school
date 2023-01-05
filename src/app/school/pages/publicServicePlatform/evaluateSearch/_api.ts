import { request } from 'services';

//评价列表
// http://192.168.192.132:3000/project/233/interface/api/27401
export async function _getEvaluateList(query: any) {
  return request(`/api/jp-portal-svc/v1/stuEvaluation/pageList`, 'GET', query);
}
