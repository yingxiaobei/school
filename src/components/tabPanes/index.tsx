import { FC, useState, useEffect, useRef, useCallback, Component, useContext, useMemo, Suspense } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Tabs, Dropdown, Menu } from 'antd';
import { getKeyName, findFirstMenuPath } from 'utils';
import { SyncOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import * as actions from 'store/actions';
import style from './TabPanes.module.css';
import GlobalContext from 'globalContext';
import Home from 'components/Home';
import { PUBLIC_URL } from 'constants/env';
import { Loading } from 'components';

const { TabPane } = Tabs;

const initPane = [
  {
    title: '工作台',
    key: 'home',
    content: Home,
    closable: false,
    path: `${PUBLIC_URL}home`,
  },
];

interface Props extends ReduxProps {
  defaultActiveKey: string;
  panesItem: {
    title: string;
    content: Component;
    key: string;
    closable: boolean;
    path: string;
  };
  tabActiveKey: string;
}

// 多页签组件
const TabPanes: FC<Props> = (props) => {
  const [activeKey, setActiveKey] = useState<string>('');
  const [isReload, setIsReload] = useState<boolean>(false);
  const [selectedPanel, setSelectedPanel] = useState<CommonObjectType>({});
  const pathRef: RefType = useRef<string>('');
  const { $allRouterWithName, $initPanel } = useContext(GlobalContext);
  const [panes, setPanes] = useState<CommonObjectType[]>(initPane);
  const { $menuTree } = useContext(GlobalContext);
  const firstMenuPath = useMemo(() => findFirstMenuPath($menuTree), [$menuTree]);

  const {
    storeData: { curTab, reloadPath },
    setStoreData,
    defaultActiveKey,
    panesItem,
    tabActiveKey,
  } = props;
  const history = useHistory();
  const { pathname, search } = useLocation();

  const fullPath = pathname + search;

  // 记录当前打开的tab,存到localstorage
  const storeTabs = useCallback(
    (ps): void => {
      const pathArr = ps.reduce((prev: CommonObjectType[], next: CommonObjectType) => [...prev, next.path], []);

      setStoreData!('SET_CURTAB', Array.from(new Set(pathArr)));
    },
    [setStoreData],
  );

  // 从本地存储中恢复已打开的tab列表
  const resetTabs = useCallback(() => {
    if ($allRouterWithName?.length === 0) {
      return;
    }
    const tabs = curTab.includes(`${PUBLIC_URL}home`) ? [...curTab] : [`${PUBLIC_URL}home`, ...curTab];
    const initPanes = tabs.reduce((prev: CommonObjectType[], next: string) => {
      const { title, tabKey, component: Content } = getKeyName(next, $allRouterWithName);
      return [
        ...prev,
        {
          title,
          key: tabKey,
          content: Content,
          closable: tabKey !== 'home',
          path: next,
        },
      ];
    }, []);
    const { tabKey } = getKeyName(pathname, $allRouterWithName);
    setPanes(initPanes);
    setActiveKey(tabKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curTab, pathname]);

  // 初始化页面
  useEffect(() => {
    // resetTabs();
    let initPanels = [...$initPanel];
    if (firstMenuPath && $allRouterWithName.length && !localStorage.getItem('firstMenuHasSet')) {
      // 只有第一次打开页面时才设置默认页面
      localStorage.setItem('firstMenuHasSet', '1');

      const { title, tabKey, component: Content } = getKeyName(`${PUBLIC_URL}${firstMenuPath}`, $allRouterWithName);
      initPanels = [
        ...initPanels,
        { title, key: tabKey, content: Content, closable: true, path: `${PUBLIC_URL}${firstMenuPath}` },
      ];
      storeTabs(initPanels);
    }
    setPanes(initPanels);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [$allRouterWithName, $initPanel, firstMenuPath]);

  useEffect(() => {
    const newPath = pathname + search;

    // 当前的路由和上一次的一样，return
    if (!panesItem.path || panesItem.path === pathRef.current) return;

    // 保存这次的路由地址
    pathRef.current = newPath;

    const index = panes.findIndex((_: CommonObjectType) => _.key === panesItem.key);
    // 无效的新tab，return
    if (!panesItem.key || (index > -1 && newPath === panes[index].path)) {
      setActiveKey(tabActiveKey);
      return;
    }

    // 新tab已存在，重新覆盖掉（解决带参数地址数据错乱问题）
    if (index > -1) {
      panes[index].path = newPath;
      setPanes(panes);
      setActiveKey(tabActiveKey);
      return;
    }

    // 添加新tab并保存起来
    panes.push(panesItem);
    setPanes(panes);
    setActiveKey(tabActiveKey);
    storeTabs(panes);
  }, [panes, panesItem, pathname, resetTabs, search, storeTabs, tabActiveKey, $allRouterWithName, $initPanel]);
  // tab切换
  const onChange = (tabKey: string): void => {
    setActiveKey(tabKey);
  };

  // 移除tab
  const remove = (targetKey: string) => {
    const delIndex = panes.findIndex((item: CommonObjectType) => item.key === targetKey);
    panes.splice(delIndex, 1);

    // 删除非当前tab
    if (targetKey !== activeKey) {
      const nextKey = activeKey;
      setPanes(panes);
      setActiveKey(nextKey);
      storeTabs(panes);
      return;
    }

    // 删除当前tab，地址往前推
    const nextPath = curTab[delIndex - 1];
    const { tabKey } = getKeyName(nextPath, $allRouterWithName);
    // 如果当前tab关闭后，上一个tab无权限，就一起关掉
    /*  if (!isAuthorized(tabKey) && nextPath !== '/home') {
      remove(tabKey);
      history.push(curTab[delIndex - 2]);
    } else { */
    history.push(nextPath);
    // }
    setPanes(panes);
    storeTabs(panes);
  };

  // tab新增删除操作
  const onEdit = (targetKey: string | any, action: string) => action === 'remove' && remove(targetKey);

  // tab点击
  const onTabClick = (targetKey: string): void => {
    const { path } = panes.filter((item: CommonObjectType) => item.key === targetKey)[0];
    history.push({ pathname: path });
  };

  // 刷新当前 tab
  const refreshTab = (): void => {
    setIsReload(true);
    setTimeout(() => {
      setIsReload(false);
    }, 1000);

    setStoreData!('SET_RELOADPATH', pathname + search);
    setTimeout(() => {
      setStoreData!('SET_RELOADPATH', 'null');
    }, 500);
  };

  // 关闭其他或关闭所有
  const removeAll = async (isCloseAll?: boolean) => {
    const { path, key } = selectedPanel;
    history.push(isCloseAll ? `${PUBLIC_URL}home` : path);

    const homePanel = [
      {
        title: '工作台',
        key: 'home',
        content: Home,
        closable: false,
        path: `${PUBLIC_URL}home`,
      },
    ];

    const nowPanes = key !== 'home' && !isCloseAll ? [...homePanel, selectedPanel] : homePanel;
    setPanes(nowPanes);
    setActiveKey(isCloseAll ? 'home' : key);
    storeTabs(nowPanes);
  };

  const isDisabled = () => selectedPanel.key === 'home';
  // tab右击菜单
  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={() => refreshTab()} disabled={selectedPanel.path !== fullPath}>
        刷新
      </Menu.Item>
      <Menu.Item
        key="2"
        onClick={(e) => {
          e.domEvent.stopPropagation();
          remove(selectedPanel.key);
        }}
        disabled={isDisabled()}
      >
        关闭
      </Menu.Item>
      <Menu.Item
        key="3"
        onClick={(e) => {
          e.domEvent.stopPropagation();
          removeAll();
        }}
      >
        关闭其他
      </Menu.Item>
      <Menu.Item
        key="4"
        onClick={(e) => {
          e.domEvent.stopPropagation();
          removeAll(true);
        }}
        disabled={isDisabled()}
      >
        全部关闭
      </Menu.Item>
    </Menu>
  );
  // 阻止右键默认事件
  const preventDefault = (e: CommonObjectType, panel: object) => {
    e.preventDefault();
    setSelectedPanel(panel);
  };

  return (
    <div className={style['wrapper']}>
      <div style={{ height: '100%' }} className="customDiv">
        <Tabs
          size="small"
          activeKey={activeKey}
          className={style.tabs}
          defaultActiveKey={defaultActiveKey}
          hideAdd
          onChange={onChange}
          onEdit={onEdit}
          onTabClick={onTabClick}
          type="editable-card"
          style={{ paddingTop: 16, overflowY: 'hidden' }}
        >
          {panes.map((pane: CommonObjectType) => (
            <TabPane
              closable={pane.closable}
              key={pane.key}
              className={'customTab'}
              tab={
                <Dropdown overlay={menu} placement="bottomLeft" trigger={['contextMenu']}>
                  <span onContextMenu={(e) => preventDefault(e, pane)}>
                    {isReload && pane.path === fullPath && pane.path !== `${PUBLIC_URL}404` && (
                      <SyncOutlined title="刷新" spin={isReload} />
                    )}
                    {pane.title}
                  </span>
                </Dropdown>
              }
            >
              {reloadPath !== pane.path ? (
                <div className={style.wrapper}>
                  <Suspense fallback={<Loading />}>
                    <pane.content path={pane.path} />
                  </Suspense>
                </div>
              ) : (
                <div style={{ height: '100vh' }}>
                  <Loading />
                </div>
              )}
            </TabPane>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default connect((state) => state, actions)(TabPanes);
