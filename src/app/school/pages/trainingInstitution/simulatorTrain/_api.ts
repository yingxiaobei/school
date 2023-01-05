import { request } from 'services';
import { DATA_EXAM_PREFIX } from 'constants/env';
import { _get } from 'utils';

// http://192.168.192.132:3000/project/183/interface/api/cat_10850

export async function _getList(query: any) {
  return await request(`${DATA_EXAM_PREFIX}/v1/simulator/stu/pageListSimulatorTrainrecord`, 'GET', query);
}

// 导出模拟器学时Excel前查询
// http://192.168.192.132:3000/project/183/interface/api/55858
export async function _exportBefore(query: any) {
  return await request(`${DATA_EXAM_PREFIX}/v1/simulator/stu/exportSimulatorTrainrecordListBefore`, 'GET', query);
}

// 导出模拟器学时Excel
// http://192.168.192.132:3000/project/183/interface/api/55862
export async function _export(query: any) {
  return await request(`${DATA_EXAM_PREFIX}/v1/simulator/stu/exportSimulatorTrainrecordList`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}
