import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

interface NVRSettingMagParams extends IPaginationParams {
  licnum?: string;
  isMonitor?: string;
}
//NVR设置管理分页展示信息列表
//http://192.168.192.132:3000/project/183/interface/api/24090
export async function _getNvrSetupList(query: NVRSettingMagParams) {
  return await request(`${NOT_CORE_PREFIX}/v1/nvrSetup/pageList`, 'GET', query);
}

// 查询车辆列表下拉框
// http://192.168.192.132:3000/project/183/interface/api/20919
export async function _getCarList(query: { licnum?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schCar/listCar`, 'GET', query);
}

//根据匹配的条件查询数据实体对象[Licnum]
//http://192.168.192.132:3000/project/183/interface/api/24083
export async function _getLicnumDetails(query: { licnum: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/nvrSetup/listByLicnum`, 'GET', query);
}

//根据匹配的条件查询数据实体对象[Key]
//http://192.168.192.132:3000/project/183/interface/api/24083
export async function _getKeyDetails(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/nvrSetup/selectByKey`, 'GET', query);
}

//[新增]插入一个数据实体对象
//http://192.168.192.132:3000/project/183/interface/api/24097
export async function _addNvrItem(query: {
  ipc_account: string; //IPC账号
  ipc_ip: string; //IPC IP
  ipc_port: number; //IPC端口
  ipc_pwd: string; //IPC密码
  licnum: string; //车牌号
  nvr_account: string; //硬盘录像机账号
  nvr_channel: string; //硬盘录像机通道
  nvr_ip: string; //硬盘录像机IP
  nvr_port: number; //NVR端口
  nvr_pwd: string; //硬盘录像机密码
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/nvrSetup/save`, 'POST', query, { withFeedback: true });
}

//[编辑]根据主键修改数据实体对象
//http://192.168.192.132:3000/project/183/interface/api/24111
export async function _editNvrItem(query: {
  ipc_account: string; //IPC账号
  ipc_ip: string; //IPC IP
  ipc_port: number; //IPC端口
  ipc_pwd: string; //IPC密码
  licnum: string; //车牌号
  nvr_account: string; //硬盘录像机账号
  nvr_channel: string; //硬盘录像机通道
  nvr_ip: string; //硬盘录像机IP
  nvr_port: number; //NVR端口
  nvr_pwd: string; //硬盘录像机密码
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/nvrSetup/updateByKey`, 'PUT', query, { withFeedback: true });
}

//[删除]根据主键删除数据实体对象
//http://192.168.192.132:3000/project/183/interface/api/24076
export async function _deleteNvrItem(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/nvrSetup/delete/${query.id}`, 'DELETE');
}
