import { request } from 'services';
import { VIDEO_FACE } from 'constants/env';
import { AxiosResponse } from 'axios';

// 单项训练总数据
// http://192.168.192.132:3000/project/228/interface/api/36332
export async function _geIndividualTraining(query: { userId: string }) {
  return await request(`${VIDEO_FACE}/v1/train/record/single/train`, 'GET', query);
}

// 单项训练通过率
// http://192.168.192.132:3000/project/228/interface/api/36329
export async function _geIndividualTrainingDetail(query: { userId: string; itemType: string }) {
  return await request(`${VIDEO_FACE}/v1/train/record/single/rate`, 'GET', query);
}

// 模拟考试数据
// http://192.168.192.132:3000/project/228/interface/api/36317
export async function _getMockExam(query: { userId: string }) {
  return await request(`${VIDEO_FACE}/v1/train/record/exam/all`, 'GET', query);
}
