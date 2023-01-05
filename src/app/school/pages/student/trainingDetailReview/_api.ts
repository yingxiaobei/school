import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// 学员科目信息列表
// http://192.168.192.132:3000/project/183/interface/api/17251
export async function _getStudentSubjectList(query: { idcard?: string; stuid?: string; stunum?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/getStudentSubjectStatistic`, 'GET', query);
}

//分钟学时分页列表
//http://192.168.192.132:3000/project/183/interface/api/17279
export async function _getTrainingTimeMin(query: {
  page: string;
  limit: string;
  classid?: string; //电子教学日志id
  signstarttime?: string; //签到开始时间
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/trainingTimeMin/pageListTrainingTimeMin`, 'GET', query);
}
