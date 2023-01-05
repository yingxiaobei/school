import { request } from 'services';
import { VIDEO_FACE, EXAM_PREFIX, STATISTIC_PREFIX, CORE_PREFIX } from 'constants/env';
import type {
  BannerBody,
  StudentExamQuery,
  IGetInfoParams,
  SelectedPartial,
  ExamPassRateQuery,
} from './schoolHomeType';

// http://192.168.192.132:3000/project/248/interface/api/38929
// 获取匹配的最新版本广告以及广告明细
export function _getBannerList(query: BannerBody) {
  return request(`${VIDEO_FACE}/v1/advertisement/device/getLatestVersionAdAndDetail`, 'POST', query);
}

// 考试成绩列表(在工作台页面中只展示前三条)
// http://192.168.192.132:3000/project/223/interface/api/21458
export async function _getExamList(
  query: SelectedPartial<
    StudentExamQuery,
    'cid' | 'endDate' | 'sid' | 'startDate' | 'testCarModel' | 'testResult' | 'testSubject'
  >,
) {
  return await request(`${EXAM_PREFIX}/v1/statistic/crawler/exam/list`, 'GET', query);
}

//学员信息管理接口(在工作台页面中只展示前三条)
//http://192.168.192.132:3000/project/223/interface/api/21528
export async function _getInfo(query: IGetInfoParams) {
  return await request(`${STATISTIC_PREFIX}/v1/student/statistic/school/coach/train`, 'GET', query);
}

// 考试合格率
// http://192.168.192.132:3000/project/223/interface/api/21612
export async function _examPassRateCoach(query: ExamPassRateQuery) {
  return await request(`${STATISTIC_PREFIX}/v1/statistic/testResult/passRate/byCoach`, 'GET', query);
}

// 工作台 招生情况
export async function _getNumberOfEnrollment() {
  return await request(`${CORE_PREFIX}/v1/student/newCount`, 'GET', {});
}
