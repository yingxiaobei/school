import React, { Suspense, lazy, useContext, useMemo } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { isEmpty, flatten, values } from 'lodash';
import 'normalize.css';
import BasicLayout from 'layouts/BasicLayout';
import Login from 'app/school/pages/login';
import Mock from 'app/school/pages/mock';
import { Loading } from 'components';
import { PUBLIC_URL } from 'constants/env';
import NotFoundPage from 'app/school/pages/404';
import GlobalContext from 'globalContext';
import { findFirstMenuPath, generateMenuMap } from 'utils';
import * as PageRouters from 'app/school/pages/router';
import RobotMonitor from './pages/robotCoach/monitorManage/index';
import Home from 'components/Home';

export default function Routers() {
  const { $menuTree } = useContext(GlobalContext);
  const firstMenuPath = useMemo(() => findFirstMenuPath($menuTree), [$menuTree]);
  const hash = useMemo(() => generateMenuMap($menuTree), [$menuTree]);
  return (
    <Switch>
      <Route exact path={PUBLIC_URL}>
        <Redirect to={`${PUBLIC_URL}home`} />
      </Route>

      <Route exact path={`${PUBLIC_URL}login`}>
        <Login />
      </Route>
      <Route exact path={`${PUBLIC_URL}robotCoach/monitorManage`}>
        <RobotMonitor />
      </Route>

      <BasicLayout>
        <Suspense fallback={<Loading />}>
          {!isEmpty($menuTree) && (
            <Switch>
              <Route exact path={`${PUBLIC_URL}home`}>
                <Home />
              </Route>
              {flatten(values(PageRouters) as { path: string; component: React.FunctionComponent }[][]).map((x) => (
                <Route path={PUBLIC_URL + x.path.replace(/^\//, '')} key={x.path}>
                  {hash[x.path.replace(/^\//, '')] || process.env.NODE_ENV === 'development' ? (
                    <x.component />
                  ) : (
                    <NotFoundPage />
                  )}
                </Route>
              ))}
              <Route exact path={`${PUBLIC_URL}mock`}>
                <Mock />
              </Route>
              <Route>
                <NotFoundPage />
              </Route>
            </Switch>
          )}
        </Suspense>
      </BasicLayout>
    </Switch>
  );
}
