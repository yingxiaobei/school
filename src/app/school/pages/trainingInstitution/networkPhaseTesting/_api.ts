import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';
import { CORE_PREFIX } from 'constants/env';

// 分页查询网络学习阶段测试成绩
// http://192.168.192.132:3000/project/213/interface/api/35241
export async function _getNetWorkPhaseTestList(query: {
  page: number;
  limit: number;
  transCarType?: string; // 车型
  transPartType?: string; // 测试科目
  courseType?: string; // 课程类型。数据字典：theory_course_type
  appraisalresult?: string; // 考核结果。数据字典：appraisalresult_type
  startTime?: string; // 考核开始日期
  endTime?: string; // 考核结束日期
  stuid?: number;
}) {
  return await request(`${CORE_PREFIX}/v1/stuNetStudyTest/stage/testRecord/pageList`, 'GET', query);
}
