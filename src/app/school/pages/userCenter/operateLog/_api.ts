import { request } from 'services';
import { VIDEO_FACE } from 'constants/env';

// 获取操作日志列表
// http://192.168.192.132:3000/project/178/interface/api/18042
export async function _getLogs(query: {
  page: number;
  limit: number;
  menuName?: string; // 模块名称
  elementName?: string; // 操作名称
  userName?: string; // 操作用戶名
  operationDateStart?: string; // 操作开始日
  operationDateEnd?: string; // 操作结束日
}) {
  return await request(`${VIDEO_FACE}/v1/operation/log/page`, 'GET', query);
}
