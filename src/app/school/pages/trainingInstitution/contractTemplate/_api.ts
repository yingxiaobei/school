import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// 分页展示驾校车型合同模板列表
// http://192.168.192.132:3000/project/183/interface/api/9432
export async function _getContractTemplateList(query: { page: number; limit: number }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schContractTemp/pageList`, 'GET', query);
}

//获取车型合同模板表单详情-编辑表单
export interface Template {
  itemcode: string;
  itemname: string;
  itemreadflag: string;
  itemseq: number;
  itemtype: string;
  itemvalue: string;
}
//http://192.168.192.132:3000/project/183/interface/api/9446
export function _getContractTemplateDetail(query: { id: string }) {
  return request<{
    cartype: string;
    memo: string;
    schContractTempitemList: Template[];
  }>(`${NOT_CORE_PREFIX}/v1/schContractTemp/selectByKey`, 'GET', query);
}

//根据主键修改车型合同模板-编辑提交
//http://192.168.192.132:3000/project/183/interface/api/9453
export async function _updateInfo(query: {
  cartype: string;
  memo?: string;
  schContractTempitemList?: {
    itemvalue: string;
    itemseq: string;
    itemtype?: string;
    itemreadflag?: string;
    itemname?: string;
    itemcode?: string;
    id?: string;
  }[];
  tempid: string;
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schContractTemp/updateByKey`, 'PUT', query, {
    customHeader: { menuId: 'contractTemplate', elementId: 'trainingInstitution/contractTemplate:btn3' },
  });
}

// 根据主键删除车型合同模板
// http://192.168.192.132:3000/project/183/interface/api/9425
export async function _deleteInfo(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schContractTemp/delete/${query.id}`, 'DELETE', query, {
    customHeader: { menuId: 'contractTemplate', elementId: 'trainingInstitution/contractTemplate:btn4' },
  });
}

// 车型合同模板预览
// http://192.168.192.132:3000/project/183/interface/api/18329
export async function _getContractContent(query: { id: number }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schContractTemp/preview/${query.id}`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

// 新增车型合同模板-保存
//http://192.168.192.132:3000/project/183/interface/api/9439
export async function _addInfo(query: {
  cartype: string;
  memo?: string;
  schContractTempitemList?: {
    itemvalue: string;
    itemseq: string;
    itemtype?: string;
    itemreadflag?: string;
    itemname?: string;
    itemcode?: string;
    id?: string;
  }[];
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schContractTemp/save`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'contractTemplate', elementId: 'trainingInstitution/contractTemplate:btn1' },
  });
}

//新增车型合同模板-新增表单
//http://192.168.192.132:3000/mock/183/v1/schContractTemp/initForm
export async function _getInitForm() {
  return await request(`${NOT_CORE_PREFIX}/v1/schContractTemp/initForm`, 'GET');
}
