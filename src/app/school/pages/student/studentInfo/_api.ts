import { request } from 'services';
import { CORE_PREFIX, NOT_CORE_PREFIX, DATA_EXCHANGE_PREFIX, STATISTIC_PREFIX } from 'constants/env';
import { _get } from 'utils';
import { Template } from '../../trainingInstitution/contractTemplate/_api';

interface I_getPageListStuKeyinfoChange extends IPaginationParams {
  sid: string;
}

// 查询学员详细信息
// http://192.168.192.132:3000/project/193/interface/api/12736
export async function _getDetails(query: { id: string }, customHeader: any) {
  return await request(`${CORE_PREFIX}/v1/student/selectByKey`, 'GET', query, { customHeader });
}

// 查看详情-预报名审核
// http://192.168.192.132:3000/project/193/interface/api/12638
export async function _getReviewDetails(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/schStudentForecast/selectByKey`, 'GET', query);
}

// 注销学员
// http://192.168.192.132:3000/project/193/interface/api/16362
export async function _deleteStudent(query: { id: string }) {
  return await request(
    `${CORE_PREFIX}/v1/student/update/${query.id}`,
    'PUT',
    {},
    // { customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn4' } },
  );
}

// 新增学员信息
// http://192.168.192.132:3000/project/193/interface/api/16292
export async function _addStudent(query: {
  name: string; // 姓名
  sex: string; // 性别 1:男性;2:女性  0:未知
  cardtype: string; // 证件类型(1-居民身份证 2-护照 3-军官证 4-其他)
  idcard: string; // 身份证件号码
  nationality: string; // 国籍(应符合GB/T2659)
  phone: string; // 手机号码
  address: string; // 联系地址
  head_img_oss_id: string; // 学员头像图片
  busitype: string; // 业务类型 0:初领 1:增领 9:其他
  drilicnum?: string; // 驾驶证号
  fstdrilicdate?: string; // 驾驶证初领日期YYYY-MM-DD
  perdritype?: string; // 原准驾车型，编码单选C1/C2等
  traintype?: string; // 培训车型   编码单选C1/C2等
  applydate: string; // 报名日期    YYYY-MM-DD
  schoolid: any;
  iccardcode: string; //学员卡/身份证卡号
}) {
  return await request(`${CORE_PREFIX}/v1/student/save`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn1' },
  });
}

// 编辑学员信息
// http://192.168.192.132:3000/project/193/interface/api/16306
export async function _updateStudent(query: {
  name: string; // 姓名
  sex: string; // 性别 1:男性;2:女性  0:未知
  cardtype: string; // 证件类型(1-居民身份证 2-护照 3-军官证 4-其他)
  idcard: string; // 身份证件号码
  nationality: string; // 国籍(应符合GB/T2659)
  phone: string; // 手机号码
  address: string; // 联系地址
  head_img_oss_id: string; // 学员头像图片
  busitype: string; // 业务类型 0:初领 1:增领 9:其他
  drilicnum?: string; // 驾驶证号
  fstdrilicdate?: string; // 驾驶证初领日期YYYY-MM-DD
  perdritype?: string; // 原准驾车型，编码单选C1/C2等
  traintype?: string; // 培训车型   编码单选C1/C2等
  applydate: string; // 报名日期    YYYY-MM-DD
  sid: string; // 学员主键
  fileType?: string; // 业务类型 驾校 schoolregister 学员 studentregister 教练 coachregister   车辆 carregister 学员人脸 studentface  教练人脸coachface 考核员注册 examinemanregister   安全员注册 securemanregister   二维码 Qrcode
}) {
  return await request(`${CORE_PREFIX}/v1/student/updateByKey`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn3' },
  });
}

// 学员绑定培训机构-转校
// http://192.168.192.132:3000/project/193/interface/api/12764
export async function _changeSchool(query: { sid: string; schoolid: string }) {
  return await request(`${CORE_PREFIX}/v1/student/updateSchool`, 'PUT', query);
}

// 绑定二代证
// http://192.168.192.132:3000/project/193/interface/api/12750
export async function _bindCard(query: {
  sid: string;
  iccardcode?: string; // IC卡号
  userid: any; //用户中心主键
  realName?: string; //真实姓名
  certNum: string; //身份证号
  certCardNum: string; //身份证卡号
}) {
  return await request(`${CORE_PREFIX}/v1/student/updateIdCadeCode`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn7' },
  });
}

export type ClassList = {
  total: number;
  rows: {
    packid: string;
    registered_flag: string;
    note: string;
    traintype: string;
    status_cd: string;
    train_price_online: number;
    studenttype: string;
    packlabel: string;
    train_price: number;
  }[];
};

// 查询班级列表 分页展示班级信息
// http://192.168.192.132:3000/project/183/interface/api/14234
export async function _getClassList(
  query: {
    page: number;
    limit: number;
    packlabel?: string; // 班级名称
    traintype?: string; // 培训车型 编码单选C1/C2等
    studenttype?: string; // 学员类型 0:正常学员 1:转入学员  2:大货从业资格
    isEffective?: number;
    isOnline?: number; // 0 所有 1 线上 2 线下
    isEnabled?: number; // 0 所有班级 1 查 启用过 的班级
  },
  customHeader?: any,
) {
  return await request(`${NOT_CORE_PREFIX}/v1/schSchoolPackage/pageList`, 'GET', query, { customHeader });
}

// 查询教练员列表--下拉框
// http://192.168.192.132:3000/project/183/interface/api/18357
export async function _getCoachList(query: Record<string, any>) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageListCoach`, 'GET', {
    ...query,
    registered_Flag: '2',
    employstatus: '01',
  });
}

export type Coach = {
  coachname: string;
  cid: string;
  originName: string;
  hitIndexes?: number[];
};

// C1转C2车型
// http://192.168.192.132:3000/project/193/interface/api/19785
export async function _transformCarType(query: { id: string; package_id?: string; package_name?: string }) {
  return await request(
    `${CORE_PREFIX}/v1/student/${query.id}/changeCarType`,
    'PUT',
    { package_id: query.package_id, package_name: query.package_name },
    {
      withFeedback: true,
      customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn8' },
    },
  );
}

// registered-(备案)
// http://192.168.192.132:3000/project/193/interface/api/19673
export async function _registered(query: { id: string; withFeedback: boolean }) {
  const { withFeedback = true } = query;
  return await request(
    `${CORE_PREFIX}/v1/student/registered`,
    'POST',
    { id: query.id },
    {
      withFeedback: withFeedback,
      customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn6' },
    },
  );
}

// 驾校侧可编辑的合同数据项
// http://192.168.192.132:3000/project/193/interface/api/18749
export function _getSchContractTemp(query: { sid: string }) {
  return request<{
    cartype: string;
    memo: string;
    schContractTempitemList: Template[];
  }>(`${CORE_PREFIX}/v1/stuSigncontract/getSchContractTemp`, 'GET', query);
}

// 生成学员合同模板
// http://192.168.192.132:3000/project/193/interface/api/18777
export async function _stuSignContract(query: {
  sid: string;
  cartype: string; //经营车型,C1,C2
  tempid: any;
  schContractTempitemList: any;
  memo?: string;
}) {
  return await request(`${CORE_PREFIX}/v1/stuSigncontract/save`, 'POST', query, {
    withFailedFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn5' },
  });
}

// 学员合同生成过程中的模板预览
// http://192.168.192.132:3000/project/193/interface/api/18756
export async function _previewContract(query: {
  sid: string;
  cartype: string; //经营车型,C1,C2
  tempid: any;
  schContractTempitemList: any;
  memo?: string;
}) {
  return await request(`${CORE_PREFIX}/v1/stuSigncontract/previewDoing`, 'POST', query, {
    responseType: 'arraybuffer',
  });
}

// 查询班级详情- 根据班级主键查询并返回班级课程实体对象
// http://192.168.192.132:3000/project/193/interface/api/25441
export async function _getClassDetail(query: { sid: string }, customHeader: any) {
  return await request(`${CORE_PREFIX}/v1/student/selectStuChargeStandardBySid`, 'GET', query, { customHeader });
}

// 查询班级详情- 根据班级主键查询并返回班级课程实体对象
// http://192.168.192.132:3000/project/183/interface/api/14248
export async function _previewContractFile(query: { sid: string }, customHeader: any) {
  return await request(`${CORE_PREFIX}/v1/stuSigncontract/previewContractFile`, 'GET', query, { customHeader });
}

// 电子档案--培训考核单
// http://192.168.192.132:3000/project/193/interface/api/17293
export async function _trainExam(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/student/getStageReport`, 'GET', query);
}

// 电子档案--结业证书
// http://192.168.192.132:3000/project/193/interface/api/17300
export async function _getFileUrl(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/student/getGraduateReport`, 'GET', query);
}

// 学员所有培训科目学时信息
// http://192.168.192.132:3000/project/193/interface/api/20660
export async function _getStudentTrain(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/stuStagetrainningTime/stuStageGroupTrainning/${query.sid}`, 'GET', {});
}

// 预报名审核(预报名审核-审核并注册)
// http://192.168.192.132:3000/project/193/interface/api/16285
export async function _updateByKeyForExam(query: {}) {
  return await request(`${CORE_PREFIX}/v1/schStudentForecast/updateByKeyForExam`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'forecastReview', elementId: 'student/forecastReview:btn2' },
  });
}

//是否是一次性冻结、预约冻结的学员
//http://192.168.192.132:3000/project/193/interface/api/20814
export async function isFreezingModeStudent(query: { sid: string }, customHeader?: unknown) {
  return await request(`${CORE_PREFIX}/v1/student/isFreezingModeStudent/`, 'GET', query, { customHeader });
}

//是否显示获取远程教育学时按钮
//http://192.168.192.132:3000/project/193/interface/api/20807
export async function showNetworkTimeButton(query?: unknown, customHeader?: unknown) {
  return await request(`${CORE_PREFIX}/v1/student/showNetworkTimeButton`, 'GET', {}, { customHeader });
}

//获取学员远程教育学时
//http://192.168.192.132:3000/project/183/interface/api/20821
export async function getStudentNetworkTime(query: { stuid: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/getStudentNetworkTime`, 'GET', query, {
    withFeedback: true,
  });
}

//用户敏感信息项目列表
//http://192.168.192.132:3000/project/193/interface/api/20800
export async function getKeyInfos() {
  return await request(`${CORE_PREFIX}/v1/student/keyinfos`, 'GET');
}

//用户备案信息项目列表
//http://192.168.192.132:3000/project/193/interface/api/20926
export async function getReginfos() {
  return await request(`${CORE_PREFIX}/v1/student/reginfos`, 'GET');
}

// 查询点卡余额
// http://192.168.192.132:3000/project/203/interface/api/21633
export async function getCardMoney(query: {
  accounttype: any; // 账户类型 00:普通 10-代理商
  operator: String; // 操作人 编码+姓名+证件号码
}) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/welleams/queryaccountbalance`, 'POST', query);
}

// 查询所有所有点卡
// http://192.168.192.132:3000/project/203/interface/api/27877
export async function _getAllCardMoney(query: { accountType: '00' | '10' }) {
  return await request(`${DATA_EXCHANGE_PREFIX}/v1/welleams/wallet/queryAccountBalanceAll`, 'GET', query, {
    customHeader: { customSchoolId: '' },
  });
}

export type SubAccount = {
  accountBalance: string; // 账户余额
  isValid: '0' | '1'; // 状态 0:锁定；1:启用
  memo: string; // 账户备注
  queryTime: string; // 查询时间
  ratio: string; // 兑换比例
  subAccountName: string; // 子账户名称
  subAccountNum: string; // 子账户信息编号
  subAccountType: string; // 子账户类型 00:点卡账户 01:IC卡(始) 02:IC卡(补) 03:教练虚拟点卡 04:积分
  unit: string; // 单位 0:个数；1:元；
  unitPrice: string; // 单价
  msg: string; // //如果驾校剩余名额剩余-1，展示错误信息
};

// 导出学员Excel
// http://192.168.192.132:3000/project/193/interface/api/22767
export async function _export(query: {
  applydatebegin: string; // 报名开始时间 YYYY-MM-DD
  applydateend: string; // 报名截止时间 YYYY-MM-DD
  busitype?: string; //业务类型
  traintype?: string; //培训车型
  status?: string; //学员状态
}) {
  return await request(`${CORE_PREFIX}/v1/student/export`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

// 导出学员Excel查询
// http://192.168.192.132:3000/project/183/interface/api/23131
export async function _exportStudentBefore(query: {
  applydatebegin: string; // 报名开始时间 YYYY-MM-DD
  applydateend: string; // 报名截止时间 YYYY-MM-DD
  busitype?: string; //业务类型
  traintype?: string; //培训车型
  status?: string; //学员状态
}) {
  return await request(`${CORE_PREFIX}/v1/student/exportStudentBefore`, 'GET', query);
}

//开户
//http://192.168.192.132:3000/project/193/interface/api/22627
export async function _openAccount(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/student/account/open`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn12' },
  });
}

//充值
//http://192.168.192.132:3000/project/193/interface/api/22634
export async function _accountFund(query: { sid: string; operAmount: number; memo?: string }) {
  return await request(`${CORE_PREFIX}/v1/student/account/fund`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn13' },
  });
}

//账户信息
//http://192.168.192.132:3000/project/193/interface/api/22606
export async function _queryAccountInfo(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/student/account/queryInfo`, 'GET', query);
}

// 获取转入学员豆腐块
// http://192.168.192.132:3000/project/193/interface/api/23943
export async function _getTransfer(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/student/transfer/rule/list`, 'GET', query);
}

// 基于车型获取业务类型combo
// http://192.168.192.132:3000/project/193/interface/api/23887
export async function _getTrainType(query: { traintype?: string }) {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getBusiTypeComboForTraintype/${query.traintype}`, 'GET');
}

// 学员报名场景，在学员档案菜单，新增/编辑表单中可选的驾校车型经营范围combo
// http://192.168.192.132:3000/project/193/interface/api/22179
export async function _getTrainCar(query: { schId: string }) {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getSchoolBusiScopeComboForSignup/${query.schId}`, 'GET');
}

//上传签名
//http://192.168.192.132:3000/project/193/interface/api/18784
export async function _submitStuSignature(query: { fileid: string; sid: string; flag?: string }) {
  return await request(`${CORE_PREFIX}/v1/stuSigncontract/submitStuSignature`, 'PUT', query, { withFeedback: true });
}

//学员合同文件预览
//http://192.168.192.132:3000/project/193/interface/api/18763
export async function _getContractFile(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/stuSigncontract/previewContractFile`, 'GET', query);
}

// 变更身份认证关闭标志
// http://192.168.192.132:3000/project/193/interface/api/24650
export async function _updateStuIdauth(query: {
  sid: string; // 主键id
  idauthcloseddeadline: string; // 身份认证关闭标志截止日期 YYYY-MM-DD
  idauthclosed: string; // 身份认证关闭标志  0-开启, 1-关闭
}) {
  return await request(`${CORE_PREFIX}/v1/student/updateStuIdauth`, 'PUT', query);
}

//新增受理学员信息
//http://192.168.192.132:3000/project/193/interface/api/24447
export async function _addSchStudentAcceptinfo(query: any) {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/save`, 'POST', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/forecastExpected:btn1' },
  });
}

//http://192.168.192.132:3000/project/193/interface/api/24468
//编辑受理学员信息
export async function _updateSchStudentAcceptinfo(query: any) {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/updateByKey`, 'PUT', query, {
    withFeedback: true,
    customHeader: { menuId: 'studentInfo', elementId: 'student/forecastExpected:btn2' },
  });
}

//培训机构下拉框
//http://192.168.192.132:3000/project/193/interface/api/24433
export async function _getListAssociated() {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/getListAssociated`, 'GET');
}

export type SchoolsBySignUp = {
  total: number;
  rows: {
    text: string;
    value: string;
  }[];
};

//查看受理学员详情
//http://192.168.192.132:3000/project/193/interface/api/24461
export async function _getPreSignUpDetail(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/selectByKey`, 'GET', query);
}

//学员受理预报名车型
export async function _getPreSignUpTrainCarBySchool(query: { schId: string }) {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getSchoolBusiScopeComboForAccept/${query.schId}`, 'GET');
}

//http://192.168.192.132:3000/project/193/interface/api/24601
export async function _getPreSignUpTrainCar() {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/getStuAcceptTrainType`, 'GET');
}

//审核学员
//http://192.168.192.132:3000/project/193/interface/api/24419
export async function _checkStudent(query: { checkmemo: string; checkstatus: string; sid: string }) {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/checkStudent`, 'POST', query, {
    withFeedback: true,
  });
}

//http://192.168.192.132:3000/project/193/interface/api/24454
// 转正受理学员为正式学员
export async function _confirmStudent(query: any) {
  return await request(`${CORE_PREFIX}/v1/schStudentAcceptinfo/saveStudent`, 'POST', query, {
    withFeedback: true,
  });
}

// 查看学员申请表
// http://192.168.192.132:3000/project/193/interface/api/24895
export async function _getDriveTrainApplyReport(query: any) {
  return await request(`${CORE_PREFIX}/v1/student/getDriveTrainApplyReport`, 'GET', query);
}

// 学员电子教学日志报表访问地址接口
// http://192.168.192.132:3000/project/193/interface/api/24881
export async function _getTrainClassReport(query: {
  id: string; // 学员编码sid
  subject: string; // subject	科目编码 ， 1-科目1、2-科目2、3-科目3、4-科目
}) {
  return await request(`${CORE_PREFIX}/v1/student/getTrainClassReport`, 'GET', query);
}

// 监管地址配置0：国交 1：至正
// http://192.168.192.132:3000/project/193/interface/api/25448
export async function _getJGRequestPlatformType(query: {}, customHeader: any) {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getJGRequestPlatformType`, 'GET', {}, { customHeader });
}
//学员电子教学日志报表访问地址接口_copy
//http://192.168.192.132:3000/project/193/interface/api/25455
export async function _getStuStageReportStageTaoda(query: {
  sid: string; // 学员编码sid
}) {
  return await request(`${CORE_PREFIX}/v1/studentReport/getStuStageReportStageTaoda/${query.sid}`, 'GET', {});
}

//http://192.168.192.132:3000/project/193/interface/api/25693
export async function _getStuClassRecordReportStageTaoda(query: {
  sid: string; // 学员编码sid
}) {
  return await request(`${CORE_PREFIX}/v1/studentReport/getStuClassRecordReportStageTaoda/${query.sid}`, 'GET');
}

//http://192.168.192.132:3000/project/193/interface/api/25693
export async function _getStuClassRecordReportStageTaodaSubject(query: {
  sid: string; // 学员编码sid
  subject: any;
}) {
  return await request(
    `${CORE_PREFIX}/v1/studentReport/getStuClassRecordReportStageTaoda/${query.sid}/${query.subject}`,
    'GET',
    {},
  );
}

// 学员转校申请审核结果
// http://192.168.192.132:3000/project/193/interface/api/25812
export async function _getChangeSchoolResult(query: {
  sid: string; // 学员编码sid
}) {
  return await request(`${CORE_PREFIX}/v1/student/getChangeSchoolResult`, 'GET', query, { withFeedback: true });
}

// 学员转校申请(本市)
// http://192.168.192.132:3000/project/193/interface/api/25833
export async function _stuChangeSchoolApply(query: {
  sid: string; // 学员编码sid
}) {
  return await request(`${CORE_PREFIX}/v1/student/stuChangeSchoolApply`, 'GET', query, { withFeedback: true });
}

// 查询转校审核开关
// http://192.168.192.132:3000/project/193/interface/api/25868
export async function _getChangeSchoolAuditSwitch() {
  return await request(`${CORE_PREFIX}/v1/sysbase/code/getChangeSchoolAuditSwitch`, 'GET');
}

// 查询驾校的已开户银行渠道
// http://192.168.192.132:3000/project/193/interface/api/25686
export async function _getOpenAccount() {
  return await request(`${CORE_PREFIX}/v1/account/querySchoolAreadyOpenAccount`, 'GET');
}

// 查看学员旧版三联单-省内
// http://192.168.192.132:3000/project/193/interface/api/26526
export async function _getStuStageReportForLastVersion(query: {
  sid: string; // 学员编码sid
}) {
  return await request(`${CORE_PREFIX}/v1/studentReport/getStuStageReportForLastVersion/${query.sid}`, 'GET', {});
}

// 查看从业资格申请表
// http://192.168.192.132:3000/project/193/interface/api/26876
export async function _getEmploymentApplyReport(query: {
  sid: string; // 学员编码sid
}) {
  return await request(`${CORE_PREFIX}/v1/studentReport/getEmploymentApplyReport`, 'GET', query);
}

// 获取监管平台学时
// http://192.168.192.132:3000/project/193/interface/api/28745
export async function _getTransTime(query: {
  sid: string; // 学员编码sid
}) {
  return await request(`${CORE_PREFIX}/v1/student/getTransferrecordAndStageApply`, 'GET', query, {
    withFeedback: true,
  });
}

// http://192.168.192.132:3000/project/193/interface/api/29354
// 下载学员合同
export async function _downLoadStuSigncontract(query: {
  sid: string; // 学员编码sid
}) {
  return await request(`${CORE_PREFIX}/v1/stuSigncontract/downLoad`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

// http://192.168.192.132:3000/project/193/interface/api/29368
// 下载学员结业证
export async function _downLoadGraduateReport(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/student/downLoadGraduateReport`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

// http://192.168.192.132:3000/project/193/interface/api/29375
// 下载电子培训部分记录表（四联单）
export async function _downLoadStageReport(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/student/downLoadStageReport`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

// http://192.168.192.132:3000/project/193/interface/api/29382
// 下载学员阶段部分教学日志表
export async function _downLoadTrainClassReport(query: { id: string; subject: string }) {
  return await request(`${CORE_PREFIX}/v1/student/downLoadTrainClassReport`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

// http://192.168.192.132:3000/project/193/interface/api/29361
// 下载学员申请表
export async function _downLoadDriveTrainApplyReport(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/student/downLoadDriveTrainApplyReport`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

// http://192.168.192.132:3000/project/193/interface/api/29389
// 下载学员旧版三联单-省内
export async function _downLoadStuStageReportForLastVersion(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/studentReport/downLoadStuStageReportForLastVersion`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}
//从业证件申领登记表
export async function _downLoadEmploymentApplyReport(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/studentReport/downLoadDriveTrainApplyReport`, 'GET', query, {
    responseType: 'arraybuffer',
  });
}

//监管注销
export async function _cancelStuLation(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/student/cancelStuLation/${query.sid}`, 'PUT', query, {
    customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn25' },
  });
}

// http://192.168.192.132:3000/project/193/interface/api/29487
// 判断是否允许驾校上传合同
export async function _getSchoolAuth(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/student/getSchoolAuth`, 'GET', query);
}

//查询教练员列表-下拉框
//http://192.168.192.132:3000/project/183/interface/api/18357
export async function _getCoachListData(query: { coachname?: string; idcard?: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/coa/pageListCoach`, 'GET', query);
}

// http://192.168.192.132:3000/project/193/interface/api/33589
// 重新推送结业信息到鸿阳
export async function _pushToHongYang(query: {
  sid: string;
  trainType: string;
  birthday: string;
  fstdrilicdate: string; //初领日期
  idcard: string;
  name: string;
  sex: string;
  thirdType: string;
}) {
  return await request(`${CORE_PREFIX}/v1/student/pushToHongyang`, 'POST', query, { withFeedback: true });
}

// http://192.168.192.132:3000/project/193/interface/api/35849
// 查询学员信息变更记录
export function _getPageListStuKeyinfoChange(query: I_getPageListStuKeyinfoChange) {
  return request<any>(`${CORE_PREFIX}/v1/student/stuPageListKeyinfoChange`, 'GET', query);
}

// http://192.168.192.132:3000/project/148/interface/api/36287
// 考试结果分页列表
export async function _getExamResultList(query: { stuId: string; page: number; limit: number }) {
  return await request(`${NOT_CORE_PREFIX}/v1/robot/exam/result/pageList`, 'GET', query);
}

// http://192.168.192.132:3000/project/148/interface/api/36287
// 考试结果分页列表
export async function _getListExamMark(query: { examId: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/robot/exam/result/listExamMark`, 'GET', query);
}

// 查询是否开启机器人
export async function _getIsOpenRobot(query: { id: string }) {
  return await request(`/api/usercenter/v1/company/${query.id}/businessInfo`, 'GET');
}

// 查询机器人课程视频套餐下的所有课程
// http://192.168.192.132:3000/project/163/interface/api/36158
export async function _getRobotCourse(query: { id: string }) {
  return await request(`/api/usercenter/v1/company/teachVideo/${query.id}`, 'GET');
}

// 查看学员考试成绩
// http://192.168.192.132:3000/project/193/interface/api/36563
export async function _getStudentTestInfo(query: { limit: number; page: number; sid: string }) {
  return await request(`${CORE_PREFIX}/v1/student/getStudentTestInfo`, 'GET', query);
}

//理论教学日志
//http://192.168.192.132:3000/project/183/interface/api/37684
export async function _getStatisticTheoryClassRecord(query: { sid: string; customSchoolId?: string }) {
  return await request(
    `${NOT_CORE_PREFIX}/v1/studentClassrecord/statisticTheoryClassRecord`,
    'GET',
    { sid: query.sid },
    {
      customHeader: { customSchoolId: _get(query, 'customSchoolId', '') },
    },
  );
}

//更换班级
//http://192.168.192.132:3000/project/193/interface/api/39434
export async function _updatePackageByKey(query: {
  sid: string;
  package_id: string;
  package_name: string;
  bankaccount?: string;
  bankchannelid?: string;
  db?: string;
}) {
  return await request(`${CORE_PREFIX}/v1/student/updatePackageByKey`, 'PUT', query);
}

//学员销户
//http://192.168.192.132:3000/project/193/interface/api/39429
export async function _studentCancelAccount(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/student/studentCancelAccount`, 'PUT', query);
}

export async function _fixMinData(query: { sid: string; subject: any }) {
  const { subject, sid } = query;
  return await request(
    `${CORE_PREFIX}/v1/stuStageApply/build/abnormalData/fixMinData2/${subject}`,
    'POST',
    { sid: sid },
    {
      withFeedback: true,
    },
  );
}

// 清空学员统一编码
// http://192.168.192.132:3000/project/193/interface/api/39679
export async function _deleteStudentNum(sid: string) {
  return await request(`${CORE_PREFIX}/v1/student/deleteStudentNum/${sid}`, 'DELETE');
}

// 学员切换浙里办
// http://192.168.192.132:3000/project/193/interface/api/40924
export async function _studentChangeZLB(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/student/studentChangeZLB`, 'PUT', query);
}

// 根据班级选择银行渠道
// http://192.168.192.132:3000/project/193/interface/api/42489
export async function _querySchoolAccount(query: { package_id: string; cid: string }) {
  return await request(`${CORE_PREFIX}/v1/account/querySchoolAccountForLibrary`, 'GET', query, {
    customHeader: { withFailedFeedback: true },
  });
}

export type SchoolAccount = {
  acctBankName: string; // 渠道名称
  acctNo: string; // 开户账号
  bankChannelId: string; // 用户标识
  rakeBack: string; // 是否支持返佣
  status: 0 | 1; // 是否开户 （0为开户 1已开户）
  userFlag: string; // 用户标识
};

// 查看镇江学员附件
// http://192.168.192.132:3000/project/193/interface/api/42539
export async function _getReportPdfidForZhenjiang(query: { id: string }) {
  return await request(`${CORE_PREFIX}/v1/student/getReportPdfidForZhenjiang`, 'GET', query);
}

// C2转C1
// http://192.168.192.132:3000/project/193/interface/api/42934
export async function _C2ToC1(query: { id: string; package_id?: string; package_name?: string }) {
  return await request(
    `${CORE_PREFIX}/v1/student/${query.id}/changeCarTypeToC1`,
    'PUT',
    { package_id: query.package_id, package_name: query.package_name },
    {
      withFeedback: true,
      customHeader: { menuId: 'studentInfo', elementId: 'student/studentInfo:btn35' },
    },
  );
}

//转换车型时可选班级列表
//http://192.168.192.132:3000/project/193/interface/api/46950
export async function _getPackageIdForChangeCar(query: { sid: string; traintype: string }) {
  return await request(`${CORE_PREFIX}/v1/student/getPackageIdForChangeCar`, 'GET', query);
}

//学时汇总
export async function _getStatisticSum(query: { sid: string }) {
  return await request(`${NOT_CORE_PREFIX}/v1/studentClassrecord/statistic/${query.sid}`, 'POST');
}

// http://192.168.192.132:3000/project/193/interface/api/49056
// 根据班级查询默认银行渠道
export async function _queryDefaultChannelByPackage(query: { package_id: string; cid?: string }) {
  return await request(`${CORE_PREFIX}/v1/account/queryDefaultChannelByPackage`, 'GET', query, {
    withFailedFeedback: true,
  });
}

/***
 * @description 自定义字段
 *
 */
export interface InputRule {
  createTime: string;
  createUser: string;
  detailStatus: string;
  exportStatus: string;
  id: string;
  name: string;
  nameValue: string;
  regionId: string;
  requiredStatus: string;
  selectStatus: string;
  status: string;
  strlen: number;
  updateStatus: string;
  updateTime: string;
  updateUser: string;
  queryType: string; // 表单输入 还是下拉输入
  codeType: string;
}
export function _getInputRule(query: { schoolId: string }) {
  return request<InputRule[]>(`/api/usercenter/v1/region/common/config/input/rule/school`, 'GET', query);
}

// 查询银行显示内容信息
//http://192.168.192.132:3000/project/193/interface/api/22753
export async function _getSchoolInfo(query: { sid: string }) {
  return await request(`${CORE_PREFIX}/v1/student/account/queryInfo`, 'GET', query);
}

interface RecordList extends IPaginationParams {
  serviceName?: string; // 服务标识
  startLogTime?: string; // 查询开始时间
  endLogTime?: string; // 查询结束时间
}

// 查询服务错误日志分页数据
// http://192.168.192.132:3000/project/183/interface/api/51138
export async function _getRecordListLog(query: RecordList) {
  return await request(`${STATISTIC_PREFIX}/v1/serviceError/serviceErrorRecord/page`, 'GET', query);
}

/**
 * @description 理论审核
 * {@link http://192.168.192.132:3000/project/193/interface/api/54504}
 * @since 1.0.70.0
 */
export function _checkTheoryBatch(query: { sids: string[] }) {
  return request(`${CORE_PREFIX}/v1/student/checkTheoryBatch`, 'PUT', query, { withFeedbackAll: false });
}

/**
 * @description 判断学员换车型是否需要扣点卡
 * {@link http://192.168.192.132:3000/project/193/interface/api/55644}
 * @since east
 */
export function _checkChangeCarNeedDeductCard(query: { sid: string; trainType: string }) {
  return request<boolean>(`${CORE_PREFIX}/v1/student/checkChangeCarNeedDeductCard`, 'GET', query);
}

/***
 * @description 判断编辑学员是否需要扣点卡
 * {@link http://192.168.192.132:3000/project/193/interface/api/55638}
 * @since east
 */
export function _checkEditStuInfoNeedDeductCard(query: {
  sid: string;
  idcard: string;
  trainType: string;
  busiType: string;
  studentType: string;
}) {
  return request<boolean>(`${CORE_PREFIX}/v1/student/checkEditStuInfoNeedDeductCard`, 'GET', query);
}

// 校验学时资金是否一致
export function _checkAlreadySettlementAmount(query: { sid: string }) {
  return request<boolean>(`${CORE_PREFIX}/v1/stuOrderSettlement/checkAlreadySettlementAmount`, 'GET', query);
}

// 补学时
export function _addSettlementAmount(query: { sid: string }) {
  return request<boolean>(`${CORE_PREFIX}/v1/stuOrderSettlement/addSettlementAmount`, 'GET', query);
}

// 更新学员建档基本信息
// http://192.168.192.132:3000/project/193/interface/api/56594
export function _updateStuDepositInfo(query: { id: string }) {
  return request<boolean>(`${CORE_PREFIX}/v1/student/updateStuDepositInfo/${query.id}`, 'PUT');
}

//保存证明文件
//http://192.168.192.132:3000/project/193/interface/api/56610
export function _saveCertFile(query: any) {
  return request(`${CORE_PREFIX}/v1/stuStudentExtinfo/saveStudyCertificate`, 'POST', query, { withFeedback: true });
}

//查看证明文件
//http://192.168.192.132:3000/project/193/interface/api/56614
export function _getStudyCertificateInfo(query: any) {
  return request(`${CORE_PREFIX}/v1/stuStudentExtinfo/getStudyCertificateInfo`, 'GET', query);
}
