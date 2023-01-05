import { _get } from 'utils';
import { postRequestTemp } from 'services';
import {
  PUBLIC_URL,
  USER_CENTER_URL,
  LOCAL_URL,
  CLIENT_ID,
  CLIENT_SECRET,
  CLIENT_ID_REMEMBER,
  CLIENT_SECRET_REMEMBER,
} from 'constants/env';
import { getCookie } from 'utils';

// 判断是否登录
export function isLogin() {
  return getCookie('tk');
}

/**
 * 获取url中的参数值
 * @param name 参数名称
 */
export function getQueryString(name: string) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  const r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}

// 登录逻辑
export async function login() {
  const code = getQueryString('code');
  const res = await postRequestTemp('/uni/oauth/token', {
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    redirect_uri: `${LOCAL_URL}${PUBLIC_URL}login`,
  });

  const token = _get(res, 'access_token'); // 用户中心返回的token
}

export async function getToken() {
  const code = getQueryString('code');
  const remember = getQueryString('remember') || '';
  const str = remember === null || remember === '' ? '' : `?remember=${remember}`;
  const res = await postRequestTemp('/uni/oauth/token', {
    grant_type: 'authorization_code',
    client_id: remember == '1' ? CLIENT_ID_REMEMBER : CLIENT_ID,
    client_secret: remember == '1' ? CLIENT_SECRET_REMEMBER : CLIENT_SECRET,
    code,
    redirect_uri: `${LOCAL_URL}${PUBLIC_URL}login${str}`,
  });

  return _get(res, 'access_token');
}

// 从用户中心获取username
export async function getUsername(token: string) {
  const options: any = {
    method: 'GET',
    credentials: 'include',
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      token,
    },
  };

  const res = await fetch(USER_CENTER_URL + '/uni/user', options);
  const bar = await res.json();
  return _get(bar, 'username');
}
