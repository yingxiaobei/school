import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// 查看其他设施设备管理信息
// http://192.168.192.132:3000/project/183/interface/api/14773
export async function _getOtherDeviceInfo(query: { page: number; limit: number }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolProperty/pageList`, 'GET', query);
}

// 新增培训机构资产
// http://192.168.192.132:3000/project/183/interface/api/14766
export async function _addInstitutionAssets(query: any) {
  const { id, ...params } = query;
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolProperty/save`, 'POST', params, {
    withFeedback: true,
    customHeader: { menuId: 'otherDevice', elementId: 'trainingInstitution/otherDevice:btn1' },
  });
}

// 编辑培训机构资产
// http://192.168.192.132:3000/project/183/interface/api/14780
export async function _updateInstitutionAssets(query: any) {
  const { id, ...params } = query;
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolProperty/updateByKey`, 'PUT', params, {
    customHeader: { menuId: 'otherDevice', elementId: 'trainingInstitution/otherDevice:btn1' },
  });
}
