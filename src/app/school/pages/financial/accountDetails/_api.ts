import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

// 查询财务明细
//http://192.168.192.132:3000/project/193/interface/api/18903
export async function _getInfo(query: {
  page: number;
  limit: number;
  endDate?: string; // 结束时间
  startDate?: string; // 开始时间
  busiType?: string; //账务类型(1.支、2.退、3.冻、4.解冻、5.结、6.充、7.提 8.转账(会员间))'
  flowType?: string; //流水类型:1:收，2:出
  resourceId?: string; //业务来源ID
  targetAcctNo?: string; //对方电子账户
  targetUserFlag?: string; //对方userId
  sid?: string;
}) {
  return await request(`${CORE_PREFIX}/v1/stuOrderPay/account/pageList`, 'GET', query);
}

//姓名模糊或身份证号查询学员
//http://192.168.192.132:3000/project/193/interface/api/19680
export async function _getStudentList(query: { name?: string; idcard?: string }) {
  return await request(`${CORE_PREFIX}/v1/student/selectByNameOrIdNum`, 'GET', query);
}
