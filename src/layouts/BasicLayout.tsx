import { useState, useMemo, useEffect, useContext, ReactNode } from 'react';
import { useHistory } from 'react-router-dom';
import { Layout, Divider, Dropdown, Menu, message } from 'antd';
import {
  MenuOutlined,
  MenuFoldOutlined,
  DownOutlined /* RightOutlined, LeftOutlined  */,
  MoneyCollectOutlined,
} from '@ant-design/icons';
import Navigation from './Navigation';
import styles from './BasicLayout.module.css';
import { Auth, handleLogout, _get, downloadURL, generateMenuMap } from 'utils';
import { FONT_SIZE_BASE } from 'constants/styleVariables';
import { PUBLIC_URL } from 'constants/env';
import GlobalContext from 'globalContext';
import { useFetch, useForceUpdate, usePrevious, useRequest, useVisible } from 'hooks';
import ChangePassword from './ChangePassword';
import Message from './Message';
import ChangeSchool from './ChangeSchool';
import IMG_YUANFANG from 'statics/images/yuanfang.png';
import IMG_KEDU from 'statics/images/kedu_logo.png';
// import TOOLS from 'statics/images/tools.png';
// import USER from 'statics/images/user.png';
// import POSITION from 'statics/images/position.png';
// import INNER from 'statics/images/inner.png';
import { AuthButton, ErrorBoundary } from 'components';
import TabContent from './TabContent';
import { _getBaseInfo } from 'api';
import { _getList } from 'app/school/pages/addService/goodsManage/_api';
import { _getPwdStatus } from './_api';
const { Header, Content } = Layout;

type IProps = {
  children: ReactNode;
};

export default function BasicLayout(props: IProps) {
  const history = useHistory();
  const [collapsed, setCollapsed] = useState(false);
  const [visible, _switchVisible] = useState(false);
  const [changeSchoolVisible, _switchChangeSchoolVisible] = useVisible();
  const { $menuTree, $token } = useContext(GlobalContext);
  const allMenu: object = generateMenuMap($menuTree);
  const [ignore, forceUpdate] = useForceUpdate();
  const prev = usePrevious(ignore);
  const { $pwdExpire, $setPwdExpire } = useContext(GlobalContext);
  const [containerAnimatedClass, setContainerAnimatedClass] = useState('');
  const tagInfoTemp = (process.env.REACT_APP_TAG_INFO || '').split('_');
  tagInfoTemp.pop();
  const tagInfo = tagInfoTemp.join('');
  const [disable, setDisable] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    if (ignore !== prev) {
      timer = setTimeout(() => {
        setContainerAnimatedClass('testAnimate');
      });
    }
    return () => {
      setContainerAnimatedClass('');
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location.pathname]);

  useEffect(() => {
    if (!Auth.isAuthenticated()) {
      history.push(`${PUBLIC_URL}login`);
    }
  }, [$token, history]);
  // ??????????????????
  const { data: basicInfoData } = useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getBaseInfo,
  });
  useEffect(() => {
    setDisable($pwdExpire);
    if ($pwdExpire) {
      if (visible) return;
      _switchVisible(true);
    } else {
      _switchVisible(false);
    }
  }, [$pwdExpire]);

  useEffect(() => {
    if (!Auth.get('username')) return;
    async function getPasswordStatus() {
      const res = await _getPwdStatus();
      if (res?.data === true) {
        $setPwdExpire(true);
      } else {
        $setPwdExpire(false);
      }
    }
    getPasswordStatus();
  }, []);
  const { run, loading } = useRequest(_getList, {
    onSuccess: (data) => {
      //??????????????????????????????
      //????????????????????????????????????????????????????????????????????????????????????????????????????????????

      if (!data) {
        history.replace(`${PUBLIC_URL}addServiceIntro`);
      } else {
        if (Object.prototype.hasOwnProperty.call(allMenu, 'addService/goodsManage')) {
          history.replace(`${PUBLIC_URL}addService/goodsManage`);
        } else {
          message.info('????????????????????????????????????????????????');
        }
      }
    },
  });

  const isSuperVise = String(_get(basicInfoData, 'type', '')) === '2';

  const pageTitle = useMemo(
    () =>
      history.location.pathname.includes('/publicServicePlatform') || isSuperVise ? (
        '?????????????????????????????????????????????'
      ) : PUBLIC_URL === '/kedu/' ? (
        <>
          <img src={IMG_KEDU} style={{ width: 150 }} className="mr10" alt="" />
          ??????????????????
        </>
      ) : (
        <>
          <img src={IMG_YUANFANG} style={{ marginRight: 4, marginBottom: 4, width: 180 }} alt="" />
          ??????????????????
          <span style={{ fontSize: '12px', marginLeft: '6px', fontWeight: 'normal' }}>{tagInfo}</span>
        </>
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history.location.pathname],
  );
  const { SubMenu } = Menu;
  const menu = (
    <Menu>
      <SubMenu key="download" title="????????????">
        <Menu.Item onClick={() => downloadURL({ url: `${PUBLIC_URL}package.zip`, filename: 'package.zip' })}>
          ????????????
        </Menu.Item>
        <Menu.Item
          onClick={() => downloadURL({ url: `${PUBLIC_URL}print_package.zip`, filename: 'print_package.zip' })}
        >
          ????????????
        </Menu.Item>
      </SubMenu>
      <Menu.Item key="updatePassword" onClick={() => _switchVisible(true)}>
        ????????????
      </Menu.Item>
      <Menu.Item key="back" onClick={handleLogout}>
        ??????
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      {visible && (
        <ChangePassword
          onCancel={() => {
            _switchVisible(false);
          }}
          onOk={() => {
            $setPwdExpire(false);
            _switchVisible(false);
          }}
          title="????????????"
          isPwdExpire={$pwdExpire}
        />
      )}
      {changeSchoolVisible && (
        <ChangeSchool
          onCancel={_switchChangeSchoolVisible}
          onOk={() => {
            _switchChangeSchoolVisible();
            history.push(`${PUBLIC_URL}home`);
            window.location.reload();
          }}
          title="????????????"
        />
      )}
      <div
        id="schoolRoot"
        style={{ pointerEvents: disable ? 'none' : 'initial' }}
        onClick={() => {
          console.log(12);
          if ($pwdExpire) {
            if (!visible) {
              _switchVisible(true);
            }
            message.error('?????????????????????????????????????????????????????????????????????????????????????????????');
          }
        }}
      >
        <Layout
          className="ie-basic-layout-wrapper"
          style={{ height: '100vh', background: '#F3302B', pointerEvents: disable ? 'none' : 'initial' }}
        >
          <Layout>
            <Header style={{ background: '#FFFFFF', padding: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: 30 }}>
                <div>
                  {collapsed ? (
                    <MenuOutlined className={styles.trigger} onClick={() => setCollapsed(!collapsed)} />
                  ) : (
                    <MenuFoldOutlined className={styles.trigger} onClick={() => setCollapsed(!collapsed)} />
                  )}
                  <div style={{ display: 'inline-block', fontWeight: 'bold', fontSize: 22 }}>{pageTitle}</div>
                </div>

                <div style={{ fontSize: FONT_SIZE_BASE }}>
                  <AuthButton
                    authId="addService:btn1"
                    className="mr40 "
                    // size="small"
                    insertWhen={PUBLIC_URL !== '/kedu/'} //???????????????
                    type="primary"
                    loading={loading}
                    onClick={() => {
                      run();
                    }}
                    icon={<MoneyCollectOutlined />}
                  >
                    ????????????
                  </AuthButton>
                  <Message />
                  <span onClick={_switchChangeSchoolVisible}>
                    <span className="pointer">
                      {Auth.get('schoolName')} <DownOutlined style={{ fontSize: 10 }} />
                    </span>
                  </span>
                  {/* <Divider type="vertical" style={{ margin: '0 18px', background: '#fff' }} />
                <Dropdown overlay={tool}>
                  <span className="pointer">
                    <img src={TOOLS} className={'img-icon-s  mr4 mb4'} />
                    ???????????? <DownOutlined />
                  </span>
                </Dropdown> */}
                  <Divider type="vertical" style={{ margin: '0 18px', background: '#fff' }} />
                  <Dropdown overlay={menu}>
                    <span className="pointer">
                      {Auth.get('operatorName')} <DownOutlined />
                    </span>
                  </Dropdown>
                </div>
              </div>
            </Header>

            <Layout style={{ background: '#fff' }}>
              <Navigation
                style={{
                  margin: 0,
                  maxHeight: 'calc(100vh - 64px)',
                  height: 'calc(100vh - 64px)',
                  overflow: 'auto',
                }}
                menus={$menuTree}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                forceUpdate={forceUpdate}
              />
              {/* {collapsed ? (
              <RightOutlined onClick={() => setCollapsed(!collapsed)} />
            ) : (
              <LeftOutlined onClick={() => setCollapsed(!collapsed)} />
            )} */}
              <Content
                id="mainContentLayout"
                style={{
                  padding: 14,
                  background: '#f1f2f7',
                  maxHeight: 'calc(100vh - 64px)',
                  height: 'calc(100vh - 64px)',
                  overflow: 'auto',
                  minWidth: 1200,
                }}
              >
                {
                  <>
                    {/*  <div
                    style={{
                      height: 60,
                      lineHeight: '60px',
                      background: '#fff',
                      paddingLeft: 20,
                      fontSize: 18,
                      fontWeight: 'bolder',
                    }}
                  > */}
                    {/* <img src={HEADER_ICON} alt="" style={{ marginRight: 8 }} /> */}

                    {/* TODO:???????????????????????????????????????????????????????????? */}
                    {/* <span>{MENU_MAP[_get(history, 'location.pathname').replace(PUBLIC_URL, '')]}</span>
                  </div>
                  <div style={{ background: 'rgba(248,248,248,1)', height: 10 }}></div> */}
                  </>
                }

                <div
                  className={styles[containerAnimatedClass]}
                  style={{
                    height: '100%',
                    background: '#FFFFFF',
                    boxShadow: '-1px 1px 20px 0px rgba(59, 55, 85, 0.03)',
                    borderRadius: 20,
                  }}
                >
                  <ErrorBoundary component={<TabContent defaultActiveKey="home"></TabContent>}></ErrorBoundary>
                </div>
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </div>
    </>
  );
}
