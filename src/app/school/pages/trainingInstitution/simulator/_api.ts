import { request } from 'services';
import { NOT_CORE_PREFIX, CORE_PREFIX } from 'constants/env';
// 模拟器车牌模糊查询
// http://192.168.192.132:3000/project/183/interface/api/49416
export async function _getList(query: { page: number; limit: number }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSimulator/pageList`, 'GET', query);
}

// 新增模拟器数据
// http://192.168.192.132:3000/project/183/interface/api/49434
export async function _addModel(query: any) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSimulator/save`, 'POST', query, {
    withFeedback: true,
  });
}

// 修改模拟器数据
// http://192.168.192.132:3000/project/183/interface/api/49446
export async function _editModel(query: any) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSimulator/updateByKey`, 'PUT', query, {
    withFeedback: true,
  });
}

// 注销模拟器数据
// http://192.168.192.132:3000/project/183/interface/api/49422
export async function _deleteCar(id: string) {
  return await request(
    `${NOT_CORE_PREFIX}/v1/schSimulator/delete/${id}`,
    'DELETE',
    {},
    {
      withFeedback: true,
    },
  );
}

// 查询模拟器详情
// http://192.168.192.132:3000/project/183/interface/api/49440
export async function _getDetails(query: any) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSimulator/selectByKey`, 'GET', query);
}

// 操作模拟器信息
// http://192.168.192.132:3000/project/183/interface/api/49452
export async function _opt(query: any) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSimulator/updateSimulator`, 'PUT', query);
}

// 模拟器车牌模糊查询
// http://192.168.192.132:3000/project/183/interface/api/49416
export async function _carSearch(query: any) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSimulator/checkLicBindStatus`, 'GET', query);
}
