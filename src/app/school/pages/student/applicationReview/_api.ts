import { CORE_PREFIX } from 'constants/env';
import { request } from 'services';
import { Query } from '.';

// 查询学员信息列表
// http://192.168.192.132:3000/project/193/interface/api/37104
export async function _getPageList(query: Query) {
  return await request(`${CORE_PREFIX}/v1/stuReportRecord/stuPage`, 'GET', query);
}

// 插入一个数据实体对象(插入字段为传入Entity实体的非空属性
// http://192.168.192.132:3000/project/193/interface/api/37109
export async function _insertApplicationReview(query: any) {
  return await request(`${CORE_PREFIX}/v1/stuReportRecord/save`, 'POST', query, { withFeedback: true });
}

// 根据主键查询并返回数据实体对象
// http://192.168.192.132:3000/project/193/interface/api/37114
export async function _getApplicationReviewDetail(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/stuReportRecord/selectByKey`, 'GET', query);
}

export type ApplicationReviewDetailData = {
  applyTime: string;
  firstPartTime: string;
  firstPartMessage: string;
  firstPartStatus: string;
  secondPartTime: string;
  secondPartStatus: string;
  thirdPartTime: string;
  thirdPartStatus: string;
  fourthPartTime: string;
  fourthPartStatus: string;
  showUrl: string[];
  stuid: string;
  tempId: string;
  [key: string]: string | string[];
};

// 根据主键修改数据实体对象
// http://192.168.192.132:3000/project/193/interface/api/37124
export async function _setApplicationReview(query: any) {
  return await request(`${CORE_PREFIX}/v1/stuReportRecord/updateByKey`, 'PUT', query);
}
