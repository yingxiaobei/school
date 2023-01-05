import { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { withRouter } from 'react-router';
import { Layout, message } from 'antd';
import { Auth, _get } from 'utils';
import styles from './PortalLayout.module.css';
import { get } from 'lodash';
import { SCHOOL_TIME_QUERY, PORTAL_URL, PUBLIC_URL } from 'constants/env';
import LoginModal from './LoginModal';
import { useForceUpdate, useVisible, useGoto } from 'hooks';
import { _createToken } from 'app/yantai/_api';
import GlobalContext from 'globalContext';

const { Header, Content } = Layout;

function PortalLayout(props: any) {
  const history = useHistory();
  const [visible, _switchVisible] = useVisible();
  const [ignore, forceUpdate] = useForceUpdate();
  const { _push } = useGoto();
  const { $setOpenAPIToken } = useContext(GlobalContext);

  const PATH_ARR = [
    { path: `common/home`, title: '首页' },
    { path: SCHOOL_TIME_QUERY, title: '学时查询' },
    { path: PORTAL_URL, title: '网络学习' },
    { path: `teaching/teachingEvaluation`, title: '教学评价' },
    {
      path: `rank/school`,
      title: '驾校排行',
      subPath: [
        'rank/school',
        'rank/school/detail',
        'rank/schoolDynamic',
        'rank/schoolDynamic/detail',
        'rank/evaluate',
        'rank/evaluate/detail',
        'rank/schoolRed',
        'rank/schoolRed/detail',
        'rank/schoolBlack',
        'rank/schoolBlack/detail',
        'rank/coachRed',
        'rank/coachRed/detail',
        'rank/coachBlack',
        'rank/coachBlack/detail',
      ],
    },
    { path: `cms/notification`, title: '通知公告', subPath: ['cms/notification/detail'] },
    { path: `cms/businessGuide`, title: '办事指南', subPath: ['cms/businessGuide/detail'] },
    { path: `cms/regulation`, title: '政策法规', subPath: ['cms/regulation/detail'] },
    { path: `cms/industryDynamics`, title: '行业动态', subPath: ['cms/industryDynamics/detail'] },
    { path: `cms/industryStyle`, title: '行业风采', subPath: ['cms/industryStyle/detail'] },
  ];

  useEffect(() => {
    async function getToken() {
      const res = await _createToken();
      if (_get(res, 'access_token.length') > 0) {
        const token = _get(res, 'token_type') + ' ' + _get(res, 'access_token');
        Auth.set('openAPIToken', token);
        $setOpenAPIToken(token);
      }
    }

    getToken();
  }, []);

  function _handleClick(item: any, index: number) {
    forceUpdate();
    const { path } = item;
    if ([`teaching/teachingEvaluation`, PORTAL_URL].includes(path)) {
      if (!Auth.isAuthenticated()) {
        message.info('请先登录');
        return;
      }
      if (!Auth.get('sid')) {
        message.info('请先完成认证');
        return;
      }
    }

    if (PORTAL_URL === path) {
      window.open(PORTAL_URL);
      return;
    }

    if (SCHOOL_TIME_QUERY === path) {
      window.open(SCHOOL_TIME_QUERY);
      return;
    }

    _push(item.path);
  }

  return (
    <>
      {visible && <LoginModal onCancel={_switchVisible} />}
      <div className={styles.wrapper}>
        <Layout
          // className={`ie-basic-layout-wrapper`}
          style={{
            minHeight: '100vh',
            background: 'unset',
            minWidth: 1200,
            width: 1200,
            margin: '0 auto',
          }}
        >
          <div style={{ fontWeight: 'bold', color: '#098DFF', fontSize: 33 }}>烟台机动车驾驶培训公众服务平台</div>
          <div style={{ fontWeight: 'bold', color: '#098DFF', marginBottom: 20 }}>
            YANTAI MOTOR VEHICLE DRIVER TRAINING PUBLIC SERVICE PLATFORM
          </div>
          <Header
            style={{
              padding: 0,
              background: '#098DFF',
              width: 1200,
            }}
          >
            <div className={styles.navTab} key={ignore}>
              {PATH_ARR.map((item, index) => {
                const subPaths = (PATH_ARR[index]?.subPath || []).map((path) => `${PUBLIC_URL}${path}`);

                return (
                  <span
                    key={index}
                    onClick={() => _handleClick(item, index)}
                    className={
                      [`${PUBLIC_URL}${PATH_ARR[index]?.path}`, ...subPaths].includes(get(history, 'location.pathname'))
                        ? styles.tabLIne
                        : ''
                    }
                  >
                    {item.title}
                  </span>
                );
              })}
            </div>
          </Header>
          <Content style={{ marginTop: 30 }} className="ie_content_bg">
            {props.children}
          </Content>
        </Layout>
      </div>
    </>
  );
}

export default withRouter(PortalLayout);
