import { request } from 'services';
import { NOT_CORE_PREFIX } from 'constants/env';

// 教练制卡信息列表
// http://192.168.192.132:3000/project/183/interface/api/19106
interface I_getCoachCardList extends IPaginationParams {
  barcode?: string; // 卡条形码
  cardstatus?: string; // 教练卡状态
  employstatus?: string; // 教练状态
  idcard?: string; // 证件号码
  maketimeEnd?: string; // 制卡日期止
  maketimeStart?: string; // 制卡日期起
  name?: string; // 教练姓名
  usetype?: string; //IC卡类型  0始发、1补发
  hireEndTime?: string; // 入职日期止
  hireStartTime?: string; // 入职日期起
  makeStatus?: string; // 制卡状态
}

export async function _getCoachCardList(query: I_getCoachCardList) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageListCoachCard`, 'GET', query);
}

//新增学员持卡
//http://192.168.192.132:3000/project/183/interface/api/19113
interface I_addCard {
  barcode: string; // 条形码
  cardData?: string;
  cid: string; //教练员主键
  makeType: string; //卡物理状态 0：始发卡，1：补发卡
  type: string; //卡类型 1：教练员  2：考核员  3：安全员
}
export async function _addCard(query: I_addCard, elementId: any) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/saveCoachCard`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'coachCard', elementId },
  });
}

// 更新教练卡有效期
// http://192.168.192.132:3000/project/183/interface/api/16222
export async function _updateCoachCardEffective(query: { cids: string[] }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/updateCoachCardEffective`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'coachCard', elementId: 'coach/coachCard:btn3' },
  });
}

// 申请
// http://192.168.192.132:3000/project/183/interface/api/22193
interface I_application {
  applystatus?: string;
  cardTypeEnum: string;
  cid: string;
  remarks?: string;
}
export async function _application(query: I_application) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/print/application`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'coachCard', elementId: 'coach/coachCard:btn4' },
  });
}

// 获取申请结果
export async function _getApplicationRes(query: { cid: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/get/application/result`, 'GET', query, { withFeedback: true });
}

//http://192.168.192.132:3000/project/183/interface/api/24006
//保存指纹采集模板
interface I_saveCoaFingerTemplate {
  coaFingerTemplateDtos: {
    cid: string;
    fgcode?: string; //手指编码，左手(1-5),  右手(6-10)
    fgname?: string; //手指名称
    isvalid?: string; //是否有效(0-否 1-是)
    zwmb?: string; //指纹模板
    zwpf?: string; //指纹评分
    zwcd?: string; //指纹长度
  };
}
export async function _saveCoaFingerTemplate(query: I_saveCoaFingerTemplate) {
  return await request(
    `${NOT_CORE_PREFIX}/v1/coaFingerTemplate/save`,
    'POST',
    { isvalid: '1', ...query },
    {
      withFeedback: true,
      customHeader: { menuId: 'coachCard', elementId: 'coach/coachCard:btn6' },
    },
  );
}

//http://192.168.192.132:3000/project/183/interface/api/24027
//根据教练查询指纹信息
export async function _getCoaFingerTemplate(query: { cid: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coaFingerTemplate/selectByCid`, 'GET', query);
}
