import React, { useState, useEffect, useRef, useContext, Suspense, useMemo } from 'react';
import TabPanes from 'components/tabPanes';
import { connect } from 'react-redux';
import * as actions from 'store/actions';
import { getKeyName } from 'utils';
import { useHistory, useLocation } from 'react-router-dom';
import GlobalContext from 'globalContext';
import { Loading } from 'components';
import { PUBLIC_URL } from 'constants/env';
import { generateMenuMap } from 'utils';
import { flatten, values } from 'lodash';
import * as PageRouters from '../app/school/pages/router';
// const noNewTab: any = [`${PUBLIC_URL}home`]; // 不需要新建 tab的页面
const noCheckAuth = [`${PUBLIC_URL}home`, `${PUBLIC_URL}404`]; // 不需要检查权限的页面

interface Props extends ReduxProps {}

interface PanesItemProps {
  title: string;
  content: any;
  key: string;
  closable: boolean;
  path: string;
}

const TabContent = (props: any) => {
  const [tabActiveKey, setTabActiveKey] = useState<string>('home');
  const [panesItem, setPanesItem] = useState<PanesItemProps>({
    title: '',
    content: null,
    key: '',
    closable: false,
    path: '',
  });
  const pathRef: RefType = useRef<string>('');

  const { $allRouterWithName } = useContext(GlobalContext);
  const { $menuTree } = useContext(GlobalContext);
  const hash = useMemo(() => generateMenuMap($menuTree), [$menuTree]);
  const history = useHistory();
  const { pathname, search } = useLocation();

  const { setStoreData } = props;
  // 检查权限
  const checkAuth = (newPathname: string): boolean => {
    // 不需要检查权限的
    if (noCheckAuth.includes(newPathname)) {
      return true;
    }
    // 过滤$allRouterWithName中无权限路由
    const allHasAuthRouter = $allRouterWithName.filter((f) => hash[f.path.replace(/^\//, '')]);
    const { tabKey: currentKey } = getKeyName(newPathname, allHasAuthRouter);
    return currentKey === '404' ? false : true;
  };
  useEffect(() => {
    setStoreData('SET_COLLAPSED', document.body.clientWidth <= 1366);
    if ($allRouterWithName?.length === 0) {
      return;
    }
    // 未登录  TODO
    // if (!token && pathname !== '/login') {
    //   history.replace({ pathname: '/login' });
    //   return;
    // }
    async function fun() {
      const { tabKey, title, component: Content } = getKeyName(pathname, $allRouterWithName);
      // 新tab已存在或不需要新建tab，return
      if (pathname === pathRef.current /* || noNewTab.includes(pathname) */) {
        setTabActiveKey(tabKey);
        return;
      }

      // 检查权限，比如直接从地址栏输入的，提示无权限
      const isHasAuth = checkAuth(pathname);
      if (!isHasAuth) {
        const errorUrl = flatten(values(PageRouters) as { path: string; component: React.FunctionComponent }[][])
          .map((item) => PUBLIC_URL + item.path.replace(/^\//, ''))
          .includes(pathname)
          ? `${PUBLIC_URL}403`
          : `${PUBLIC_URL}404`;
        const { tabKey: errorKey, title: errorTitle, component: errorContent } = getKeyName(
          errorUrl,
          $allRouterWithName,
        );
        setPanesItem({
          title: errorTitle,
          content: errorContent,
          key: errorKey,
          closable: true,
          path: errorUrl,
        });
        pathRef.current = errorUrl;
        setTabActiveKey(errorKey);
        history.replace(errorUrl);
        return;
      }

      // 记录新的路径，用于下次更新比较
      const newPath = search ? pathname + search : pathname;
      pathRef.current = newPath;
      const content = () => {
        return (
          <Suspense fallback={<Loading />}>
            <Content />
          </Suspense>
        );
      };
      setPanesItem({
        title,
        content: content,
        key: tabKey,
        closable: tabKey !== 'home',
        path: newPath,
      });
      setTabActiveKey(tabKey);
    }
    fun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, pathname, search, setStoreData, $allRouterWithName]);
  return <TabPanes defaultActiveKey="home" panesItem={panesItem} tabActiveKey={tabActiveKey}></TabPanes>;
};

export default connect((state) => state, actions)(TabContent);
