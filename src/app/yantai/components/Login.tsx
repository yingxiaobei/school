import { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Input, Form, message, Row, Col, Spin } from 'antd';
import { _getLogin, _getUserId, _getBaseInfo, _checkExistByUserName } from '../_api';
import { Auth, _get } from 'utils';
import GlobalContext from 'globalContext';
import Certify from './Certify';
import UpdatePassword from './UpdatePassword';
import { useVisible } from 'hooks';
import FindPassword from './FindPassword';

export function Login() {
  const { $setToken, $setSchoolId, $setCompanyId, $setOperatorName, $setRolesIds } = useContext(GlobalContext);
  const [certifyVisible, _setCertifyVisible] = useVisible();
  const [updatePasswordVisible, _setUpdatePasswordVisible] = useVisible();
  const [forgetPasswordVisible, _setForgetPasswordVisible] = useVisible();
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  async function _onFinish(values: any) {
    setLoading(true);
    if (!_get(values, 'username')) {
      message.error('请输入用户名');
      return;
    }

    if (!_get(values, 'password')) {
      message.error('请输入密码');
      return;
    }

    const res = await _getLogin(values);
    if (res?.access_token) {
      const token: string = _get(res, 'access_token');
      Auth.set('token', token);
      Auth.set('username', _get(values, 'username', ''));
      $setToken(token);

      // 使用username从用户中心获取用户信息
      const userInfoRes = await _getUserId({ username: Auth.get('username') as string });

      const companies = _get(userInfoRes, 'data.companies', []);
      const companyId = _get(userInfoRes, 'data.companyId', '');
      const operatorName = _get(userInfoRes, 'data.name', '');
      const selectedCompany = companies.find((x: any) => (x.companyId = companyId));
      const rolesIds = _get(userInfoRes, 'data.companyRoles', [])
        .map((x: any) => x.id)
        .join(',');

      // FIXME:
      Auth.set('schoolId', _get(selectedCompany, 'companyId', ''));
      $setSchoolId(_get(selectedCompany, 'companyId', ''));

      Auth.set('companyId', companyId);
      $setCompanyId(companyId);

      Auth.set('operatorName', operatorName);
      $setOperatorName(operatorName);

      Auth.set('rolesIds', rolesIds);
      $setRolesIds(rolesIds);

      Auth.set('userId', _get(userInfoRes, 'data.id'));

      const baseInfo = await _getBaseInfo({ userId: _get(userInfoRes, 'data.id') });
      Auth.set('sid', _get(baseInfo, 'data.sid', ''));

      Auth.set('name', _get(baseInfo, 'data.name', ''));

      const studentRes = await _checkExistByUserName({ username: _get(values, 'username', '') });
      Auth.set('isStudent', _get(studentRes, 'data', false));

      setLoading(false);
    } else {
      message.error('用户名或者密码不正确');
    }
  }

  const isLoginSucess: string | null = Auth.get('token'); // 是否成功登录

  return (
    <>
      {/* 认证 */}
      {certifyVisible && <Certify onCancel={_setCertifyVisible} loginStatus={isLoginSucess ? true : false} />}

      {/* 修改密码 */}
      {updatePasswordVisible && <UpdatePassword onCancel={_setUpdatePasswordVisible} />}

      {/* 忘记密码 */}
      {forgetPasswordVisible && <FindPassword onCancel={_setForgetPasswordVisible} />}

      <div
        style={{
          background: '#fff',
          paddingTop: 16,
          paddingBottom: 16,
          paddingRight: 10,
          marginBottom: 20,
          textAlign: 'center',
        }}
      >
        {!isLoginSucess && (
          <Form onFinish={_onFinish} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
            <Row style={{ height: 50 }}>
              <Col span={18}>
                <Form.Item name="username" label="用户名">
                  <Input style={{ width: 130 }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Button type="primary" htmlType="submit">
                  登录
                </Button>
              </Col>
            </Row>

            <Row style={{ height: 40, overflow: 'hidden' }}>
              <Col span={18}>
                <Form.Item name="password" label="密码">
                  <Input type="password" style={{ width: 130 }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Button
                  type="primary"
                  onClick={_setCertifyVisible}
                  style={{ background: '#DCDCDC', borderColor: '#DCDCDC' }}
                >
                  认证
                </Button>
              </Col>
            </Row>
            <Row
              justify="end"
              style={{ paddingRight: 14, color: '#999999', fontSize: 12, cursor: 'pointer' }}
              onClick={_setForgetPasswordVisible}
            >
              忘记密码?
            </Row>
          </Form>
        )}

        {isLoginSucess && loading && <Spin />}

        {isLoginSucess && !loading && (
          <div style={{ height: 120 }} className="text-center">
            <div>姓名:{Auth.get('sid') && Auth.get('userId') ? Auth.get('name') : Auth.get('username')}</div>
            <div className="mt20">
              <Button type="primary" className="mr20" onClick={_setUpdatePasswordVisible}>
                修改密码
              </Button>
              <Button
                type="primary"
                className="mr20"
                onClick={() => {
                  Auth.del();
                  history.go(0);
                }}
              >
                退出登录
              </Button>
              {!Auth.get('sid') && (
                <Button type="primary" onClick={_setCertifyVisible}>
                  认证
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
