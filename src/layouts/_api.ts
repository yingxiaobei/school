import { DATA_EXCHANGE_PREFIX } from './../constants/env';
import { request, postRequestTemp } from 'services';
import { USER_CENTER_PREFIX, PORTAL_OPEN_API_PREFIX, CORE_PREFIX } from 'constants/env';
import { Auth } from 'utils';

// 修改密码
// http://192.168.192.132:3000/project/218/interface/api/19855
export async function _updatePassword(query: {
  id: string; // 用户ID
  oldPassword: string; // 原密码
  newPassword: string; // 新密码
}) {
  return await request(`${USER_CENTER_PREFIX}/user/password/set`, 'POST', query, { withFeedback: true });
}
// 修改密码-有验证码
// http://192.168.192.132:3000/project/218/interface/api/19855
export async function _updatePasswordNew(query: {
  id: string; // 用户ID
  code: string; // 验证码
  mobile: string;
  // oldPassword: string; // 原密码
  newPassword: string; // 新密码
}) {
  return await request(`${USER_CENTER_PREFIX}/user/password/set/new`, 'POST', query);
}
//判断密码过期
export async function _getPwdStatus() {
  const name = Auth.get('username');
  return await request(`${USER_CENTER_PREFIX}/user/${name}/userLoginExpire`, 'GET', {});
}

//获取nacos配置 --获取是否配置了隐藏用户隐私信息
//新增nacso参数，hideUserSensitiveData 是否隐藏用户列表、导出中证件号、联系电话，00为全不隐藏，10代表为隐藏用户列表，不隐藏导出，01代表隐藏导出不隐藏列表，11代表全都隐藏

export async function _getNacosConfig() {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/common/getNacosParam?param=hideUserSensitiveData`, 'GET', {});
}

//查询驾校列表
//http://192.168.192.132:3000/project/198/interface/api/20611
export async function _getSchoolList(query: {
  page?: number;
  limit?: number;
  name?: string; //名称
  leaderPhone?: string; //电话
  provinceCode?: string; //省
  cityCode?: string; //市
  areaCode?: string; //区县
  idcard?: string; // 学员证件号
  coaIdcard?: string; // 教练证件号
  plateNum?: string; // 车牌号
  studentPhone?: string;
  coaPhone?: string;
}) {
  return await request(`${USER_CENTER_PREFIX}/v1/company/pageByUserBindedX`, 'GET', query);
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
    `/uni/oauth/token?grant_type=password&client_id=1609751776011&client_secret=4b8e11219959d6753874e8d156cc4d6b&username=${query.username}&password=${query.password}`,
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
  return await request(`/uni/auth/password/forget`, 'POST', query, { mustAuthenticated: false });
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
  return await request(
    `/api/usercenter/v1/company/pageSimpleInfo`,
    'GET',
    { ...query, type: '3', initStatus: '1' }, // type: // 0--平台  1--第三方  2---监管  3--平台和第三方 initStatus:初始化状态  0-- 未初始化  1-已初始化
    { mustAuthenticated: false },
  );
}

// 获取车辆类型的值
// http://192.168.192.132:3000/project/193/interface/api/18343
export async function _getCarList(query: { userSchIdSelected: string }) {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getSchoolBusiScopeCombo`, 'GET', query, {
    mustAuthenticated: false,
  });
}

// 烟台门户提交学员认证信息
// http://192.168.192.132:3000/project/193/interface/api/27443
export async function _getCernNoLogin(query: IStudentCer) {
  return await request(`${CORE_PREFIX}/v1/student/checkStudentInfoForPortal`, 'GET', query, {
    mustAuthenticated: false,
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
  return await request(
    `${PORTAL_OPEN_API_PREFIX}/jp-train-core-svc/v1/student/register/user/${schid}/${sid}`,
    'POST',
    { ...rest, type: 'MOBILE_PASSWORD' },
    {
      mustAuthenticated: false,
    },
  );
}
