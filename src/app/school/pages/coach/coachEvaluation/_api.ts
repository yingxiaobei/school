import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// 评价信息分页列表
// http://192.168.192.132:3000/project/183/interface/api/20212
export async function _getEvaluationList(query: {
  page: number;
  limit: number;
  coachname?: string; // 教练姓名
  evaluatetimeEnd?: string; // 评价时间（止）
  evaluatetimeStart?: string; // 评价时间（起）
  idcard?: string; // 证件号码
  licnum?: string; // 车牌号码
  occupationno?: string; // 准教证号
  part?: string; //培训部分
  overall?: string; //总体满意度
  type?: number;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schEvaluation/pageList`, 'GET', query);
}

//新增评价
//http://192.168.192.132:3000/project/183/interface/api/20198
export async function _addEvaluation(
  query: {
    cid?: string; //教练员ID，教练评价时必传
    overall: string; //总体满意度 1：一星 2：二星 3：三星 4：四星 5：五星（最满意）
    part: string; //培训部分 1：第一部分 2：第二部分 3：第三部分 4：第四部分
    srvmanner?: string; //评价用语列表，英文逗号分隔
    teachlevel?: string; //个性化评价
    sid: string; //评价人
    type: string; //投诉对象类型，1:教练员 2:培训机构
  },
  customHeader: any,
) {
  return await request(`${NOT_CORE_PREFIX}/v1/schEvaluation/add`, 'POST', query, {
    withFeedback: true,
    customHeader: customHeader,
  });
}

//评价详情
//http://192.168.192.132:3000/project/183/interface/api/20205
export async function _getDetails(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schEvaluation/info`, 'GET', query);
}

//查询教练员列表-下拉框
//http://192.168.192.132:3000/project/183/interface/api/18357
export async function _getFinalAssess(query: { schoolId?: number; coachname?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageListCoach`, 'GET', query);
}
