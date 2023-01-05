import { request } from 'services';
import { CORE_PREFIX, NOT_CORE_PREFIX } from 'constants/env';

interface IGetForecastListParams extends IPaginationParams {
  idcard?: string; // 身份证件号码
  name?: string; // 姓名
  phone?: string; // 手机号码
  traintype?: string; // 培训车型 编码单选C1/C2等
}

interface IGetClassListParams extends IPaginationParams {
  packlabel?: string; // 班级名称
  traintype?: string; // 培训车型 编码单选C1/C2等
}

// http://192.168.192.132:3000/project/193/interface/api/12624
export async function _getForecastList(query: IGetForecastListParams) {
  return await request(`${CORE_PREFIX}/v1/schStudentForecast/pageList`, 'GET', query);
}

// 查看详情
// http://192.168.192.132:3000/project/193/interface/api/12638
export async function _getDetails(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/schStudentForecast/selectByKey`, 'GET', query);
}

// 预报名审核
// http://192.168.192.132:3000/project/193/interface/api/16285
export async function _updateByKeyForExam(query: any) {
  return await request(`${CORE_PREFIX}/v1/schStudentForecast/updateByKeyForExam`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'forecastReview', elementId: 'student/forecastReview:btn2' },
  });
}

// 查询班级列表 分页展示班级信息
// http://192.168.192.132:3000/project/183/interface/api/14234
export async function _getClassList(query: IGetClassListParams) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolPackage/pageList`, 'GET', query);
}

// 查询教练员列表--下拉框
// http://192.168.192.132:3000/project/183/interface/api/18357
export async function _getCoachList() {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageListCoach`, 'GET');
}
