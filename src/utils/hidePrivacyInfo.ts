import { Auth } from './auth';
import { hidePhone } from './publicFunc';
import { _get } from './_get';

interface IParams {
  value: string;
  record?: any;
}

// 是否隐藏证件号和手机号
// 是否隐藏用户列表、导出中证件号、联系电话，00为全不隐藏，10代表为隐藏用户列表，不隐藏导出，01代表隐藏导出不隐藏列表，11代表全都隐藏

const hidePrivacy = () => {
  return Auth.get('hidePrivacy') == '10' || Auth.get('hidePrivacy') == '11';
};

export function _handleIdCard(params: IParams) {
  const { value } = params;
  if (!hidePrivacy()) return value;
  return hideIdCard(value);
}

export function _handlePhone(value: string) {
  if (!hidePrivacy()) return value;

  return value && value.replace(/(\d{3}).*(\d{4})/, '$1****$2');
}
/**
 * 身份证隐藏生日的4位
 * @param {data} 传入数据
 * 格式：5300261999****2101
 */
const hideIdCard = (data: string) => {
  if (!data) return '';
  //校验18位身份证
  let reg1 = /^([1-6][1-9]|50)\d{4}(18|19|20)\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  //校验15位身份证
  let reg2 = /^([1-6][1-9]|50)\d{4}\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}$/;

  //如果校验不是15位或18位身份证号，就当其他证件号处理
  if (!reg1.test(data) && !reg2.test(data)) return hideOtherCard(data);
  if (reg2.test(data)) {
    //处理15位证件号，隐藏生日
    return data.replace(/(.{8}).*(.{3})/, '$1****$2');
  }
  return data.replace(/(.{10}).*(.{4})/, '$1****$2');
};

//处理除身份证以外其他证件号
const hideOtherCard = (data: string) => {
  if (data.length <= 4) {
    return '****';
  }
  return data.substring(0, data.length - 4) + '****';
};
