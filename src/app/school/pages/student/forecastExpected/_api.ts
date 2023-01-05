// import { request } from 'services/mock';
import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

//http://192.168.192.132:3000/project/193/interface/api/24440
//新增受理学员信息
export async function _getList(query: any) {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/pageList`, 'GET', query);
}

//http://192.168.192.132:3000/project/193/interface/api/24454
// 转正受理学员为正式学员
export async function _confirmStudent(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/saveStudent/${query.id}`, 'POST', query, {
    withFeedback: true,
  });
}

//http://192.168.192.132:3000/project/193/interface/api/37204
//导出前查询
export async function _exportStudentBefore(query: any) {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/exportStudentBefore`, 'GET', query);
}

// http://192.168.192.132:3000/project/193/interface/api/37199
// 导出学员Excel
export async function _export(query: any) {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/export`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

//http://192.168.192.132:3000/project/193/interface/api/47112
//预报名注销
export async function _cancelStudent(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/cancel/${query.id}`, 'PUT', query, {
    withFeedback: true,
  });
}
//学员受理预报名车型
//http://192.168.192.132:3000/project/193/interface/api/24601
export async function _getPreSignUpTrainCar() {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/getStuAcceptTrainType`, 'GET');
}
