import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

interface ICoachList extends IPaginationParams {
  cid: string;
}

// 教练员分账列表
// http://192.168.192.132:3000/project/183/interface/api/26603
export async function _getCoaSplitRatio(query: ICoachList) {
  return await request(`${NOT_CORE_PREFIX}/v1/coaSplitRatio/pageList`, 'GET', query);
}

// 删除教练员分账记录
// http://192.168.192.132:3000/project/183/interface/api/26596
export async function _deleteCoach(query: { id: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coaSplitRatio/delete`, 'DELETE', query);
}

// 查询教练分账修改记录
// http://192.168.192.132:3000/project/183/interface/api/26652
export async function _getCoachRecord(query: { cid: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coaSplitRatioFlow/selectByCid`, 'GET', query);
}

// 教练员分账导入
// http://192.168.192.132:3000/project/183/interface/api/26610
export async function _getCoachImport(query: {
  handleType: string; // 重复数据处理方式 0：跳过 1：替换
  ossid: string; // 临时文件ossid
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/coaSplitRatio/save`, 'POST', query, { withFailedFeedback: true });
}
