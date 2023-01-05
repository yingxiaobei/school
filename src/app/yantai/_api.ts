import { request, postRequestTemp } from 'services';
import {
  USER_CENTER_PREFIX,
  USER_CENTER_URL,
  CORE_PREFIX,
  PORTAL_APP_CODE,
  PORTAL_SIGN_NAME,
  PORTAL_TEMPLATE_CODE,
  PORTAL_OPEN_API_PREFIX,
  CLIENT_ID,
  CLIENT_SECRET,
  PORTAL_CITY_CODE,
} from 'constants/env';
import { Auth } from 'utils';

declare const window: any;

// 修改密码
// http://192.168.192.132:3000/project/218/interface/api/19855
export async function _updatePassword(query: {
  id: string; // 用户ID
  oldPassword: string; // 原密码
  newPassword: string; // 新密码
}) {
  return await request(`${USER_CENTER_PREFIX}/user/password/set`, 'POST', query, { withFeedback: true });
}

//查询驾校列表
//http://192.168.192.132:3000/project/198/interface/api/20611
export async function _getSchoolList(query: {
  page?: string;
  limit?: string;
  name?: string; //名称
  leaderPhone?: string; //电话
  provinceCode?: string; //省
  cityCode?: string; //市
  areaCode?: string; //区县
}) {
  return await request(`${USER_CENTER_PREFIX}/v1/company/pageByUserBinded`, 'GET', query);
}

//切换驾校
//http://192.168.192.132:3000/project/198/interface/api/20534
export async function _changeSchool(query: any) {
  const { id } = query;
  return await request(`${USER_CENTER_PREFIX}/user/${id}/company/default`, 'PUT');
}

// 获取验证码
export async function _getImgUrl() {
  return await request(`/uni/imagecode`, 'GET', {}, { mustAuthenticated: false });
}

// 获取token
// http://192.168.192.132:3000/project/218/interface/api/19834
export async function _getLogin(query: {
  grant_type: string; // 登录类型
  username: string; // 用户名/手机号
  password: string; // 	密码/验证码
  scop: string; // 固定
}) {
  return postRequestTemp(
    `/uni/oauth/token?grant_type=password&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&username=${query.username}&password=${query.password}`,
  );
}

// 忘记密码
// http://192.168.192.132:3000/project/218/interface/api/19848
export async function _forgetPassword(query: {
  userName: string; // 用户名-必填
  mobilePhone: string; // 手机号码-必填
  code: string; // 验证码-必填
  password: string; // 密码-必填
}) {
  return await request(`/uni/auth/password/forget`, 'POST', query, { mustAuthenticated: false, withFeedback: true });
}

// 修改密码
export async function _setPassword(query: {
  id: string;
  newPassword: string; // 新密码
  oldPassword: string; // 旧密码
}) {
  return await request(`/api/usercenter/user/password/set`, 'POST', query, {
    mustAuthenticated: false,
    // hasHeader: false,
  });
}

// 获取userId
// https://test.welldriver.cn:1445/api/usercenter/user/info/front?username=sdjnl118606501017
export async function _getUserId(query: { username: string }) {
  return await request(
    `/api/usercenter/user/info/front?username=${query.username}`,
    'GET',
    {},
    {
      mustAuthenticated: false,
    },
  );
}

// 获取认证信息(方超从APP拿来提供)
export async function _getCertify() {
  return await request(
    `api/usercenter/user/defaultCompany`,
    'GET',
    { userType: 'STUDENT' },
    { mustAuthenticated: false },
  );
}

interface IStudentCer {
  idcard: string; //身份证件号码
  cardtype?: string; // 证件类型(1-居民身份证 2-护照 3-军官证 4-其他)
  name: string; // 姓名
  traintype: string; // 培训车型   编码单选C1/C2等
  phone?: string; // 手机号码
  schoolId: string; // 驾校编码
}

// 提交学员认证信息
// http://192.168.192.132:3000/project/193/interface/api/18049
export async function _getStudentCer(query: IStudentCer) {
  return await request(`${CORE_PREFIX}/v1/student/checkStudentInfo`, 'GET', query, { mustAuthenticated: false });
}

// 查询培训机构简要信息（分页）
// http://192.168.192.132:3000/project/198/interface/api/20177
export async function _getSchoolInfo(query: { cityCode: string; name?: string }) {
  const params = { ...query, type: '3', initStatus: '1' }; // type: // 0--平台  1--第三方  2---监管  3--平台和第三方 initStatus:初始化状态  0-- 未初始化  1-已初始化
  const path = `${PORTAL_OPEN_API_PREFIX}/usercenter/v1/company/pageSimpleInfo`;
  const customHeader = _getOpenAPICustomHeader(path, params);

  return await request(path, 'GET', params, { mustAuthenticated: false, customHeader });
}

// 获取车辆类型的值
// http://192.168.192.132:3000/project/193/interface/api/18343
export async function _getCarList(query: { userSchIdSelected: string }) {
  const path = `${PORTAL_OPEN_API_PREFIX}/jp-train-core-svc/v1/sysbase/code/getSchoolBusiScopeCombo`;
  const customHeader = _getOpenAPICustomHeader(path, query);

  return await request(path, 'GET', query, {
    mustAuthenticated: false,
    customHeader,
  });
}

// 烟台门户提交学员认证信息
// http://192.168.192.132:3000/project/193/interface/api/27443
export async function _getCernNoLogin(query: IStudentCer) {
  const path = `${PORTAL_OPEN_API_PREFIX}/jp-train-core-svc/v1/student/checkStudentInfoForPortal`;
  const customHeader = _getOpenAPICustomHeader(path, query);

  return await request(path, 'GET', query, {
    mustAuthenticated: false,
    customHeader,
  });
}

// 门户用户注册并绑定学员信息
// http://192.168.192.132:3000/project/193/interface/api/27450
interface I_register {
  schid: string;
  sid: string;
  mobilePhone: string;
  password: string;
  code: string;
}
export async function _register(query: I_register) {
  const { schid, sid, ...rest } = query;
  const params = { ...query, type: 'MOBILE_PASSWORD' };
  const path = `${PORTAL_OPEN_API_PREFIX}/jp-train-core-svc/v1/student/register/user/${schid}/${sid}`;
  const customHeader = _getOpenAPICustomHeader(path, params);

  return await request(path, 'POST', params, {
    mustAuthenticated: false,
    customHeader,
  });
}

export async function _createToken() {
  return await request(
    `/uni/oauth/token?grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
    'POST',
    {},
    {
      mustAuthenticated: false,
    },
  );
}

// appCode: string; // 应用编码，后台指定（作为系统参数前台放在env里面可配）
// signName: string; // 签名值，后台指定（作为系统参数前台放在env里面可配）
// templateCode: string; // 短信模板编码，后台指定（作为系统参数前台放在env里面可配）

// 获取手机验证码
// http://192.168.192.132:3000/project/163/interface/api/27359
export async function _getCode(query: { mobilePhone: string }) {
  const params = {
    mobilePhone: query.mobilePhone,
    appCode: PORTAL_APP_CODE,
    signName: PORTAL_SIGN_NAME,
    templateCode: PORTAL_TEMPLATE_CODE,
  };
  const path = `${PORTAL_OPEN_API_PREFIX}/usercenter/user/v2/sms/code`;
  const customHeader = _getOpenAPICustomHeader(path, params);
  return await request(path, 'GET', params, {
    mustAuthenticated: false,
    customHeader,
  });
}

//openAPI customHeader
export function _getOpenAPICustomHeader(path: string, params: any) {
  const timestamp = new Date().getTime();
  let paramStr = '';
  for (const [key, value] of Object.entries(params)) {
    paramStr += `${key}=${value}`;
  }
  const signOrigin = `${CLIENT_ID}${path}${paramStr}${timestamp}`;
  const signature = (window && window.hex_hmac_md5 && window.hex_hmac_md5(CLIENT_SECRET, signOrigin)) || '';
  return {
    Authorization: Auth.get('openAPIToken'),
    timestamp,
    clientId: CLIENT_ID,
    signature,
  };
}

//查询学员信息
export async function _getBaseInfo(query: { userId: string }) {
  return await request(
    USER_CENTER_URL + `${CORE_PREFIX}/v1/student/getBaseInfo`,
    'GET',
    { userId: query.userId },
    { mustAuthenticated: false, customHeader: { schoolId: Auth.get('schoolId') } },
  );
}

//查询是否是学员
export async function _checkExistByUserName(query: { username: string }) {
  return await request(`/api/usercenter/userStudent/${query.username}/checkExistByUserName`, 'GET');
}

//文章管理 分页查询
/* portal_article_type	
1	通知公告	
2	办事指南	
3	行业动态	
4	政策法规	
5	行业风采	
6	驾校排行	
7	驾校动态	
8	驾校培训能力核定
9	驾校红榜	
10驾校黑榜
11教练红榜
12教练黑榜 */

export async function _getPortalArticleList(query: {
  isHomepageQuery?: string; //是否首页查询 0：否 1：是
  limit: number; //每页条数
  page: number; //前页
  publishTimeEnd?: any; //发布时间结束 yyyy-MM-dd
  publishTimeStart?: any; //发布时间开始 yyyy-MM-dd
  type?: string; //文章类型
  isHomepageShow?: string; //门户首页传1 门户其他不传，驾校后台不传
}) {
  const params = { ...query };
  const path = `${PORTAL_OPEN_API_PREFIX}/jp-portal-svc/v1/portalArticle/pageList`;
  const customHeader = _getOpenAPICustomHeader(path, params);
  return await request(path, 'GET', params, {
    mustAuthenticated: false,
    customHeader,
  });
}

//文章管理 详情
export async function _getPortalArticleDetail(query: { id: string }) {
  const params = query;
  const path = `${PORTAL_OPEN_API_PREFIX}/jp-portal-svc/v1/portalArticle/selectByKey`;
  const customHeader = _getOpenAPICustomHeader(path, params);
  return await request(path, 'GET', params, {
    mustAuthenticated: false,
    customHeader,
  });
}

//http://192.168.192.132:3000/project/233/interface/api/28003
export async function _getPortalSubjectList(query: {
  limit: number; //每页条数
  page: number; //前页
  type?: string; //栏目类型   1	轮播图2	友情链接3	公众号
  status?: string;
}) {
  const params = { ...query, status: '1' };
  const path = `${PORTAL_OPEN_API_PREFIX}/jp-portal-svc/v1/portalSubject/pageList`;
  const customHeader = _getOpenAPICustomHeader(path, params);
  return await request(path, 'GET', params, {
    mustAuthenticated: false,
    customHeader,
  });
}

//查询监管驾校列表
export async function _getSuperviseList(query: any) {
  const path = `${PORTAL_OPEN_API_PREFIX}/usercenter/v1/company/pageSimpleInfo`;
  const params = { ...query, cityCode: PORTAL_CITY_CODE, initStatus: '1', status: '1', authStatus: '1' };
  // initStatus=1过滤掉未初始化的驾校
  // status=1 过滤掉未备案的驾校
  // authStatus=1 过滤掉未认证驾校
  const customHeader = _getOpenAPICustomHeader(path, params);

  return await request(path, 'GET', params, {
    mustAuthenticated: false,
    customHeader,
  });
}

///openapi/usercenter/v1/codeList/getAreaCodes/{parentCodeKey}
export async function _getAreaCodes(query: any) {
  const path = `${PORTAL_OPEN_API_PREFIX}/usercenter/v1/codeList/getAreaCodes/${query.parentCodeKey}`;
  const customHeader = _getOpenAPICustomHeader(path, {});

  return await request(
    path,
    'GET',
    {},
    {
      mustAuthenticated: false,
      customHeader,
    },
  );
}

// 查询基础信息
// http://192.168.192.132:3000/project/198/interface/api/17608
export async function _getBasicInfo(query: {
  id: string; // 驾校id
}) {
  const path = `${PORTAL_OPEN_API_PREFIX}/usercenter/v1/company/${query.id}/basicInfoAfterCheckStatus`;
  const customHeader = _getOpenAPICustomHeader(path, query);

  return await request(path, 'GET', query, {
    mustAuthenticated: false,
    customHeader,
  });
}

// 查询培训机构图片
// http://192.168.192.132:3000/project/198/interface/api/17657
export async function _getImg(query: {
  id: string; // 驾校id
  permissionType?: number;
}) {
  const path = `${PORTAL_OPEN_API_PREFIX}/usercenter/v1/company/${query.id}/imgs`;
  const customHeader = _getOpenAPICustomHeader(path, query);

  return await request(path, 'GET', query, {
    mustAuthenticated: false,
    customHeader,
  });
}

export async function _getDicCode(query: any) {
  const path = `${PORTAL_OPEN_API_PREFIX}/jp-train-core-svc/v1/sysbase/code/get2`;
  const customHeader = _getOpenAPICustomHeader(path, query);

  return await request(path, 'GET', query, {
    mustAuthenticated: false,
    customHeader,
  });
}

// 查询驾校简介
export async function _getDesc(query: {
  companyId: string; // 驾校id
}) {
  const path = `${PORTAL_OPEN_API_PREFIX}/usercenter/v1/company/ext/getDesc/${query.companyId}`;
  const customHeader = _getOpenAPICustomHeader(path, {});

  return await request(
    path,
    'GET',
    {},
    {
      mustAuthenticated: false,
      customHeader,
    },
  );
}

// 查询教练信息列表根据区域编号
// http://192.168.192.132:3000/project/183/interface/api/29508
export async function _getCoachList(query: any) {
  const path = `${PORTAL_OPEN_API_PREFIX}/jp-train-noncore-svc/v1/coa/pageListCoachByCode`;
  const params = { ...query, cityCode: PORTAL_CITY_CODE };
  const customHeader = _getOpenAPICustomHeader(path, params);

  return await request(path, 'GET', params, {
    mustAuthenticated: false,
    customHeader,
  });
}

export async function _getCoachDetail(query: any, schoolId?: string) {
  const path = `${PORTAL_OPEN_API_PREFIX}/jp-train-noncore-svc/v1/coa/selectByKey`;
  const params = query;
  const customHeader = _getOpenAPICustomHeader(path, params);

  return await request(path, 'GET', params, {
    mustAuthenticated: false,
    customHeader: { ...customHeader, schoolId },
  });
}

//评价列表
// http://192.168.192.132:3000/project/233/interface/api/27401
export async function _getEvaluateList(query: any, schoolId?: string) {
  const path = `${PORTAL_OPEN_API_PREFIX}/jp-portal-svc/v1/stuEvaluation/studentPage`;
  const params = query;
  const customHeader = _getOpenAPICustomHeader(path, params);

  return await request(path, 'GET', params, {
    mustAuthenticated: false,
    customHeader: { ...customHeader, schoolId },
  });
  // return request(`/api/jp-portal-svc/v1/stuEvaluation/pageList`, 'GET', query);
}

// http://192.168.192.132:3000/project/233/interface/api/29592
// 分页查询栏目根据页面位置
export async function _getTplConfigList(query: any) {
  const path = `${PORTAL_OPEN_API_PREFIX}/jp-portal-svc/v1/portalItemConfig/selectItemConfigs`;
  const params = query;
  const customHeader = _getOpenAPICustomHeader(path, params);
  return await request(path, 'GET', params, {
    mustAuthenticated: false,
    customHeader: { ...customHeader },
  });
}

// http://192.168.192.132:3000/project/233/interface/api/29585
// 查询二级栏目
export async function _searchSubItemConfigs(query: {
  id: any; //栏目编号
  site: any; //页面位置
}) {
  const path = `${PORTAL_OPEN_API_PREFIX}/jp-portal-svc/v1/portalItemConfig/searchSubItemConfigs`;
  const params = query;
  const customHeader = _getOpenAPICustomHeader(path, params);
  return await request(path, 'GET', params, {
    mustAuthenticated: false,
    customHeader: { ...customHeader },
  });
}

// http://192.168.192.132:3000/project/233/interface/api/32763
// /v1/portalItemConfig/getConfigTree
export async function _getConfigTree(query: {
  site: any; //页面位置
}) {
  const path = `${PORTAL_OPEN_API_PREFIX}/jp-portal-svc/v1/portalItemConfig/getConfigTree`;
  const params = query;
  const customHeader = _getOpenAPICustomHeader(path, params);
  return await request(path, 'GET', params, {
    mustAuthenticated: false,
    customHeader: { ...customHeader },
  });
}

export async function _getTemplate(query: { page: any; limit: any }) {
  const path = `${PORTAL_OPEN_API_PREFIX}/jp-portal-svc/v1/portalTemplate/selectTemplates`;
  const params = query;
  const customHeader = _getOpenAPICustomHeader(path, params);
  return await request(path, 'GET', params, {
    mustAuthenticated: false,
    customHeader: { ...customHeader },
  });
}
// http://192.168.192.132:3000/project/198/interface/api/33386
// 根据驾校编号得到靠前排名的驾校
export async function _pageRankCompany() {
  const path = `${PORTAL_OPEN_API_PREFIX}/usercenter/v1/company/pageRankCompany`;

  const customHeader = _getOpenAPICustomHeader(path, {});
  return await request(
    path,
    'GET',
    {},
    {
      mustAuthenticated: false,
      customHeader: { ...customHeader },
    },
  );
}

// http://192.168.192.132:3000/project/183/interface/api/33568
// 查询教练信息列表
export async function _coaStartList() {
  const path = `${PORTAL_OPEN_API_PREFIX}/jp-train-noncore-svc/v1/coa/coaStartList`;

  const customHeader = _getOpenAPICustomHeader(path, {});
  return await request(
    path,
    'GET',
    {},
    {
      mustAuthenticated: false,
      customHeader: { ...customHeader },
    },
  );
}

// http://192.168.192.132:3000/project/223/interface/api/33575
// 查询培训机构、教练员、教练车、报名学员、培训学员的数量
export async function _queryStatistics(query: { queryDate: string }) {
  const path = `${PORTAL_OPEN_API_PREFIX}/jp-train-statistic-svc/v1/statisticCityInfo/queryStatistics`;
  const params = query;
  const customHeader = _getOpenAPICustomHeader(path, params);
  return await request(path, 'GET', params, {
    mustAuthenticated: false,
    customHeader: { ...customHeader },
  });
}
