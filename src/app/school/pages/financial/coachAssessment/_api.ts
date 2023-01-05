import { request } from 'services';

// TODO: 个人校验
// jp-train-core-svc-hkf

// 教练考核表列表
//http://192.168.192.132:3000/project/193/interface/api/20947
export async function _pageList(query: {
  cid?: string;
  beginDate?: string;
  endDate?: number;
  limit: number;
  page: number;
}) {
  return await request(`api/jp-train-core-svc/v1/coaOrderTrain/pageListCoaAppraise`, 'GET', query);
}

// 导出
export async function _export(query: {
  cid?: string;
  beginDate?: string;
  endDate?: number;
  limit: number;
  page: number;
}) {
  return await request(`api/jp-train-core-svc/v1/coaOrderTrain/exportCoaAppraiseExcel`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}
