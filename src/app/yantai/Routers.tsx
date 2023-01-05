import { Suspense, lazy } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Loading } from 'components';
import { isEmpty, flatten, values } from 'lodash';
import { Layout, Divider, Dropdown, Menu } from 'antd';
import { PUBLIC_URL } from 'constants/env';
import NotFoundPage from 'app/school/pages/404';
import PortalLayout from 'layouts/PortalLayout';
import WenZhouLayout from 'layouts/WenZhouLayout';
import CMSNavigation from 'layouts/CMSNavigation';
import { _get } from 'utils';
import * as PageRouters from 'app/yantai/pages/router';

const { Sider, Content } = Layout;

const otherRouters = [
  {
    path: '/cms/notification/detail',
    component: lazy(() => import('app/yantai/pages/cms/notification/detail')),
  },
  {
    path: '/cms/businessGuide/detail',
    component: lazy(() => import('app/yantai/pages/cms/businessGuide/detail')),
  },
  {
    path: '/cms/regulation/detail',
    component: lazy(() => import('app/yantai/pages/cms/regulation/detail')),
  },
  {
    path: '/cms/industryDynamics/detail',
    component: lazy(() => import('app/yantai/pages/cms/industryDynamics/detail')),
  },
  {
    path: '/cms/industryStyle/detail',
    component: lazy(() => import('app/yantai/pages/cms/industryStyle/detail')),
  },
  {
    path: '/rank/school/detail',
    component: lazy(() => import('app/yantai/pages/rank/school/detail')),
  },
  {
    path: '/rank/schoolDynamic/detail',
    component: lazy(() => import('app/yantai/pages/rank/schoolDynamic/detail')),
  },
  {
    path: '/rank/evaluate/detail',
    component: lazy(() => import('app/yantai/pages/rank/evaluate/detail')),
  },
  {
    path: '/rank/schoolRed/detail',
    component: lazy(() => import('app/yantai/pages/rank/schoolRed/detail')),
  },
  {
    path: '/rank/schoolBlack/detail',
    component: lazy(() => import('app/yantai/pages/rank/schoolBlack/detail')),
  },
  {
    path: '/rank/coachRed/detail',
    component: lazy(() => import('app/yantai/pages/rank/coachRed/detail')),
  },
  {
    path: '/rank/coachBlack/detail',
    component: lazy(() => import('app/yantai/pages/rank/coachBlack/detail')),
  },
  {
    path: '/learningNotice/signUpNotice/detail',
    component: lazy(() => import('app/yantai/pages/learningNotice/signUpNotice/detail')),
  },
  {
    path: '/learningNotice/learningProcess/detail',
    component: lazy(() => import('app/yantai/pages/learningNotice/learningProcess/detail')),
  },
  {
    path: '/learningNotice/examNotice/detail',
    component: lazy(() => import('app/yantai/pages/learningNotice/examNotice/detail')),
  },
  {
    path: '/learningNotice/paymentProcess/detail',
    component: lazy(() => import('app/yantai/pages/learningNotice/paymentProcess/detail')),
  },
  {
    path: '/learningNotice/teachingProgram/detail',
    component: lazy(() => import('app/yantai/pages/learningNotice/teachingProgram/detail')),
  },
  {
    path: '/wenzhou_contactUs/about/detail',
    component: lazy(() => import('app/yantai/pages/wenzhou_contactUs/about/detail')),
  },
  {
    path: '/wenzhou_contactUs/questions/detail',
    component: lazy(() => import('app/yantai/pages/wenzhou_contactUs/questions/detail')),
  },
  {
    path: '/wenzhou_contactUs/legalStatement/detail',
    component: lazy(() => import('app/yantai/pages/wenzhou_contactUs/legalStatement/detail')),
  },
  {
    path: '/wenzhou_coach/coach/detail',
    component: lazy(() => import('app/yantai/pages/wenzhou_coach/coach/detail')),
  },
];

const CMS_MENUS = [
  { title: '通知公告', path: '/cms/notification', subPath: '/cms/notification/detail' },
  { title: '办事指南', path: '/cms/businessGuide', subPath: '/cms/businessGuide/detail' },
  { title: '政策法规', path: '/cms/regulation', subPath: '/cms/regulation/detail' },
  { title: '行业动态', path: '/cms/industryDynamics', subPath: '/cms/industryDynamics/detail' },
  { title: '行业风采', path: '/cms/industryStyle', subPath: '/cms/industryStyle/detail' },
];
const WENZHOU_CMS_MENUS = [
  { title: '通知公告', path: '/cms/notification', subPath: '/cms/notification/detail' },
  { title: '行业动态', path: '/cms/industryDynamics', subPath: '/cms/industryDynamics/detail' },
  { title: '驾校红榜', path: '/rank/schoolRed', subPath: '/rank/schoolRed/detail' },
  { title: '驾校黑榜', path: '/rank/schoolBlack', subPath: '/rank/schoolBlack/detail' },
  { title: '政策法规', path: '/cms/regulation', subPath: '/cms/regulation/detail' },
];

const RANK_LIST_MENUS: any[] = [
  { title: '驾校排行', path: '/rank/school', subPath: '/rank/school/detail' },
  { title: '驾校动态', path: '/rank/schoolDynamic', subPath: '/rank/schoolDynamic/detail' },
  { title: '驾校能力核定', path: '/rank/evaluate', subPath: '/rank/evaluate/detail' },
  { title: '驾校红榜', path: '/rank/schoolRed', subPath: '/rank/schoolRed/detail' },
  { title: '驾校黑榜', path: '/rank/schoolBlack', subPath: '/rank/schoolBlack/detail' },
  { title: '教练红榜', path: '/rank/coachRed', subPath: '/rank/coachRed/detail' },
  { title: '教练黑榜', path: '/rank/coachBlack', subPath: '/rank/coachBlack/detail' },
];
const WENZHOU_SCHOOL_MENUS: any[] = [{ title: '驾校排行', path: '/rank/school', subPath: '/rank/school/detail' }];

const LEARNING_NOTICE: any[] = [
  { title: '报名须知', path: '/learningNotice/signUpNotice', subPath: '/learningNotice/signUpNotice/detail' },
  { title: '学车流程', path: '/learningNotice/learningProcess', subPath: '/learningNotice/learningProcess/detail' },
  { title: '考试须知', path: '/learningNotice/examNotice', subPath: '/learningNotice/examNotice/detail' },
  { title: '支付流程', path: '/learningNotice/paymentProcess', subPath: '/learningNotice/paymentProcess/detail' },
  { title: '教学大纲', path: '/learningNotice/teachingProgram', subPath: '/learningNotice/teachingProgram/detail' },
];

const ABOUT_MENUS = [
  { title: '关于我们', path: '/wenzhou_contactUs/about', subPath: '/wenzhou_contactUs/about/detail' },
  { title: '常见问题', path: '/wenzhou_contactUs/questions', subPath: '/wenzhou_contactUs/questions/detail' },
  { title: '法律声明', path: '/wenzhou_contactUs/legalStatement', subPath: '/wenzhou_contactUs/legalStatement/detail' },
];

const COACH_MENUS = [{ title: '找教练', path: '/wenzhou_coach/coach', subPath: '/wenzhou_coach/coach/detail' }];

export default function Routers(props: any) {
  const { menuData } = props;
  const CurrentLayout: any = {
    WENZHOU_PORTAL: WenZhouLayout,
    YANTAI_PORTAL: PortalLayout,
  }[process.env.REACT_APP_PROJECT as string];

  const currentHome: any = {
    WENZHOU_PORTAL: `${PUBLIC_URL}common/wenzhouHome`,
    YANTAI_PORTAL: `${PUBLIC_URL}common/home`,
  }[process.env.REACT_APP_PROJECT as string];

  const CURRENT_CMS_MENUS: any = {
    WENZHOU_PORTAL: WENZHOU_CMS_MENUS,
    YANTAI_PORTAL: CMS_MENUS,
  }[process.env.REACT_APP_PROJECT as string];

  const CURRENT_RANK_MENUS: any = {
    WENZHOU_PORTAL: WENZHOU_SCHOOL_MENUS,
    YANTAI_PORTAL: RANK_LIST_MENUS,
  }[process.env.REACT_APP_PROJECT as string];

  const informationArr: any = [];
  let informationObject: any = {};
  const infoMenu = menuData.filter((x: any) => {
    return x.showType === 'information';
  });

  for (var i = 0; i < _get(infoMenu, 'length', 0); i++) {
    var name = 'name-' + i;
    informationObject[name] = [];
  }
  (infoMenu || []).forEach((item: any, index: any) => {
    _get(item, 'children', []).forEach((x: any, y: any) => {
      if (y == 0) {
        informationObject[`name-${index}`].push({
          subMenuArr: informationObject[`name-${index}`],
          type: item.showType,
          title: item.name,
          path: ``,
          subPath: ``,
        });
      }
      informationObject[`name-${index}`].push({
        subMenuArr: informationObject[`name-${index}`],
        type: item.showType,
        title: x.name,
        path: `/cms/information/${x.itemId}`,
        subPath: `/cms/information/${x.itemId}/detail`,
        component: lazy(() => import('app/yantai/pages/cms/information')),
        subComponent: lazy(() => import('app/yantai/pages/cms/information/detail')),
      });
    });
  });

  return (
    <CurrentLayout menuData={menuData}>
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route exact path={PUBLIC_URL}>
            <Redirect to={`${currentHome}`} />
          </Route>

          {[...flatten(values(PageRouters)), ...otherRouters, ...flatten(values(informationObject))].map((x) => {
            if (x.type === 'information') {
              return [
                <Route exact path={PUBLIC_URL + x.path.replace(/^\//, '')} key={x.path}>
                  <Layout style={{ width: 1200, margin: 'auto' }}>
                    <CMSNavigation menus={x.subMenuArr} />

                    <Content>
                      <x.component />
                    </Content>
                  </Layout>
                </Route>,
                <Route exact path={PUBLIC_URL + x.subPath.replace(/^\//, '')} key={x.subPath}>
                  <Layout style={{ width: 1200, margin: 'auto' }}>
                    <CMSNavigation menus={x.subMenuArr} />

                    <Content>
                      <x.subComponent />
                    </Content>
                  </Layout>
                </Route>,
              ];
            }

            if (CURRENT_CMS_MENUS.some((y: any) => y.path === x.path || y.subPath === x.path)) {
              return (
                <Route exact path={PUBLIC_URL + x.path.replace(/^\//, '')} key={x.path}>
                  <Layout style={{ width: 1200, margin: 'auto' }}>
                    <CMSNavigation menus={CURRENT_CMS_MENUS} />

                    <Content>
                      <x.component />
                    </Content>
                  </Layout>
                </Route>
              );
            }

            if (ABOUT_MENUS.some((y) => y.path === x.path || y.subPath === x.path)) {
              return (
                <Route exact path={PUBLIC_URL + x.path.replace(/^\//, '')} key={x.path}>
                  <Layout style={{ width: 1200, margin: 'auto' }}>
                    <CMSNavigation menus={ABOUT_MENUS} />

                    <Content>
                      <x.component />
                    </Content>
                  </Layout>
                </Route>
              );
            }

            if (COACH_MENUS.some((y) => y.path === x.path || y.subPath === x.path)) {
              return (
                <Route exact path={PUBLIC_URL + x.path.replace(/^\//, '')} key={x.path}>
                  <Layout style={{ width: 1200, margin: 'auto' }}>
                    {/* <CMSNavigation menus={COACH_MENUS} /> */}

                    <Content>
                      <x.component />
                    </Content>
                  </Layout>
                </Route>
              );
            }

            if (CURRENT_RANK_MENUS.some((y: any) => y.path === x.path || y.subPath === x.path)) {
              return (
                <Route exact path={PUBLIC_URL + x.path.replace(/^\//, '')} key={x.path}>
                  <Layout style={{ width: 1200, margin: 'auto' }}>
                    {_get(CURRENT_RANK_MENUS, 'length', 0) > 1 && <CMSNavigation menus={CURRENT_RANK_MENUS} />}

                    <Content>
                      <x.component />
                    </Content>
                  </Layout>
                </Route>
              );
            }

            if (LEARNING_NOTICE.some((y) => y.path === x.path || y.subPath === x.path)) {
              return (
                <Route exact path={PUBLIC_URL + x.path.replace(/^\//, '')} key={x.path}>
                  <Layout style={{ width: 1200, margin: 'auto' }}>
                    <CMSNavigation menus={LEARNING_NOTICE} />

                    <Content>
                      <x.component />
                    </Content>
                  </Layout>
                </Route>
              );
            }

            return (
              <Route exact path={PUBLIC_URL + x.path.replace(/^\//, '')} key={x.path}>
                <x.component />
              </Route>
            );
          })}

          <Route>
            <NotFoundPage />
          </Route>
        </Switch>
      </Suspense>
    </CurrentLayout>
  );
}
