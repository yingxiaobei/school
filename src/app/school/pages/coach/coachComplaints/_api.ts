import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

interface IGetCoachComplaintsList extends IPagination {
  coachname?: string; // 教练姓名
  evaluatetimeEnd?: string; // 投诉时间（止）
  evaluatetimeStart?: string; // 投诉时间（起）
  idcard?: string; // 证件号码
  licnum?: string; // 车牌号码
  occupationno?: string; // 准教证号
}

// 教练员投诉分页列表
// http://192.168.192.132:3000/project/183/interface/api/19421
export async function _getCoachComplaintsList(query: IGetCoachComplaintsList) {
  return await request(`${NOT_CORE_PREFIX}/v1/schComplaint/pageListCoachComplaint`, 'GET', query);
}

// 驾校投诉分页列表
// http://192.168.192.132:3000/project/183/interface/api/19428
export async function _getSchoolComplaintList(query: {
  page: number;
  limit: number;
  evaluatetimeEnd?: string; // 投诉时间（止）
  evaluatetimeStart?: string; // 投诉时间（起）
}) {
  return await request(`${NOT_CORE_PREFIX}/v1/schComplaint/pageListSchoolComplaint`, 'GET', query);
}

//新增投诉
//http://192.168.192.132:3000/project/183/interface/api/19407
export async function _addComplaints(
  query: {
    cdate?: string; //
    content: string; //投诉内容
    depaopinion: string; //部门意见
    objectnum: string; //投诉对象ID，教练员或培训机构ID
    schopinion: string; //驾校意见
    sid: string; //评价人
    type: string; //投诉对象类型，1:教练员 2:培训机构
  },
  customHeader: any,
) {
  return await request(`${NOT_CORE_PREFIX}/v1/schComplaint/add`, 'POST', query, {
    withFeedback: true,
    customHeader: customHeader,
  });
}

//查询教练员列表-下拉框
//http://192.168.192.132:3000/project/183/interface/api/18357
export async function _getFinalAssess(query: { schoolId?: number; coachname?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageListCoach`, 'GET', query);
}
