import { isEmpty } from 'lodash';

// 格式化接口传参
export function formatQueryParams(params?: { [key: string]: any }): string {
  if (isEmpty(params)) {
    return '';
  }

  const res = [];
  for (let key in params) {
    const value = params[key];
    // GET请求参数中去除undefined和null的情况
    if (value !== undefined && value !== null) {
      res.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }

  return isEmpty(res) ? '' : '?'.concat(res.join('&'));
}
