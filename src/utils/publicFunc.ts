/* eslint-disable no-param-reassign */
import ErrorPage from 'app/school/pages/404';
import { store } from 'store';
import { PUBLIC_URL } from 'constants/env';
import Home from 'components/Home';
import AddServiceIntro from 'app/school/pages/addService/AddServiceIntro';
import NotFoundPage from 'app/school/pages/404';
import NotAuthPage from 'app/school/pages/403';

/**
 * 隐藏手机号码
 * @param {string} phone 手机号
 */
export const hidePhone = (phone: string) => phone && phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');

/**
 * 根据路径获取路由的name和key
 * @param {string} path 路由
 */
export const getKeyName = (_path: string = `${PUBLIC_URL}404`, allRouters: any = []) => {
  const path1: any = _path.split('?')[0];
  const truePath = path1.replace(PUBLIC_URL, '');
  if (path1 === `${PUBLIC_URL}home`) {
    return {
      title: '工作台',
      tabKey: 'home',
      component: Home,
    };
  }
  if (path1 === `${PUBLIC_URL}addServiceIntro`) {
    return {
      title: '增值服务',
      tabKey: 'service',
      component: AddServiceIntro, //增值服务介绍页
    };
  }
  if (path1 === `${PUBLIC_URL}404`) {
    return {
      title: '暂无页面',
      tabKey: '404',
      component: NotFoundPage,
    };
  }
  if (path1 === `${PUBLIC_URL}403`) {
    return {
      title: '暂无权限',
      tabKey: '403',
      component: NotAuthPage,
    };
  }
  const curRoute = allRouters.filter((item: any) => item.path.slice(1) == truePath);
  if (!curRoute[0]) {
    return { title: '暂无页面', tabKey: '404', component: ErrorPage };
  }
  const { name, path, component } = curRoute[0];
  return { title: name, tabKey: path, component };
};

/**
 * 同步执行操作，Currying
 * @param {*} action 要执行的操作
 * @param {function} cb 下一步操作回调
 */
export const asyncAction = (action: unknown) => {
  const wait = new Promise((resolve) => {
    resolve(action);
  });
  return (cb: () => void) => {
    wait.then(() => setTimeout(() => cb()));
  };
};

/**
 * 页签关闭操作回调
 * @param {object} history 路由history对象。不能new新实例，不然参数无法传递
 * @param {string} returnUrl 返回地址
 * @param {function} cb 回调操作，可选
 */
export const closeTabAction = (history: CommonObjectType, returnUrl: string = '/home', cb?: () => void) => {
  const { curTab } = store.getState().storeData;
  const { href } = window.location;
  const pathname = href.split('#')[1];
  // 删除tab
  const tabArr = JSON.parse(JSON.stringify(curTab));
  const delIndex = tabArr.findIndex((item: string) => item === pathname);
  tabArr.splice(delIndex, 1);

  // 如果要返回的页面被关闭了，再加进去
  if (!tabArr.includes(returnUrl)) {
    tabArr.push(returnUrl);
  }

  // 储存新的tabs数组
  const setTab = store.dispatch({
    type: 'SET_CURTAB',
    payload: tabArr,
  });
  // 刷新tab
  const reloadTab = store.dispatch({
    type: 'SET_RELOADPATH',
    payload: returnUrl,
  });
  // 停止刷新tab
  const stopReload = setTimeout(() => {
    store.dispatch({
      type: 'SET_RELOADPATH',
      payload: 'null',
    });
  }, 500);

  const action = () => setTab && reloadTab && stopReload;

  // 刷新回调
  const callback = () => {
    if (cb && typeof cb === 'function') {
      return cb;
    }
    return history.push({
      pathname: returnUrl,
    });
  };

  asyncAction(action)(callback);
};

/**
 * 获取地址栏 ?参数，返回键值对对象
 */
export const getQuery = (): CommonObjectType<string> => {
  const { href } = window.location;
  const query = href.split('?');
  if (!query[1]) return {};

  const queryArr = decodeURI(query[1]).split('&');
  const queryObj = queryArr.reduce((prev, next) => {
    const item = next.split('=');
    return { ...prev, [item[0]]: item[1] };
  }, {});
  return queryObj;
};

/**
 * 深拷贝操作，简单类型的对象的可以直接用 JSON.parse(JSON.stringify())或 [...]/{...}
 * @param {object} obj 需要拷贝的对象
 */
export const deepClone = (obj: CommonObjectType) => {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date || obj instanceof Function) {
    return obj;
  }
  const cloneObj: any = Array.isArray(obj) ? [] : {};
  Object.keys(obj).map((key) => {
    cloneObj[key] = deepClone(obj[key]);
    return cloneObj;
  });
  return cloneObj;
};

/**
 * 获取本地存储中的权限
 */
export const getPermission = () => localStorage.getItem('permissions') || [];

/**
 * 根据权限判断是否有权限
 */
export const isAuthorized = (val: string): boolean => {
  const permissions: any = getPermission();
  return permissions.includes(val);
};

export function getWeek(weekNumber: string) {
  let str = '';
  switch (weekNumber) {
    case '1':
      str = '星期一';
      break;
    case '2':
      str = '星期二';
      break;
    case '3':
      str = '星期三';
      break;
    case '4':
      str = '星期四';
      break;
    case '5':
      str = '星期五';
      break;
    case '6':
      str = '星期六';
      break;
    case '7':
      str = '星期日';
      break;
    default:
      str = '';
      break;
  }
  return str;
}

//base64解码
export function b64Decode(str: string) {
  return decodeURIComponent(atob(str));
}

export function getTableMaxHeight() {
  const searchCol = document.querySelectorAll('.searchColCls');
  const searchColLen = searchCol.length || 0;
  const searchColHeight = searchColLen === 0 ? 0 : searchCol[searchColLen - 1]?.clientHeight; //TODO：当前Search组件不一定是最后一个
  const height =
    document.body.clientHeight -
    Number(searchColHeight || 0) -
    Number(document.querySelector('.ant-tabs-nav')?.clientHeight || 0) -
    Number(document.querySelector('.ant-layout-header')?.clientHeight || 0) -
    175 -
    30;
  return height;
}
export function getTableMaxHeightRef(ref: any) {
  const searchCol = document.querySelectorAll('.searchColCls');
  const searchColLen = searchCol.length || 0;
  const searchColHeight = searchColLen === 0 ? 0 : searchCol[searchColLen - 1]?.clientHeight; //TODO：当前Search组件不一定是最后一个
  const searchHeight = ref?.current?.clientHeight || 0;
  const height =
    document.body.clientHeight -
    Number(ref?.current?.clientHeight || 168) - //search组件三行的高度
    Number(document.querySelector('.ant-tabs-nav')?.clientHeight || 0) -
    Number(document.querySelector('.ant-layout-header')?.clientHeight || 0) -
    180;
  return height;
}

/**
 * 保留小数点几位数, 自动补零, 四舍五入,toFixed存在精度问题
 * @param num: 数值
 * @param digit: 小数点后位数
 * @returns string
 */
export function myFixed(num: any, digit: number) {
  if (!num) {
    return '0.00';
  }
  if (Object.is(parseFloat(num), NaN)) {
    return '0.00';
  }
  num = parseFloat(num);
  return (Math.round((num + Number.EPSILON) * Math.pow(10, digit)) / Math.pow(10, digit)).toFixed(digit) || '';
}
