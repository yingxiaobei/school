import { message } from 'antd';
import axios, { AxiosResponse } from 'axios';
import { Auth, handleLogout, _get } from 'utils';
import { USER_CENTER_URL, PORTAL_ID, PUBLIC_URL } from 'constants/env';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({
  showSpinner: false,
  minimum: 0.2,
  speed: 800,
  // parent: '#mainContentLayout',
});
//防止多次请求进度条重复加载
let loadingNum = 0;
function startLoading() {
  if (loadingNum === 0) {
    NProgress.start();
  }
  loadingNum++;
}
function endLoading() {
  loadingNum--;
  if (loadingNum <= 0) {
    NProgress.done();
  }
}

const service = axios.create({
  baseURL: USER_CENTER_URL,
  // baseURL: 'http://172.16.8.89:8010',
  withCredentials: true,
  timeout: 60000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

// Add a request interceptor
service.interceptors.request.use(
  function (config) {
    // 加载进度条
    startLoading();
    config.withCredentials = true;

    // Do something before request is sent
    return config;
  },
  function (error) {
    endLoading();
    // Do something with request error
    return Promise.reject(error);
  },
);

// Add a response interceptor
service.interceptors.response.use(
  function (response) {
    const status = _get(response, 'status');
    const withFeedback = _get(response, 'config.headers.withFeedback');
    const withFailedFeedback = _get(response, 'config.headers.withFailedFeedback');
    const method = _get(response, 'config.method');
    const withFeedbackAll = _get(response, 'config.headers.withFeedbackAll');

    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data

    if (status === 401) {
      //结束进度条
      endLoading();
      message.error('登录信息过期，请重新登录');
      Auth.del();
      return response.data;
    }

    if ((withFailedFeedback || withFeedback || method === 'delete' || method === 'put') && withFeedbackAll) {
      if (_get(response, 'data.code') === 200) {
        !withFailedFeedback && message.success(_get(response, 'data.message'));
      } else {
        message.error(_get(response, 'data.message'));
      }
    }

    //结束进度条
    endLoading();
    return response.data;
  },
  function (error) {
    const withFailedFeedback = _get(error, 'config.headers.withFailedFeedback');
    //结束进度条
    endLoading();
    //如果是Request aborted，不弹出提示
    if (_get(error, 'message', '').indexOf('Request aborted') === -1 && !withFailedFeedback) {
      //接口配置withFailedFeedback:false,接口异常时抛出
      message.error(_get(error, 'response.data.message'));
    }
    console.log(error);
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (_get(error, 'response.status') === 401) {
      handleLogout();
    }

    return Promise.reject(error);
  },
);

interface IPayload {
  withFeedback?: boolean;
  withFailedFeedback?: boolean;
  withFeedbackAll?: boolean;
  customHeader?: any;
  responseType?: 'json' | 'arraybuffer' | 'stream' | 'document' | 'text' | 'blob';
  bodyType?: any;
  hasHeader?: boolean;
  mustAuthenticated?: boolean;
  timeout?: number;
}

type IMethod = 'GET' | 'PUT' | 'POST' | 'DELETE';

export function isTheoryStudents() {
  return window.location.pathname === `${PUBLIC_URL}theoryStudents`;
}

export function request<T = any>(
  path: string,
  method: IMethod = 'GET',
  query: { [key: string]: any } = {},
  payload?: IPayload,
) {
  const withFeedback = _get(payload, 'withFeedback', false); // 是否对接口结果进行反馈
  const withFailedFeedback = _get(payload, 'withFailedFeedback', false); // 是否仅对接口结果进行反馈
  const withFeedbackAll = _get(payload, 'withFeedbackAll', true); // 是否对接口结果进行反馈(所有类型)
  const customHeader = _get(payload, 'customHeader', {}); // 自定义Header
  const responseType = _get(payload, 'responseType', 'json');
  const bodyType = _get(payload, 'bodyType', 'x-www-form-urlencoded');
  const hasHeader = _get(payload, 'hasHeader', true);
  const mustAuthenticated = _get(payload, 'mustAuthenticated', true); // 接口是否必须在授权后才可以调用
  const timeout = _get(payload, 'timeout', 60000);

  const headers = { withFeedback, withFailedFeedback, withFeedbackAll };
  if (PORTAL_ID) {
    Object.assign(headers, { portalId: PORTAL_ID });
  }

  // eslint-disable-next-line no-restricted-globals
  if (Auth.isAuthenticated() && hasHeader) {
    Object.assign(headers, {
      Authorization: 'bearer' + Auth.get('token'),
      username: Auth.get('username'),
      companyId: Auth.get('companyId'),
      schoolId: Auth.get('schoolId'),
      userId: Auth.get('userId'),
      operatorName: encodeURIComponent(Auth.get('operatorName') || ''),
      sysId: 'ERP',
      customSchoolId: isTheoryStudents() ? Auth.get('practicalSchoolId') : '', // 只针对理论学员档案
    });
  }

  Object.assign(headers, customHeader);

  // TODO:可能还需要其他处理
  if (mustAuthenticated && (!Auth.isAuthenticated() || !Auth.get('schoolId'))) {
    return (undefined as unknown) as Promise<AxiosResponse<T>>;
  }

  if (method === 'GET') {
    return service.request<T>({
      url: path,
      method: method.toLowerCase() as IMethod,
      params: trimStr(query),
      headers,
      responseType,
      timeout: timeout,
    });
  }

  if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
    let data = trimStr(query);

    const formData = new FormData();
    if (bodyType === 'form-data') {
      for (let key of Object.keys(query)) {
        formData.append(key, query[key]);
      }
      data = formData;
    }

    return service.request<T>({
      url: path,
      method: method.toLowerCase() as IMethod,
      data,
      headers,
      responseType,
    });
  }
  return (undefined as unknown) as Promise<AxiosResponse<T>>;
}

// 用于trim字符串参数
// TODO: 支持trim数组对象类型里面的成员
function trimStr(query: any) {
  const newQuery: any = query;
  for (let key of Object.keys(newQuery)) {
    if (typeof newQuery[key] === 'string') {
      newQuery[key] = newQuery[key].trim();
    }
  }

  return newQuery;
}
