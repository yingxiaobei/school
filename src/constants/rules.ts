const LEN6 = { pattern: /^.{1,6}$/, message: '输入内容需在6字符以内' };
const LEN8 = { pattern: /^.{1,8}$/, message: '输入内容需在8字符以内' };
const LEN10 = { pattern: /^.{1,10}$/, message: '输入内容需在10字符以内' };
const LEN20_NUMERICAL = { pattern: /^[\d]{1,20}$/, message: '数值型，20个字符以内' };
const LEN15 = { pattern: /^.{1,15}$/, message: '输入内容需在15字符以内' };
const LEN16 = { pattern: /^.{1,16}$/, message: '输入内容需在16字符以内' };
const LEN50 = { pattern: /^.{1,50}$/, message: '输入内容需在50字符以内' };
const LEN20 = { pattern: /^.{1,20}$/, message: '输入内容需在20字符以内' };
const LEN25_ENTER = { pattern: /^(.|[\n\s*\r]){1,25}$/, message: '输入内容需在25字符以内' };
const LEN30 = { pattern: /^.{1,30}$/, message: '输入内容需在30字符以内' };
const LEN40 = { pattern: /^.{1,40}$/, message: '输入内容需在40字符以内' };
const LEN42 = { pattern: /^.{1,42}$/, message: '输入内容需在42字符以内' };
const LEN64 = { pattern: /^.{1,64}$/, message: '输入内容需在64字符以内' };
const LEN80 = { pattern: /^.{1,80}$/, message: '输入内容需在80字符以内' };
const LEN100 = { pattern: /^.{1,100}$/, message: '输入内容需在100字符以内' };
const LEN6_128 = { pattern: /^.{6,128}$/, message: '输入内容需在6-128字符以内' };
const LEN10_50 = { pattern: /^.{10,50}$/, message: '输入内容需在10-50字符以内' };
const LEN128 = { pattern: /^.{1,128}$/, message: '输入内容需在128字符以内' };
const LEN85 = { pattern: /^.{1,85}$/, message: '输入内容需在85字符以内' };
const LEN256 = { pattern: /^.{1,256}$/, message: '输入内容需在256字符以内' };
const LEN128_ENTER = { pattern: /^(.|[\n\s*\r]){1,128}$/, message: '输入内容需在128字符以内' }; //支持回车
const LEN150_ENTER = { pattern: /^(.|[\n\s*\r]){1,150}$/, message: '输入内容需在150字符以内' };
const LEN200 = { pattern: /^(.|[\n\s*\r]){1,200}$/, message: '输入内容需在200字符以内' };
const POSITIVE_INT = { pattern: /^[0-9]+$/, message: '输入正整数' };
const POSITIVE_NUM = { pattern: /^[0-9]+$/, message: '输入自然数' };
const POSITIVE_INTEGER = { pattern: /^[1-9][0-9]*$/, message: '输入正整数' };
const LEN16_NUMBER_LETTER_ = {
  pattern: /^[\d|a-z|A-Z|@|\-|_]{1,16}$/,
  message: '由字母，数字， _， - 组成，有效长度为1-16个字符',
};
const LEN32_NUMBER_LETTER = {
  pattern: /^[\d|a-z|A-Z]{1,32}$/,
  message: '由字母，数字组成，有效长度为1-32个字符',
};

const LEN20_NUMBER_LETTER = {
  pattern: /^[\d|a-z|A-Z]{1,20}$/,
  message: '由字母，数字组成，有效长度为1-20个字符',
};
const LEN40_NUMBER_LETTER = {
  pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]{1,40}$/,
  message: '由中文，字母，数字组成，有效长度为1-40个字符',
};
const LEN20_NUMBER_LETTER_CHINESE = {
  pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]{1,20}$/,
  message: '由字母,数字,文字组成，有效长度为1-20个字符',
};
const PASSWORD = {
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_-])[A-Za-z\d!@#$%^&*_-]{4,32}/,
  message:
    '由字母，数字，特殊字符（!@#$%^&*_-）组成，且至少包含一个大写字母，小写字母，数字及特殊字符，有效长度为4-32个字符',
};
const PASSWORD_STANDARD = {
  pattern: /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\W_!@#$%^&*`~()-+=]+$)(?![0-9\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\W_!@#$%^&*`~()-+=]{6,20}$/,
  message: '必须是6-20个大小写字母、数字或符号（除空格），且大写字母、小写字母、数字和标点符号至少包含三种',
};
const PASSWORD_LOGIN = {
  pattern: /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\W_!@#$%^&*`~()-+=]+$)(?![0-9\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\W_!@#$%^&*`~()-+=]{8,20}$/,
  message: '必须是8-20个大小写字母、数字或符号（除空格），且大写字母、小写字母、数字和标点符号至少包含三种',
};
const CHANGE_PASSWORD = {
  pattern: /^(?=.*[a-zA-Z])(?=.*\d)(.{8,20})$/,
  message: '密码长度为8-20位,必须包含字母和数字，字母区分大小写',
};
const SCORE = {
  pattern: /^(?:[1-9]?\d|100)$/,
  message: '输入内容需为0-100的正整数',
};
const NUMBER_100 = {
  pattern: /^([1-9]\d?|100)$/,
  message: '输入内容需为1-100的正整数',
};
const NUMBER_999 = {
  pattern: /^([0-9]\d{0,2})$/,
  message: '输入内容需为0-999的正整数',
};
const NUMBER_9999 = {
  pattern: /^(\d{0,4})$/,
  message: '输入内容需为0-9999的正整数',
};
const NUMBER_65535 = {
  pattern: /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
  message: '端口号内容需为0-65535的正整数',
};
const NUMBER_100000 = (rule: any, value: any, callback: any) => {
  var x = String(value).indexOf('.') + 1; //得到小数点的位置
  var y = String(value).length - x; //小数点的位数
  if (value && !(Number(value) >= 0 && Number(value) <= 100000 && (Number(x) === 0 || (x > 0 && y <= 2)))) {
    callback('输入内容需为0-100000的数字,最多2位小数点');
  }
  callback();
};
const AREAR = {
  pattern: /^(?=([0-9]{1,15}$|[0-9]{1,13}\.))(0|[1-9][0-9]*)(\.[0-9]{1,2})?$/,
  message: '输入内容需包括最多2位小数点，有效长度为1-15位',
};
const CAR_NUM_VALIDATOR = (rule: any, value: any, callback: any) => {
  if (value && !(Number(value) >= 0 && Number(value) <= 10000 && /^[0-9]\d*$/.test(value))) {
    callback('输入内容区间为0-10000的正整数');
  }
  callback();
};

//校验身份证号，同时校验身份证最后一位验证码
const ID_CARD_NUM_VALID = (rule: any, idCard: string, callback: any) => {
  if (!idCard) {
    return callback();
  }
  const Errors = [
    '1',
    '身份证号码位数不对!',
    '身份证号码出生日期超出范围或含有非法字符!',
    '身份证号码校验错误!',
    '身份证地区非法!',
  ];
  const area = {
    11: '北京',
    12: '天津',
    13: '河北',
    14: '山西',
    15: '内蒙古',
    21: '辽宁',
    22: '吉林',
    23: '黑龙江',
    31: '上海',
    32: '江苏',
    33: '浙江',
    34: '安徽',
    35: '福建',
    36: '江西',
    37: '山东',
    41: '河南',
    42: '湖北',
    43: '湖南',
    44: '广东',
    45: '广西',
    46: '海南',
    50: '重庆',
    51: '四川',
    52: '贵州',
    53: '云南',
    54: '西藏',
    61: '陕西',
    62: '甘肃',
    63: '青海',
    64: '宁夏',
    65: '新疆',
    71: '台湾',
    81: '香港',
    82: '澳门',
    91: '国外',
  };
  let pattern;
  let idCardArr = [];
  idCardArr = idCard.split('');
  // 加权因子
  const weight_factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  // 校验码
  var check_code = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  switch (idCard.length) {
    case 15:
      if (area[parseInt(idCard.substring(0, 2))] == null) {
        return callback(Errors[4]);
      }
      if (
        (parseInt(idCard.substring(6, 8)) + 1900) % 4 == 0 ||
        ((parseInt(idCard.substring(6, 8)) + 1900) % 100 == 0 && (parseInt(idCard.substring(6, 8)) + 1900) % 4 == 0)
      ) {
        pattern = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}$/;
      } else {
        pattern = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}$/;
      }
      /* if ('111111111111111' == idCard) {
        return callback(Errors[4]);
      } else */ if (
        pattern.test(idCard)
      ) {
        return callback();
      } else {
        return callback(Errors[2]);
      }
      break;
    case 18:
      if (area[parseInt(idCard.substring(0, 2))] == null) {
        return callback(Errors[4]);
      }
      if (
        parseInt(idCard.substring(6, 10)) % 4 == 0 ||
        (parseInt(idCard.substring(6, 10)) % 100 == 0 && parseInt(idCard.substring(6, 10)) % 4 == 0)
      ) {
        pattern = /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/;
      } else {
        pattern = /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/;
      }
      if (pattern.test(idCard)) {
        const seventeen = idCard.substring(0, 17);
        const arr = seventeen.split('');
        const len = arr.length;
        let num: number = 0;
        for (let i = 0; i < len; i++) {
          num = num + parseInt(arr[i]) * weight_factor[i];
        }

        const resisue = num % 11;
        const last_no = check_code[resisue];
        if (last_no == idCardArr[17]) {
          return callback();
        } else {
          return callback(Errors[3]);
        }
      } else {
        return callback(Errors[2]);
      }
      break;
    default:
      return callback(Errors[1]);
      break;
  }
};
const INTER_NUMBER = (rule: any, value: any, callback: any) => {
  if (value && !(Number(value) >= 0 && Number(value) <= 10000 && /^[0-9]\d*$/.test(value))) {
    callback('输入内容区间为0-10000的正整数');
  }
  callback();
};
const STUDENT_NAME = {
  pattern: /^[a-z|A-Z|\u4e00-\u9fa5|·|\s]{1,20}$/,
  message: '由字母，中文，空格组成，有效长度为1-20个字符', //只能出现：A-Z、a-z、中文、空格(第一位、最后一位，不能是空格)
};
export const RULES = {
  OTHER_CARDTYPE: LEN40,
  STUDENT_NAME: STUDENT_NAME, // 1、学员姓名：20个字符以内（考虑到可能存在英文名称）
  COACH_NAME: LEN20, // 2、教练姓名：20个字符以内
  ID_CARD: {
    pattern: /^[1-9]\d{5}(19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
    message: '请输入正确的身份证号!',
  }, // 3、身份证号
  LICENSE_NUMBER: LEN128, // 3、证件号：128个字符以内，如果是身份证类型的，需要验证输入是否符合身份证输入规则

  TEL: { pattern: /^.{1,32}$/, message: '输入内容需在32字以内' }, // 4、联系电话：手机或固话型，32个字符以内，如果要求是手机的，需要做手机号验证，32个字符以内
  // 41：投诉电话：手机或固话型，32个字符以内
  TEL_11: {
    pattern: /^1(3[0-9]|4[01456879]|5([0-3]|[5-9])|6[2567]|7[0-8]|8[0-9]|9([0-3]|[5-9]))\d{8}$/,
    message: '输入正确的手机号码',
  }, // 11位正常手机号码
  TEL_11_COACH: {
    pattern: /^1(3[0-9]|4[01456879]|5([0-3]|[5-9])|6[2567]|7[0-8]|8[0-9]|9([0-3]|[5-9]))\d{8}$/,
    message: '请填写教练真实手机号',
  }, // 11位正常手机号码
  TEL_TELEPHONE_MOBILE: {
    // pattern: /^((0\d{2,3}-?\d{7,8})|(1(3[0-9]|4[01456879]|5[0-3,5-9]|6[2567]|7[0-8]|8[0-9]|9[0-3,5-9])\d{8}))$/,
    pattern: /^\d{1,20}$/,
    message: '输入内容需在20个数字以内',
  }, // 68、固话或手机号
  DRIVER_LICENSE: LEN20_NUMBER_LETTER, // 5、驾驶证号：20个字符以内
  MEMO: LEN200, // 6、备注信息：200个字符以内 可以输入回车换行符
  ADDRESS: LEN42, // 7、地址：42字符以内

  PRICE: { pattern: /^.{1,50}$/, message: '输入内容需在50字以内' }, // 8、价格字段：可以输入如：10.01 的金额内容

  PROFESSIONAL_CERTIFICATE: LEN20_NUMBER_LETTER_CHINESE, // 9、 职业资格证号：20
  PROFESSIONAL_CERT_COACH: LEN20_NUMBER_LETTER_CHINESE, //教练资格证：20 字母文字数字组成
  ROLE: LEN10, // 10、角色名称：10个字符以内
  CLASS_NAME_APP: LEN10, // 10、角色名称：10个字符以内
  ACCOUNT: LEN20, // 11、登录账号：20个字符以内
  PASSWORD: PASSWORD_STANDARD, // 12、密码：必须是6-20个英文字母、数字或符号（除空格），且字母、数字和标点符号至少包含两种
  OPINION: LEN150_ENTER, // 13、部门意见、投诉内容、驾校意见：150个字符以内
  EVALUATION: LEN150_ENTER, // 14、个性化评价、评级用语列表： 150个字符以内
  NUMBER_PLATE: {
    pattern: /^(([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳使领模理]))$/,
    message: '请输入正确的车牌号，例如浙A6666学',
  }, // 15、车牌号：10个字符以内
  MANUFACTURER: LEN80, // 16、生产厂家： 80个字符以内
  VEHICLE_BRAND: LEN30, // 17、车辆品牌：30个字符以内
  VEHICLE_MODEL: LEN16, // 18、车辆型号：16个字符以内
  FRAME_NUMBER: LEN32_NUMBER_LETTER, // 21：车架号：32个字符以内
  ENGIN_NUMBER: LEN32_NUMBER_LETTER, // 22：发动机号：32个字符以内
  AREA_NAME: LEN10, // 23：区域名称：10个字符以内
  OUTLET_NAME: LEN20, // 24：营业网点名称，20个字符以内
  OUTLET_INTRODUCTION: LEN10, // 25：网点简介：10个字符以内
  CONCAT: LEN10, // 26：联系人：10个字符以内
  INSTITUTION_NAME: LEN128, // 27：机构名称： 128字符以内
  INSTITUTION_SHORT_NAME: LEN128, // 28：机构简称： 128字符以内
  BUSINESS_LICENSE: { pattern: /^[\d|a-z|A-Z]{15}$/, message: '输入内容必须是15个字符，由字母、数字组成' }, // 29：营业执照号： 只能15位，，数字/字母

  SOCIAL_CREDIT_CODE: { pattern: /^[\d|a-z|A-Z]{1,18}$/, message: '输入内容为1-18个字符，由字母、数字组成' }, // 30：社会信用代码： 18个字符

  PERMIT_NUMBER: { pattern: /^[\d|a-z|A-Z]{12}$/, message: '输入内容必须是12个字符，由字母、数字组成' }, // 31：许可证号：只能12位，数字/字母

  LEGAL: LEN10, // 32：法人代表：10个字符以内

  COACH_NUM: NUMBER_999, // 33：教练员总数：大于0整数，0-999
  // 34：考核员总数：大于0整数，16个字符以内
  // 35：安全员总数：大于0整数，16个字符以内
  // 36：教练车总数：大于0整数，16个字符以内

  AREA_SIZE: AREAR, // 37：教室总面积：大于0数值型，15个字符以内
  // 38：理论教室面积：大于0数值型，16个字符以内
  // 39：教练场总面积：大于0数值型，16个字符以内

  POSTAL_CODE: { pattern: /^\d{6}$/, message: '输入内容必须是6个字符' }, // 40：邮政编码：大于0整数，6个字符

  TRAIN_ADDRESS: LEN20, // 52：培训机构地址：20个字符以内

  CLASS_TYPE_NAME: LEN20, // 55：班型名称：20个字符以内
  CLASS_TYPE_NAME_NEW: LEN30, // 55：班型名称：20个字符以内
  LEN50: { pattern: /^.{1,50}$/, message: '输入内容需在50字以内' },

  TEACH_AREA_NAME: LEN256, // 58：教学区域名称：15个字符以内
  TEACH_AREA_ADDRESS: LEN40, // 59：教学区域地址：40个字符以内
  TEACH_AREA_AREA: NUMBER_100000, // 60：教学区域面积：[0,100000]正整数
  TEACH_AREA_CAR_NUM: CAR_NUM_VALIDATOR, // 61：可容纳车辆数：0-10000
  // 62：已投放车辆数：大于0数值型，6个字符以内
  OUTLET_ADDRESS: LEN30, // 63: 营业网点地址：30个字符以内
  SCORE: SCORE, // 64：分数0-100正整数
  PRICE_NUMBER: { pattern: /^[0-9]+$/, message: '价格需为正整数' }, // 65: 正整数
  TIME_LINE: {
    pattern: /^[0-9]$|^[1-9][0-9]$|^[1-6][0-9][0-9]$|^7[0-1][0-9]$|^720$/,
    message: '输入内容需为0-720的正整数',
  }, // 66：不大于720分钟，
  PERSON: { pattern: /^[1-9]$|^[1-9][0-9]$|^[1-4][0-9][0-9]$|^500$/, message: '可约人数需为1-500的正整数' }, // 67：不大于500人
  ROLE_NAME: LEN16, //69：角色名称
  TOTAL_NUM: POSITIVE_INT, //70:总数
  CARD_NUM: POSITIVE_INT, //71卡号
  CODE: LEN16_NUMBER_LETTER_, //72 编码 由字母，数字， _， - 组成，有效长度为1-16个字符
  DESCRIPTION: LEN128_ENTER, //73 描述
  USER_NAME: LEN16_NUMBER_LETTER_, //74 用户名 由字母，数字， _， - 组成，有效长度为1-16个字符
  USERCENTER_NAME: LEN20, //75 姓名 20
  BRANCH_NAME: LEN30, //76分支机构名称 30
  TRAIN_CONCAT: LEN10, //77：培训机构联系人
  BRANCH_CONCAT: LEN6, //78：营业网点、分支结构 联系人
  BRANCH_ADDRESS: LEN30, //79分支机构地址
  RESIDENCE_PERMIT_NO: LEN20_NUMERICAL, //80：居住证号
  RESIDENCE_PERMIT_ADDRESS: LEN42, //81：居住地址
  OTHER_IDCARD: LEN40_NUMBER_LETTER, //82：其他证件号（除身份证号以外）
  CHANGE_PASSWORD: PASSWORD_LOGIN, //83:修改密码页面密码复杂度
  ORG_CODE: LEN64, //84: 组织编码
  ORG_NAME: LEN128, // 85:组织名称
  RULE_NAME: LEN15, //86:规则名称
  EXAM_PLACE: LEN64, //87:考试场地
  EXAM_TIME: LEN64, //88:考试场次
  CANCEL_NOTE: LEN25_ENTER, //89:取消原因
  BANK_ACCOUNT: LEN20, //90:银行开户名
  BANK_NAME: LEN20, //91:开户银行
  BANK_CARD: {
    pattern: /^\d{1,50}$/,
    message: '输入内容仅支持数字，且长度在50以内',
  },
  WITHDRAWAL_AMOUNT: {
    pattern: /^([1-9]\d*(\.\d{1,2})?|([0](\.([0][1-9]|[1-9]\d{0,1}))))$/,
    message: '输入内容需为大于0的数字,最多2位小数点',
  },
  APP_FEE: {
    pattern: /^([1-9]\d*(\.\d{1,2})?|([0](\.([0][1-9]|[1-9]\d{0,1}))))$/,
    message: '输入内容需为大于0的数字,最多2位小数点',
  },
  TOTAL_COACH_AREA: {
    pattern: /^\d+(.\d{1,2})?$/,
    message: '输入内容需为有效数字,最多2位小数点',
  },
  NVR_PORT: NUMBER_65535, //92:机器人教练端口号校验规则规则（0-65535的数字）
  RULE_PRICE: NUMBER_9999, // 33：教练员总数：大于0整数，0-999
  // 学时申报学时信息
  STUDENT_INFO: {
    pattern: /^\d{1,6}$/,
    message: '输入内容需在6个数字字符以内',
  },
  // 注册地址
  REGISTERED_ADDRESS: {
    pattern: /^.{1,255}$/,
    message: '输入内容需在255个字符以内',
  },
  // 报名驾校
  TRAIN_SCHOOL: {
    pattern: /^.{1,120}$/,
    message: '输入内容需在120个字符以内',
  },
  // 原档案号
  FILE_NUMBER: {
    pattern: /^.{1,20}$/,
    message: '输入内容需在20个字符以内',
  },
  // 邮箱的验证
  EMAIL: {
    // eslint-disable-next-line no-useless-escape
    pattern: /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/,
    message: '输入正确的邮箱',
  },
  INTER_8: { pattern: /^[0-9]{1,8}$/, message: '输入内容需在8个正整数字以内' },
  COMMON_NUM: POSITIVE_INT,
  PAYER_NAME: LEN50,
  CONTENT_100: LEN100,
  NUMBER_100: NUMBER_100,
  CLASS_PLAN: LEN20,
  CLASS_NAME: LEN20,
  TOTAL_PERSON: POSITIVE_INTEGER,
  POSITIVE_INTEGER,
  POSITIVE_NUM: POSITIVE_NUM,
  CODE_6: LEN6,
  CODE_NUMBER_4_6: {
    pattern: /^\d{4,6}$/,
    message: '输入内容需为数字，4-6位',
  },
  COMPANY_NAME: LEN6_128,
  CARD_NUMBER: LEN10_50,
  TEACH_NUMBER: LEN20,
  SEATING_CAPACITY: LEN42,
  WEIGHT: LEN42,
  CAR_HEIGHT: LEN8,
  CAR_WIDTH: LEN8,
  CAR_CAPTAIN: LEN8,
  TECHNICAL_GRADE: LEN42,
  SPEED_GEARS: INTER_NUMBER,
  ORIGIN: LEN85,
  ETHNICITY: LEN42,
  TITLE: LEN42,
  HOME_ADDRESS: LEN85,
  NUMBER_COUNT: INTER_NUMBER, // ：0-10000
  ID_CARD_NUM_VALID: ID_CARD_NUM_VALID,
  EXPERTISE: LEN20,
  BRAND: { pattern: /^.{1,86}$/, message: '输入内容需在86字符以内' },
  MODEL: { pattern: /^.{1,42}$/, message: '输入内容需在42字符以内' },
  MANUFACTURE: { pattern: /^.{1,86}$/, message: '输入内容需在86字符以内' },
  SIMULATOR_NAME: { pattern: /^.{1,42}$/, message: '输入内容需在42字符以内' },
};

// 1、学员姓名：64个字符以内（考虑到可能存在英文名称）
// 2、教练姓名：64个字符以内
// 3、证件号：   128个字符以内，如果是身份证类型的，需要验证输入是否符合身份证输入规则
// 4、联系电话：手机或固话型，32个字符以内，如果要求是手机的，需要做手机号验证，32个字符以内
// 5、驾驶证号：128个字符以内
// 6、备注信息：200个字符以内
// 7、地址：256字符以内
// 8、价格字段：可以输入如：10.01 的金额内容
// 9、 职业资格证号：V128
// 10、角色名称：10个字符以内
// 11、登录账号：20个字符以内
// 12、密码：30个字符以内
// 13、部门意见、投诉内容、驾校意见：128个字符以内
// 14、个性化评价、评级用语列表： 512个字符以内
// 15、车牌号：32个字符以内
// 16、生产厂家： 80个字符以内
// 17、车辆品牌：10个字符以内
// 18、车辆型号：16个字符以内
// 21：车架号：32个字符以内
// 22：发动机号：32个字符以内
// 23：区域名称：10个字符以内
// 24：营业网点名称：256个字符以内
// 25：网点简介：128个字符以内
// 26：联系人：10个字符以内
// 27：机构名称： 256字符以内
// 28：机构简称： 128字符以内
// 29：营业执照号： 20个字符
// 30：社会信用代码： 18个字符
// 31：许可证号：12个字符以内
// 32：法人代表：10个字符以内
// 33：教练员总数：大于0整数，16个字符以内
// 34：考核员总数：大于0整数，16个字符以内
// 35：安全员总数：大于0整数，16个字符以内
// 36：教练车总数：大于0整数，16个字符以内
// 37：教室总面积：大于0数值型，16个字符以内
// 38：理论教室面积：大于0数值型，16个字符以内
// 39：教练场总面积：大于0数值型，16个字符以内
// 40：邮政编码：大于0整数，6个字符
// 41：投诉电话：手机或固话型，32个字符以内
// 52：培训机构地址：20个字符以内
// 53：联系人：10个字符以内
// 54：法人代表：10个字符以内
// 55：班型名称：20个字符以内
// 56：价格：数值型，16个字符以内
// 57：职业资格证：128个字符以内

// 58：教学区域名称：256个字符以内
// 59：教学区域地址：256个字符以内
// 60：教学区域面积：大于0数值型，6个字符以内
// 61：可容纳车辆数：大于0数值型，6个字符以内
// 62：已投放车辆数：大于0数值型，6个字符以内
// 63: 营业网点地址：128个字符以内

// 64：分数
// 65: 价格
// 66：时长
// 67：人数
//68: 固话或手机号
//69：角色名称  有效长度为1-16个字符
//70: 总数
//71：卡号
//72: 编码  由字母，数字， _， - 组成，有效长度为1-16个字符
//73: 描述 有效长度为0-128个字符
//74：用户名 由字母，数字， _， - 组成，有效长度为1-16个字符
//75：姓名 （用户中心）
//76：分支机构名称
//77：培训机构联系人
//78：营业网点、分支结构 联系人
//79：分支机构地址
//80：居住证号
//81：居住地址
//82：其他证件号（处身份证号以外）
//83: 修改密码页面密码复杂度 密码长度为8到20位,必须包含字母和数字，字母区分大小写
//83: 组织编码
//85: 组织名称
//86: 规则名称
//87: 考试场地
//88: 考试场次
//89: 取消原因
