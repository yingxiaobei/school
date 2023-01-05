import { useEffect, useContext, useState } from 'react';
import 'quill/dist/quill.snow.css';
import { useHistory } from 'react-router-dom';
import { withRouter } from 'react-router';
import { Layout, message, Menu, Dropdown, Empty } from 'antd';
import { Auth, _get } from 'utils';
import styles from './WenZhouLayout.module.css';
import { get } from 'lodash';
import { SCHOOL_TIME_QUERY, PORTAL_URL, PUBLIC_URL, USER_CENTER_URL, SCHOOL_URL, SYS_URL } from 'constants/env';
import LoginModal from './LoginModal';
import { useForceUpdate, useVisible, useGoto } from 'hooks';
import { _createToken, _getPortalSubjectList, _getTemplate, _getTplConfigList } from 'app/yantai/_api';
import GlobalContext from 'globalContext';
import TITLE from 'statics/images/portal/title.png';
import { DownOutlined } from '@ant-design/icons';
import QRCODE from 'statics/images/portal/wellQRcode.png';

const { Header, Content, Footer } = Layout;

function WenZhouLayout(props: any) {
  const { menuData } = props;
  const history = useHistory();
  const [visible, _switchVisible] = useVisible();
  const [ignore, forceUpdate] = useForceUpdate();
  const { _push } = useGoto();
  const { $setOpenAPIToken, $setPublicMenuTreeData } = useContext(GlobalContext);
  const [templateRes, setTemplateRes] = useState({});
  const [headerArr, setHeaderArr] = useState<any>([]);
  const [pageRes, setPageRes] = useState({});

  useEffect(() => {
    $setPublicMenuTreeData(menuData);
  }, [menuData.length]);

  const menuDataArr: any = menuData.map(async (x: any) => {
    if (x.showType == 'home') {
      return { path: `common/wenzhouHome`, title: x.name };
    }

    if (x.showType == 'coach') {
      return { path: `wenzhou_coach/coach`, title: x.name };
    }
    if (x.showType == 'school') {
      return { path: `rank/school`, title: x.name };
    }
    if (x.showType == 'link') {
      const res = await _getPortalSubjectList({
        limit: 99, //每页条数
        page: 1, //前页
        type: x.itemId,
      });
      return { title: x.name, path: _get(res, 'data.rows.0.url'), type: 'link' };
    }
    if (x.showType === 'information') {
      if (!x.children) {
        return {};
      }
      return { path: `cms/information/${_get(x, 'children.0.itemId')}`, title: x.name };
    }
    return {};
  });

  async function getHeaderArr() {
    const temArr = [];
    for (const item of menuDataArr) {
      const res = await item;
      temArr.push(res);
    }
    setHeaderArr(temArr);
  }

  useEffect(() => {
    getHeaderArr();
  }, [menuDataArr.length]);

  const PATH_ARR = [
    { path: `common/wenzhouHome`, title: '首页' },
    {
      path: `cms/notification`,
      title: '行业信息',
      subPath: [
        'cms/notification/detail',
        'cms/industryDynamics',
        'cms/industryDynamics/detail',
        'rank/schoolRed',
        'rank/schoolRed/detail',
        'rank/schoolBlack',
        'rank/schoolBlack/detail',
        'cms/regulation',
        'cms/regulation/detail',
      ],
    },
    { path: `wenzhou_coach/coach`, title: '教练排行', subPath: ['wenzhou_coach/coach/detail'] },
    {
      path: `rank/school`,
      title: '驾校排行',
      subPath: ['rank/school', 'rank/school/detail'],
    },
    { path: PORTAL_URL, title: '理论学习' },
    {
      path: `wenzhou_contactUs/about`,
      title: '联系我们',
      subPath: ['wenzhou_contactUs/about', 'wenzhou_contactUs/questions', 'wenzhou_contactUs/legalStatement'],
    },
  ];

  useEffect(() => {
    async function getToken() {
      const res = await _createToken();
      if (_get(res, 'access_token.length') > 0) {
        const token = _get(res, 'token_type') + ' ' + _get(res, 'access_token');
        Auth.set('openAPIToken', token);
        $setOpenAPIToken(token);
      }
      const res2 = await _getTemplate({ page: 1, limit: 9 });
      setTemplateRes(_get(res2, 'data.rows.0', {}));
      const pageContent = await _getTplConfigList({
        site: 'page_footer',
        page: 1,
        limit: 99,
      });
      const pageFooter = _get(pageContent, 'data.rows.0', []);
      const pageFooterId = _get(pageFooter, 'itemId', '');
      if (!pageFooterId) {
        return setPageRes([]);
      }
      const pageRes = await _getPortalSubjectList({
        limit: 99, //每页条数
        page: 1, //前页
        type: pageFooterId,
      });
      setPageRes(_get(pageRes, 'data.rows.0'));
    }

    getToken();
  }, []);

  function _handleClick(item: any, index: number) {
    forceUpdate();
    const { path, type = '' } = item;
    if ([`teaching/teachingEvaluation`].includes(path)) {
      if (!Auth.isAuthenticated()) {
        message.info('请先登录');
        return;
      }
      if (!Auth.get('sid')) {
        message.info('请先完成认证');
        return;
      }
    }

    if (type === 'link') {
      window.open(path);
      return;
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
  const menu = (
    <Menu>
      <Menu.Item
        onClick={() => {
          window.open(SCHOOL_URL);
        }}
      >
        驾校登录
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          window.open(PORTAL_URL);
        }}
      >
        学员登录
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          window.open(SCHOOL_URL);
        }}
      >
        管理登录
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      {visible && <LoginModal onCancel={_switchVisible} />}
      <div>
        <Layout
          // className={`ie-basic-layout-wrapper`}
          style={{
            minHeight: '100vh',
            background: 'unset',
            minWidth: 1200,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <div className="flex">
            <div className="flex1"></div>
            <div style={{ width: 1200 }} className="flex">
              <div className="flex1">
                {_get(templateRes, 'showUrl') ? (
                  <img
                    src={_get(templateRes, 'showUrl')}
                    style={{ width: 360, height: 55 }}
                    className="mt20 mb20 ml20"
                  />
                ) : (
                  <Empty
                    style={{ width: 360, height: 55 }}
                    className="flex-box mt20 mb20 ml20"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span>暂无图片</span>}
                  />
                )}
              </div>
              <div
                className="mt10 fz12"
                style={{
                  alignSelf: 'center',
                  background: '#F2F2F2',
                  color: '#777777',
                  padding: 5,
                  width: 100,
                  textAlign: 'center',
                }}
              >
                <Dropdown overlay={menu}>
                  <span className="pointer">
                    用户登录
                    <DownOutlined className="ml20" />
                  </span>
                </Dropdown>
              </div>
            </div>
            <div className="flex1"></div>
          </div>
          <Header
            style={{
              padding: 0,
              background: '#2E93F2',
            }}
            className="flex"
          >
            <div className="flex1"></div>
            <div className={styles.navTab} style={{ width: 1200 }} key={ignore}>
              {headerArr.map((item: any, index: any) => {
                const subPaths = (headerArr[index]?.subPath || []).map((path: any) => `${PUBLIC_URL}${path}`);
                if (Object.keys(item).length === 0) {
                  return;
                }
                return (
                  <span key={index} onClick={() => _handleClick(item, index)}>
                    <span
                      className={
                        [`${PUBLIC_URL}${headerArr[index]?.path}`, ...subPaths].includes(
                          get(history, 'location.pathname'),
                        )
                          ? styles.tabLIne
                          : ''
                      }
                    >
                      {item.title}
                    </span>
                  </span>
                );
              })}
            </div>

            <div className="flex1"></div>
          </Header>
          <Content className="ie_content_bg">{props.children}</Content>
          <div
            style={{
              background: '#E2E2E2',
              fontSize: 10,
              color: '#707070',
            }}
            className="p10 flex-box mt20 mb10  ml20 mr20"
          >
            <div
              style={{
                flexDirection: 'column',
              }}
              className="flex-box mr20"
            >
              <div className="ql-snow">
                <div
                  className="ql-editor"
                  style={{
                    maxHeight: 90,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  dangerouslySetInnerHTML={{ __html: _get(pageRes, 'content') }}
                ></div>
              </div>
              {/* <span>
                建议您使用Chrome、Edge、360（极速模式）等浏览器，分辨率1280*800及以上浏览本网站，获得更好用户体验。
              </span>
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  window.open('https://beian.miit.gov.cn');
                }}
              >
                浙ICP备09003683号-5 浙公网安备 33010802008747号
              </span>
              <span>主办单位：机动车驾驶培训行业协会 技术支持：远方维尔科技有限公司</span> */}
            </div>
            <div
              style={{
                flexDirection: 'column',
              }}
              className="flex-box "
            >
              {<img src={_get(pageRes, 'img.fileUrl')} style={{ width: 100 }} />}
            </div>
          </div>
        </Layout>
      </div>
    </>
  );
}

export default withRouter(WenZhouLayout);
