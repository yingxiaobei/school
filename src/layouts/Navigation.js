import { Layout, Menu, Tooltip } from 'antd';
import { useState, useEffect, useContext } from 'react';
import { getKeyName } from 'utils';
import { isEmpty } from 'lodash';
import { _get } from 'utils';
import { withRouter } from 'react-router';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navigation.module.css';
import { PUBLIC_URL } from 'constants/env';
import { _carTalkControl } from 'utils';
import {
  HomeOutlined,
  TeamOutlined,
  PayCircleOutlined,
  FileDoneOutlined,
  ContainerOutlined,
  PieChartOutlined,
  FundProjectionScreenOutlined,
  ContactsOutlined,
  HighlightOutlined,
  MessageOutlined,
  CarOutlined,
  UserOutlined,
  ReconciliationOutlined,
  UserAddOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  LikeOutlined,
  MoneyCollectOutlined,
  ClusterOutlined,
  SolutionOutlined,
  ReadOutlined,
  RobotOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import GlobalContext from 'globalContext';
import { Loading, IF } from 'components';

const { Sider } = Layout;
const { SubMenu } = Menu;

const ICONS = {
  ReconciliationOutlined: <ReconciliationOutlined />,
  UserOutlined: <UserOutlined />,
  CarOutlined: <CarOutlined />,
  MessageOutlined: <MessageOutlined />,
  HighlightOutlined: <HighlightOutlined />,
  HomeOutlined: <HomeOutlined />,
  TeamOutlined: <TeamOutlined />,
  PayCircleOutlined: <PayCircleOutlined />,
  FileDoneOutlined: <FileDoneOutlined />,
  ContainerOutlined: <ContainerOutlined />,
  PieChartOutlined: <PieChartOutlined />,
  FundProjectionScreenOutlined: <FundProjectionScreenOutlined />,
  ContactsOutlined: <ContactsOutlined />,
  UserAddOutlined: <UserAddOutlined />,
  CalendarOutlined: <CalendarOutlined />,
  ScheduleOutlined: <ScheduleOutlined />,
  LikeOutlined: <LikeOutlined />,
  MoneyCollectOutlined: <MoneyCollectOutlined />,
  ClusterOutlined: <ClusterOutlined />,
  SolutionOutlined: <SolutionOutlined />,
  ReadOutlined: <ReadOutlined />,
  RobotOutlined: <RobotOutlined />,
  DesktopOutlined: <DesktopOutlined />,
};

function Navigation(props) {
  const { collapsed, setCollapsed, menus, forceUpdate } = props;
  const currentPath = _get(props, 'location.pathname').slice(1);
  const [openKeys, setOpenKeys] = useState([]);
  const { $menuAuthTable, isLoading, $allRouterWithName, $menuTooltip } = useContext(GlobalContext);
  const [current, setCurrent] = useState(currentPath);
  const { pathname } = useLocation();

  useEffect(() => {
    const { tabKey = '' } = getKeyName(pathname, $allRouterWithName);
    setCurrent(tabKey.slice(1));
    const path = pathname.replace(`${PUBLIC_URL}`, '');
    helper(menus, []);
    function helper(arr, parentKey) {
      for (let item of arr) {
        if (item.code === path) {
          setOpenKeys(parentKey);
          return;
        }
        helper(_get(item, 'children', []), [...parentKey, item.code]);
      }
    }
  }, [pathname, $allRouterWithName, currentPath, menus]);

  // 菜单点击事件
  const handleClick = ({ key }) => {
    setCurrent(key);
  };
  useEffect(() => {
    _findDefaultOpenKeys();

    function _findDefaultOpenKeys() {
      const defaultOpenKeys = [];
      helper(menus, []);
      setOpenKeys(defaultOpenKeys);

      function helper(arr, parentKey) {
        for (let item of arr) {
          if (item.code === currentPath) {
            Object.assign(defaultOpenKeys, parentKey);
            return;
          }
          helper(_get(item, 'children', []), [...parentKey, item.key]);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menus]);

  function _onOpenChange(currentOpenKeys) {
    setOpenKeys(currentOpenKeys.slice(-1));
  }

  function _generateSubMenus({ icon, title, code, children, type }) {
    if (!$menuAuthTable[code]) return null;
    const w = window.screen.availWidth || 1900;
    const h = window.screen.availHeight || 1000;
    if (isEmpty(children)) {
      return (
        <Menu.Item key={code}>
          {code === 'robotCoach/monitorManage' ? (
            <div
              onClick={() => {
                const win = window.open(
                  `${PUBLIC_URL}robotCoach/monitorManage`,
                  '_blank',
                  `toolbar=no,status=no,location=no,top=0,left=0,fullscreen=yes,width=${w},height=${h}`,
                );
                win.onbeforeunload = async function () {
                  //窗口关闭后
                  const res = await _carTalkControl({
                    CarLicence: 'ALL',
                    VoiceTalk: '0',
                  }); //通知终端页面已挂断
                  localStorage.setItem('closeWinRes', `${_get(res, 'RetCode', '')}${_get(res, 'Description', '')}`);
                  localStorage.setItem('closeWin', new Date());
                };
              }}
            >
              <Tooltip placement="top" title={$menuTooltip[code] || ''}>
                {icon && ICONS[icon]}
                <span>{title}</span>
              </Tooltip>
            </div>
          ) : (
            <Tooltip placement="top" title={$menuTooltip[code] || ''}>
              <Link to={`${PUBLIC_URL}${code}`} onClick={forceUpdate}>
                {icon && ICONS[icon]}
                <span>{title}</span>
              </Link>
            </Tooltip>
          )}
        </Menu.Item>
      );
    }

    if (type === 'LABEL') {
      return (
        <Menu.ItemGroup
          key={code}
          title={
            <span>
              {/* {icon && ICONS[icon]} */}
              <span style={{ fontSize: 12 }}>{title}</span>
            </span>
          }
        >
          <Tooltip placement="top" title={$menuTooltip[code] || ''}>
            <span>{children.map(_generateSubMenus)}</span>
          </Tooltip>
        </Menu.ItemGroup>
      );
    }

    return (
      <SubMenu
        key={code}
        title={
          <span>
            <Tooltip placement="top" title={$menuTooltip[code] || ''}>
              {icon && ICONS[icon]}
              <span>{title}</span>
            </Tooltip>
          </span>
        }
      >
        {children.map(_generateSubMenus)}
      </SubMenu>
    );
  }

  return (
    <Sider
      breakpoint="xl"
      onBreakpoint={(broken) => {
        setCollapsed(broken);
      }}
      width={200}
      // collapsedWidth={0}
      zeroWidthTriggerStyle
      theme={'light'}
      collapsible
      trigger={null}
      collapsed={collapsed}
      style={{ overflow: 'auto' }}
      className={styles.menuBox}
    >
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <Menu
            // openKeys={collapsed ? [] : openKeys}
            onOpenChange={_onOpenChange}
            // theme="dark"
            defaultSelectedKeys={[currentPath]}
            selectedKeys={[current]}
            onClick={handleClick}
            mode="inline"
          >
            {menus.map(_generateSubMenus)}
          </Menu>
        }
      />
    </Sider>
  );
}

export default withRouter(Navigation);
