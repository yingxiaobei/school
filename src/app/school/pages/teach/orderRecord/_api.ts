import { request } from 'services';
import { CORE_PREFIX, NOT_CORE_PREFIX } from 'constants/env';

// 教练培训订单信息列表
// http://192.168.192.132:3000/project/193/interface/api/16110
export async function _getCoaOrderList(query: {
  cid: string; // 教练id
  plan_id: string; // 订单id
  limit: number; // 分页参数
  page: number; // 分页参数
  sid?: string;
  order_mode?: string;
  order_status?: string;
  traincode?: string;
  classroom?: string;
  beginDate?: string;
  endDate?: string;
  beginHour?: string;
  endHour?: string;
  order_appoint_status?: string;
  isFreeOrder?: string;
}) {
  return await request(`${CORE_PREFIX}/v1/coaOrderTrain/pageList`, 'GET', query);
}

//取消预约/学员取消订单
//http://192.168.192.132:3000/project/193/interface/api/18196
export async function _cancelOrder(query: {
  sid?: string;
  skuIds?: any; // 预约详情 商品id
  traincode?: string; //预约类型 1-实操，2-课堂教学，3-模拟器教学，4-远程教学
  cid?: string;
  cancelNote?: string; //取消原因
  branchId?: string; //营业网点
  classroomId?: string; //教室
  skuschoolid?: string;
  stuschoolid?: string;
}) {
  return await request(
    `${CORE_PREFIX}/v1/schedule/cancel/order`,
    'POST',
    { ...query, skuIds: [query.skuIds] },
    {
      customHeader: { menuId: 'orderRecord', elementId: 'teach/orderRecord:btn1' },
    },
  );
}

// 教练培训订单详情
// http://192.168.192.132:3000/project/193/interface/api/16124
export async function _getDetail(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/coaOrderTrain/selectByKey`, 'GET', { ...query });
}

// 查询教练员列表--下拉框
// http://192.168.192.132:3000/project/183/interface/api/18357
export async function _getCoachList(query: { coachname?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageListCoach`, 'GET', { ...query });
}

// 营业网点下拉列表
// http://192.168.192.132:3000/project/183/interface/api/20562
export async function _getBusinessOutlet(query: { traincode?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/getSchBranchNetworkList`, 'GET', { ...query });
}

// 查询教室列表
// http://192.168.192.132:3000/project/183/interface/api/19694
export async function _getClassList(query: { sbnid?: string; traincode?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/schBranchNetwork/getClassroomList`, 'GET', { ...query });
}
