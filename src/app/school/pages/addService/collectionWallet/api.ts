import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

//查询电子账户信息
// http://192.168.192.132:3000/project/193/interface/api/25756
export async function _getBankList(query: {
  bankChannelId: string; //开户渠道ID
  bankAccount: string; //银行电子账户
  busiType: string; // 业务类型 1：买家 2：卖家
  personType: string; // 人员类型 1：学员 2：教练
  userId: string; // schoolId
}) {
  return await request(`${CORE_PREFIX}/v2/account/querySchoolPazzAccountMerge`, 'GET', query);
}
