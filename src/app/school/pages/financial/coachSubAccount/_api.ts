import { request } from 'services';
import { CORE_PREFIX, NOT_CORE_PREFIX } from 'constants/env';

//教练员分账结算列表
//http://192.168.192.132:3000/project/183/interface/api/36669
export async function _getList(query: any) {
  return await request(
    `${NOT_CORE_PREFIX}/v1/coaSplitRatio/pageListCoaSplitRatioSettlement`,
    'GET',
    { ...query },
    {
      withFailedFeedback: true,
    },
  );
}

// 查询驾校的已开户银行渠道
// http://192.168.192.132:3000/project/193/interface/api/25686
export async function _getOpenAccount() {
  return await request(`${CORE_PREFIX}/v1/account/querySchoolAreadyOpenAccount`, 'GET');
}

// 立即分账
// http://192.168.192.132:3000/project/193/interface/api/49200
export async function _getManualSubAccount(query: { payFlowId: String }) {
  return await request(`${CORE_PREFIX}/v1/stuOrderSettlement/manualSubAccount`, 'GET', query);
}
