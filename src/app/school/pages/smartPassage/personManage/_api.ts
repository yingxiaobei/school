import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

//人员管理-列表展示
//http://192.168.192.132:3000/project/183/interface/api/42464
export async function _getList(query: {
  page: number;
  limit: number;
  personType: number;
  personName?: string;
  idCard?: string;
  personStatus?: string;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/wisdompass/personManage/pageList`, 'GET', query);
}

//人员管理-新增(其他人员)
//http://192.168.192.132:3000/project/183/interface/api/42469
export async function _saveOthers(query: {
  personStatus: number;
  personType: number;
  personName: string;
  picUrl: string;
  remark?: string;
  idCard: string;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/wisdompass/personManage/save`, 'POST', query, {
    withFailedFeedback: true,
  });
}

//人员管理-编辑(其他、学员)
//http://192.168.192.132:3000/project/183/interface/api/42474
export async function _updatePerson(query: {
  personStatus: number;
  personType: number;
  personName?: string;
  picUrl?: string;
  remark?: string;
  idCard?: string;
  id?: string;
  sid?: string;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/wisdompass/personManage/updateByKey`, 'PUT', query);
}

//人员管理-删除(其他人员)
//http://192.168.192.132:3000/project/183/interface/api/42479
export async function _deletePerson(query: { id: string }) {
  const { id } = query;
  return await request(`${NOT_CORE_PREFIX}/v1/wisdompass/personManage/delete/${id}`, 'DELETE');
}

//人员管理-导出其他人员
//http://192.168.192.132:3000/project/183/interface/api/42484
export async function _exportExcel(query: { personName?: string; personStatus?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/wisdompass/personManage/exportExcel`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

//人员管理-导入其他人员
//http://192.168.192.132:3000/project/183/interface/api/cat_10158
export async function _importExcel(query: any) {
  return await request(`${NOT_CORE_PREFIX}/v1/wisdompass/personManage/importExcel`, 'POST', query, {
    customHeader: { 'Content-Type': 'multipart/form-data' },
  });
}

//人员管理-导入其他人员
//http://192.168.192.132:3000/project/183/interface/api/42574
export async function _downloadTemplate(query: any) {
  return await request(`${NOT_CORE_PREFIX}/v1/wisdompass/personManage/downloadTemplate`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}
