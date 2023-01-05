import { request } from 'services';
import { CORE_PREFIX } from 'constants/env';

// 学员持卡信息列表
// http://192.168.192.132:3000/project/193/interface/api/14472
export async function _getStudentCardList(query: {
  page: number;
  limit: number;
  cardcode?: string; // IC卡编号
  barcode?: string; // IC卡条形码
  cardstatus?: string; // 卡状态   1：正常   2：停用
  name?: string; // 姓名
  spell?: string; // 拼音码
  idcard?: string; // 身份证件号码
  maketimeend?: string;
  maketimestart?: string;
  sid?: string;
  usetype?: string;
}) {
  return await request(`${CORE_PREFIX}/v1/stuCardinfo/pageList`, 'GET', query);
}

//学员持卡信息详情
//http://192.168.192.132:3000/project/193/interface/api/14486
export async function _details(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/stuCardinfo/selectByKey`, 'GET', query);
}

//新增学员持卡
//http://192.168.192.132:3000/project/193/interface/api/14479
export async function _addCard(
  query: {
    barcode: string; // IC卡条形码
    cardData?: string; // 卡数据
    makeType: string; // 制卡类型 1：制卡 2：补卡
    sid: string;
    operator_id: any;
    stu_idcard: string;
    stu_name: string;
  },
  customHeader: any,
) {
  return await request(`${CORE_PREFIX}/v1/stuCardinfo/makeCard`, 'POST', query, {
    withFeedback: true,
    customHeader: customHeader,
  });
}

//更新卡有效期
//http://192.168.192.132:3000/project/193/interface/api/19820
export async function _updateCardEffective(query: { sid: string[] }) {
  return await request(`${CORE_PREFIX}/v1/stuCardinfo/updateValidDate`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentCardMaking', elementId: 'student/studentCardMaking:btn5' },
  });
}

//申请
//http://192.168.192.132:3000/project/193/interface/api/22620
export async function _application(query: { cardTypeEnum: string; sid: string }) {
  return await request(`${CORE_PREFIX}/v1/stuCardinfo/print/application`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentCardMaking', elementId: 'student/studentCardMaking:btn6' },
  });
}

//获取申请结果
export async function _getApplicationRes(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/stuCardinfo/get/application/result`, 'GET', query, { withFeedback: true });
}
