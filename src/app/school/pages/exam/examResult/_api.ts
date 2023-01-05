import { request } from 'services';
import { NOT_CORE_PREFIX, EXAM_PREFIX } from 'constants/env';

// 考试成绩列表
// http://192.168.192.132:3000/project/223/interface/api/21458
export async function _getExamList(query: {
  page: number;
  limit: number;
  barcode?: string; // 卡条形码
}) {
  return await request(`${EXAM_PREFIX}/v1/statistic/testResult/list`, 'GET', query);
}

// 查询教练员列表--下拉框
// http://192.168.192.132:3000/project/183/interface/api/18357
export async function _getCoachList(query: { coachname?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageListCoach`, 'GET', query);
}

// 考试成绩补录
// http://192.168.192.132:3000/project/223/interface/api/21584
export async function _addExam(query: any) {
  return await request(`${EXAM_PREFIX}/v1/statistic/crawler/testResult/insert`, 'POST', query, {
    withFeedback: true,
  });
}

// 导出考试成绩Excel
// http://192.168.192.132:3000/project/223/interface/api/21668
export async function _exportExam(query: any) {
  return await request(`${EXAM_PREFIX}/v1/statistic/crawler/testResult/export`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}
