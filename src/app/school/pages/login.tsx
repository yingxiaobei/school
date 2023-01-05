/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect } from 'react';
import { message } from 'antd';
import { useHistory } from 'react-router-dom';
import { Auth, handleLogout, _get, getToken, getUsername, getQueryString } from 'utils';
import { request } from 'services';
import {
  PUBLIC_URL,
  USER_CENTER_URL,
  LOCAL_URL,
  CLIENT_ID,
  CLIENT_SECRET,
  USERNAME,
  CLIENT_ID_REMEMBER,
} from 'constants/env';
import GlobalContext from 'globalContext';
import { isLocalhost } from 'serviceWorker';
import { _getPwdStatus } from 'layouts/_api';

export default function Login() {
  const history = useHistory();
  const {
    $setToken,
    $setSchoolId,
    $setUsername,
    $setRolesIds,
    $setCompanyId,
    $setOperatorName,
    $setUserId,
    $pwdExpire,
    $setPwdExpire,
  } = useContext(GlobalContext);

  useEffect(() => {
    if (Auth.isAuthenticated()) {
      history.replace(`${PUBLIC_URL}`);
    }
  });

  useEffect(() => {
    if (!Auth.isAuthenticated()) {
      login();
    }

    async function login() {
      // const code = window.location.search.replace(/\?code=/, '');
      const code = getQueryString('code');
      const remember = getQueryString('remember');

      const str = remember == null ? '' : `?remember=${remember}`;
      const client = remember == '1' ? CLIENT_ID_REMEMBER : CLIENT_ID;
      if (window.location.search.indexOf('code') == -1) {
        window.location.href =
          `${USER_CENTER_URL}` +
          '/uni/oauth/authorize' +
          '?client_id=' +
          client +
          '&response_type=code&redirect_uri=' +
          `${LOCAL_URL}${PUBLIC_URL}login${str}`;
        return;
      }

      const token = await getToken();
      Auth.set('token', token);
      $setToken(token);
      // 从用户中心获取username
      let username = await getUsername(token);

      if (isLocalhost) {
        //本地登录，由于跨域无法通过response中的set-cookie来设置cookie设置username，
        //从而导致username从上述接口获取不到
        //故本地写死USERNAME，可以在evn.ts文件中修改，否则本地无法用谷歌浏览器登录
        username = USERNAME;
      }
      Auth.set('username', username);
      $setUsername(username);

      // 使用username从用户中心获取用户信息
      const userInfoRes = await request(
        '/api/usercenter/user/info/front',
        'GET',
        {
          username: username,
        },
        { mustAuthenticated: false },
      );

      if (_get(userInfoRes, 'code') === 200) {
        const companies = _get(userInfoRes, 'data.companies', []);
        const companyId = _get(userInfoRes, 'data.companyId', '');
        const operatorName = _get(userInfoRes, 'data.name', '');
        const selectedCompany = companies.find((x: any) => (x.companyId = companyId));
        const rolesIds = _get(userInfoRes, 'data.companyRoles', [])
          .map((x: any) => x.id)
          .join(',');
        Auth.set('mobilePhone', _get(userInfoRes, 'data.mobilePhone'));
        console.log(_get(userInfoRes, 'data.mobilePhone'));

        Auth.set('schoolId', _get(selectedCompany, 'companyId'));
        $setSchoolId(_get(selectedCompany, 'companyId'));

        Auth.set('companyId', companyId);
        $setCompanyId(companyId);

        Auth.set('operatorName', operatorName);
        $setOperatorName(operatorName);

        // 如果companyId为空则强制用户登出
        if (!companyId) {
          await message.error('该账号无权限，请联系管理员', 2);
          handleLogout();
        }

        Auth.set('rolesIds', rolesIds);
        $setRolesIds(rolesIds);

        Auth.set('userId', _get(userInfoRes, 'data.id'));
        $setUserId(_get(userInfoRes, 'data.id'));
        const pwdRes = await _getPwdStatus();
        if (pwdRes?.data === true) {
          $setPwdExpire(true);
        } else {
          $setPwdExpire(false);
        }
      }
    }
  }, []);

  return null;
}
