import orange from 'statics/images/wallet/bg_orange.png';
import blue from 'statics/images/wallet/bg_blue.png';
import green from 'statics/images/wallet/bg_green.png';
import alipay from 'statics/images/wallet/alipay.png';
import gongshang from 'statics/images/wallet/gongshang.png';
import jianshe from 'statics/images/wallet/jianshe.png';
import ningbo from 'statics/images/wallet/ningbo.png';
import nonghang from 'statics/images/wallet/nonghang.png';
import nongxin from 'statics/images/wallet/nongxin.png';
import pingan from 'statics/images/wallet/pingan.png';
import taizhou from 'statics/images/wallet/taizhou.png';
import wenzhou from 'statics/images/wallet/wenzhou.png';
import youzheng from 'statics/images/wallet/youzheng.png';
import zheshang from 'statics/images/wallet/zheshang.png';
import zhonghang from 'statics/images/wallet/zhonghang.png';
import defaultBg from 'statics/images/wallet/defaultBg.png';

/* PA("pa_bank", "平安银行"),
ZS("cz_bank", "浙商银行"),
PA_SECOND("pa_bank_second", "平安银行"),
// 工商银行丽水
ICBC_LISHUI_BANK("icbc_lishui_bank","丽水工商银行"),
// 中国银行丽水
BOC_LISHUI_BANK("boc_lishui_bank","中国银行丽水"),
CCB_BANK("ccb_bank","建设银行台绍地区"),
PSBC_BANK("psbc_bank","邮储银行台绍地区"),
NX_BANK("nx_bank","农信银行(绍兴地区)"), */
export function getBankImg(bankName: string) {
  let bg = '';
  switch (bankName) {
    case 'pa_bank':
      bg = pingan;
      break;
    case 'cz_bank':
    case 'cz_bank_ct':
      bg = zheshang;
      break;
    case 'pa_bank_second':
      bg = pingan;
      break;
    case 'icbc_lishui_bank':
      bg = gongshang;
      break;
    case 'boc_lishui_bank':
    case 'boc_bank':
      bg = zhonghang;
      break;
    case 'ccb_bank':
      bg = jianshe;
      break;
    case 'psbc_bank':
      bg = youzheng;
      break;
    case 'nx_bank':
      bg = nongxin;
      break;
    case 'tz_bank':
      bg = taizhou;
      break;
    case 'abc_bank':
      bg = nonghang;
      break;
    default:
      bg = defaultBg;
      break;
  }
  return bg;
}

export function getBg(classTwoBankAccountStatus: number, opened: boolean, isPingAnSecond: boolean, isOpening: boolean) {
  let bg = blue;
  if (!isPingAnSecond) {
    bg = opened ? orange : isOpening ? green : blue;
    return bg;
  }
  switch (classTwoBankAccountStatus) {
    case 1:
    case 3:
      bg = green;
      break;
    case 2:
      bg = orange;
      break;
    case 0:
      bg = blue;
      break;
    default:
      bg = blue;
      break;
  }
  return bg;
}
export function getStatus(
  classTwoBankAccountStatus: number,
  opened: boolean,
  isPingAnSecond: boolean,
  isOpening: boolean,
  statusText: string,
) {
  let status = '';
  if (!isPingAnSecond) {
    status = opened ? '成功' : isOpening ? statusText : '';
    return status;
  }
  switch (classTwoBankAccountStatus) {
    case 0:
      status = '';
      break;
    case 1:
      status = '审核中';
      break;
    case 2:
      status = '成功';
      break;
    case 3:
      status = '失败';
      break;
    default:
      status = '';
      break;
  }
  return status;
}

export function getStatusColor(classTwoBankAccountStatus: number) {
  let color = '';
  switch (classTwoBankAccountStatus) {
    case 0:
      color = '';
      break;
    case 1:
    case 3:
      color = '#22BAAF';
      break;
    case 2:
      color = '#fc6021';
      break;
    default:
      color = '';
      break;
  }
  return color;
}
