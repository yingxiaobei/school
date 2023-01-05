export const USERNAME = 'wuyaner'; //本地登录使用，修改为登录使用的用户名，否则登录不上去

export const GAODE_KEY = '8542329d1788950b78366cbafc917764'; //高德地图akey

// 用户中心地址
export const USER_CENTER_URL = window.REACT_APP_USER_CENTER_URL || process.env.REACT_APP_USER_CENTER_URL;

// 部署时的上下文路径
export const PUBLIC_URL = window.REACT_APP_PUBLIC_URL || process.env.REACT_APP_PUBLIC_URL;

// 用户中心client_id
export const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || '1603500352454';

// 用户中心client_secret
export const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET || '6d437f855f0af2c1b2c32c084ba5a2ac';

// 用户中心client_id 记住账号
export const CLIENT_ID_REMEMBER = process.env.REACT_APP_CLIENT_ID_REMEMBER || '1665279109306';

// 用户中心client_secret记住账号
export const CLIENT_SECRET_REMEMBER =
  process.env.REACT_APP_CLIENT_SECRET_REMEMBER || 'e0a101b1c20c004a2de913fa3d5eaa28';
// 前端地址
export const LOCAL_URL = window.location.origin;

// 接口地址
export const API_URL = window.REACT_APP_API_URL || process.env.REACT_APP_API_URL;

// 非核心业务接口前缀
export const NOT_CORE_PREFIX = '/api/jp-train-noncore-svc';

// 核心业务接口前缀
export const CORE_PREFIX = '/api/jp-train-core-svc';

// 王腾
export const TEST_CORE_PREFIX = '/api/jp-train-core-svc-hkf';

// 考试
export const EXAM_PREFIX = '/api/jp-train-statistic-svc';

export const PORTAL_PREFIX = 'api/jp-portal-svc';

// 用户中心接口前缀
export const USER_CENTER_PREFIX = '/api/usercenter';

// 支付中心接口前缀
export const ORDER_PAY_PREFIX = '/api/orderpay-service';

//支付中心支付成功回调地址前缀
export const PAY_REDIRECT_PREFIX = window.REACT_APP_PAY_REDIRECT_URL || process.env.REACT_APP_PAY_REDIRECT_URL;
//
export const VIDEO_FACE = '/api/video-face';

export const STATISTIC_PREFIX = '/api/jp-train-statistic-svc';

// 数据交互服务前缀
export const DATA_EXCHANGE_PREFIX = '/api/data-exchange';

export const PORTAL_URL = window.REACT_APP_PORTAL_URL || process.env.REACT_APP_PORTAL_URL; // 网络学习链接

export const SCHOOL_URL = window.REACT_APP_SCHOOL_URL || process.env.REACT_APP_SCHOOL_URL; //驾校管理系统链接

export const SYS_URL = window.REACT_APP_SYS_URL || process.env.REACT_APP_SYS_URL; //驾校管理平台链接

export const SCHOOL_TIME_QUERY = window.REACT_APP_SCHOOL_TIME_QUERY || process.env.REACT_APP_SCHOOL_TIME_QUERY; // 学时查询链接

export const PORTAL_CITY_CODE = window.REACT_APP_PORTAL_CITY_CODE || process.env.REACT_APP_PORTAL_CITY_CODE; // 当前门户所在地区

export const PORTAL_APP_CODE = window.REACT_APP_PORTAL_APP_CODE || process.env.REACT_APP_PORTAL_APP_CODE; // appCode

export const PORTAL_SIGN_NAME = window.REACT_APP_PORTAL_SIGN_NAME || process.env.REACT_APP_PORTAL_SIGN_NAME; // signName

export const PORTAL_TEMPLATE_CODE = window.REACT_APP_PORTAL_TEMPLATE_CODE || process.env.REACT_APP_PORTAL_TEMPLATE_CODE; // templateCode

export const PORTAL_OPEN_API_PREFIX =
  window.REACT_APP_PORTAL_OPEN_API_PREFIX || process.env.REACT_APP_PORTAL_OPEN_API_PREFIX; // portal open api prefix

export const PORTAL_ID = window.REACT_APP_PORTAL_ID || process.env.REACT_APP_PORTAL_ID;

export const PROJECT_CONFIG = {
  WENZHOU_PORTAL: {
    pageTitle: '机动车驾驶培训公众服务平台',
  },
  YANTAI_PORTAL: {
    pageTitle: '烟台机动车驾驶培训公众服务平台',
  },
}[process.env.REACT_APP_PROJECT as string] as { pageTitle?: string };

export const DATA_EXAM_PREFIX = '/api/jp-dev-train';

export const COLOR_ARR = [
  '#C7000B ',
  '#0A824A',
  '#FF9966',
  '#00CC99',
  '#C79426',
  '#00CCFF',
  '#C7000B',
  '#9999FF',
  '#D7470E',
  '#3333FF',
];

// https://test.welldriver.cn:1445/api/jp-valueadded-svc-yad/v1/fission/sch/stu/export
export const DRIVING_SHOW_CZG = '/api/jp-valueadded-svc-czg'; // TODO: 本地联调 后续切换
export const DRIVING_SHOW_AD = '/api/jp-valueadded-svc-yad'; // TODO: 本地联调 后续切换
export const DRIVING_SHOW = '/api/jp-valueadded-svc'; // TODO: 本地联调 后续切换
