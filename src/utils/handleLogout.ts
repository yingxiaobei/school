// 退出登录

import { Auth } from 'utils';
import { LOCAL_URL, USER_CENTER_URL, PUBLIC_URL } from 'constants/env';

export function handleLogout() {
  if (process.env.REACT_APP_PROJECT !== 'SCHOOL') {
    return;
  }

  const token = Auth.get('token');
  window.location.href = `${USER_CENTER_URL}/uni/cusLogout?token=${token}&redirect_uri=${LOCAL_URL}${PUBLIC_URL}login`;
  Auth.del();
}
