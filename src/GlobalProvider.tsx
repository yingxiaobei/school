import { Suspense, useEffect, useState } from 'react';
import { message } from 'antd';
import { isEmpty, flatten, values } from 'lodash';
import { Auth, handleLogout, generateMenuMap, _get, getKeyName, startPort, isForceUpdatePlugin } from 'utils';
import GlobalContext from './globalContext';
import { useFetch, useForceUpdate } from 'hooks';
import { _getMenuTree, _getUserInfo, _getColumInfo } from './_api';
import { _getCustomParam, _getMessageList, _getSchMsgList, _getVersion } from 'api';
import * as PageRouters from 'app/school/pages/router';
import { store } from 'store';
import { PUBLIC_URL } from 'constants/env';
import Home from 'components/Home';
import { Loading } from 'components';
import { useHistory } from 'react-router-dom';
import { setCookie, getCookie } from 'utils';
import { _getNacosConfig } from 'layouts/_api';

interface IProps {
  children: React.ReactNode;
}
const initPane = [
  {
    title: '工作台',
    key: 'home',
    content: Home,
    closable: false,
    path: `${PUBLIC_URL}home`,
  },
];

export default function GlobalProvider(props: IProps) {
  const [$menuAuthTable, $setMenuAuthTable] = useState({}) as any; // 用户有权限访问的按钮HashTable
  const [$elementAuthTable, $setElementAuthTable] = useState({}) as any; // 用户有权限访问的菜单HashTable
  const [$elementTooltip, $setElementTooltip] = useState({}) as any; // 用户有权限访问的按钮tooltip
  const [$menuTooltip, $setMenuTooltip] = useState({}) as any; // 用户有权限访问的菜单tooltip
  const [$companyId, $setCompanyId] = useState(Auth.get('companyId'));
  const [$token, $setToken] = useState(Auth.get('token'));
  const [$userId, $setUserId] = useState(Auth.get('userId'));
  const [$schoolId, $setSchoolId] = useState(Auth.get('schoolId')); // 当前驾校id
  const [$username, $setUsername] = useState(Auth.get('username'));
  const [$schoolLabel, $setSchoolLabel] = useState(Auth.get('schoolLabel'));
  const [$rolesIds, $setRolesIds] = useState(Auth.get('rolesIds'));
  const [$schoolName, $setSchoolName] = useState(Auth.get('schoolName'));
  const [$operatorName, $setOperatorName] = useState(Auth.get('operatorName'));
  const [$openAPIToken, $setOpenAPIToken] = useState(Auth.get('openAPIToken'));
  const [$publicMenuTreeData, $setPublicMenuTreeData] = useState([]) as any;
  const [$allRouterWithName, $setAllRouterWithName] = useState([]) as any;
  const [$initPanel, $setInitPanel] = useState(initPane);
  const [$areaNum, $setAreaNum] = useState('') as any;
  const [$isForceUpdatePlugin, $setIsForceUpdatePlugin] = useState(false);
  const [$maxImgSize, $setMaxImgSize] = useState(10240);
  const [$minImgSize, $setMinImgSize] = useState(0);
  const [$messageCount, $setMsgCount] = useState(0);
  const [$msgFlag, $setMessageCount] = useForceUpdate();
  const { curTab } = store.getState().storeData;
  const [ignore, forceUpdate] = useForceUpdate();
  const [$pwdExpire, $setPwdExpire] = useState(false);
  const [$columns, $setColumns] = useForceUpdate();
  const [$columnsAll, setColumnsAll] = useState({});

  const { isLoading } = useFetch({
    request: _getUserInfo,
    callback: async (data) => {
      forceUpdate();
      // 如果菜单列表为空，则强制用户登出
      if (isEmpty(_get(data, 'menus'))) {
        await message.error('该账号无权限，请联系管理员', 2);
        handleLogout();
      }
      const elementTooltip = {};
      const menuTooltip = {};
      _get(data, 'elements', []).forEach((x: any) => {
        $elementAuthTable[_get(x, 'code')] = _get(x, 'id');
        elementTooltip[_get(x, 'code')] = _get(x, 'description');
      });

      _get(data, 'menus', []).forEach((x: any) => {
        $menuAuthTable[_get(x, 'code')] = _get(x, 'id');
        menuTooltip[_get(x, 'code')] = _get(x, 'description');
      });

      $setElementAuthTable($elementAuthTable);
      $setMenuAuthTable($menuAuthTable);
      $setElementTooltip(elementTooltip);
      $setMenuTooltip(menuTooltip);
      const rolesIds = _get(data, 'companyRoles', [])
        .map((x: { id: any }) => x.id)
        .join(',');
      Auth.set('schoolId', _get(data, 'companyId'));
      $setSchoolId(_get(data, 'companyId'));
      Auth.set('companyId', _get(data, 'companyId'));
      $setCompanyId(_get(data, 'companyId'));
      Auth.set('rolesIds', rolesIds);
      $setRolesIds(rolesIds);
      Auth.set('schoolName', _get(data, 'companyName'));
      $setSchoolName(_get(data, 'companyName'));
      Auth.set('intranetIP', _get(data, 'ip', ''));
      Auth.set('intranetPort', _get(data, 'port', ''));
    },
    depends: [$companyId],
    forceCancel: process.env.REACT_APP_PROJECT !== 'SCHOOL', // 门户不需要获取useInfo
  });
  type RestParamsArgs = Parameters<typeof _getMenuTree>[0];
  // 左侧菜单栏
  const { data: $menuTree = [] } = useFetch({
    request: _getMenuTree,
    query: { username: $username, companyId: $companyId },
    requiredFields: ['username', 'companyId'],
    depends: [$username, $companyId],
    forceCancel: process.env.REACT_APP_PROJECT !== 'SCHOOL', // 烟台门户不需要获取菜单项
  });
  // 灰度
  const history = useHistory();
  const getVersion = async () => {
    const prevVersion = getCookie('version') || 'stable';
    const res: any = await _getVersion({ schoolId: $schoolId });
    const curVersion = res.data || 'stable';
    console.info({
      prevVersion,
      curVersion,
    });
    const publicUrl = PUBLIC_URL || '/school/';
    const index = publicUrl.lastIndexOf('/');
    //最后一位没有/或PUBLIC_URL等于/时，保持不变
    const path = PUBLIC_URL === '/' || index < 0 ? PUBLIC_URL : publicUrl.substring(0, index);
    setCookie('version', curVersion, 1, path);

    setTimeout(() => {
      console.log("getCookie('version')", getCookie('version'));
      console.info(prevVersion, curVersion, getCookie('version'), res.data);
      if (prevVersion !== curVersion) {
        console.info('灰度刷新');
        history.go(0);
      }
    }, 0);
  };
  useEffect(() => {
    if ($menuTree.length && $schoolId) {
      getVersion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [$menuTree, $schoolId]);
  useEffect(() => {
    if ($menuTree?.length === 0) {
      return;
    }
    function getAllRoutersWithName() {
      const MENU_MAP = generateMenuMap($menuTree);
      const allRoutes = flatten(values(PageRouters) as { path: string; component: React.ReactNode }[][]).map((x) => {
        const path = x.path.substr(1);
        if (MENU_MAP[path]) {
          return { ...x, name: MENU_MAP[path] };
        }
        return x;
      });
      $setAllRouterWithName(allRoutes);
      const tabs = curTab.includes(`${PUBLIC_URL}home`) ? [...curTab] : [`${PUBLIC_URL}home`, ...curTab];
      const initPanes = tabs.reduce((prev: CommonObjectType[], next: string) => {
        const { title, tabKey, component: Content } = getKeyName(next, allRoutes);
        const content = () => {
          return (
            <Suspense fallback={<Loading />}>
              <Content />
            </Suspense>
          );
        };
        return [
          ...prev,
          {
            title,
            key: tabKey,
            content: content,
            closable: tabKey !== 'home',
            path: next,
          },
        ];
      }, []);
      $setInitPanel(initPanes); //初始化panel
    }
    getAllRoutersWithName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [$menuTree]);
  useFetch({
    request: _getCustomParam, //自定义参数配置的上传图片最大尺寸
    query: { paramCode: 'pic_size_limit', schoolId: Auth.get('schoolId') },
    callback: (data) => {
      const paramValue = _get(data, 'paramValue', 0).split(','); //单位kb
      $setMaxImgSize(Number(_get(paramValue, '[0]', 0)));
      $setMinImgSize(Number(_get(paramValue, '[1]', 0)));
    },
  });
  useEffect(() => {
    async function resolveDevice() {
      const res = await isForceUpdatePlugin();
      $setIsForceUpdatePlugin(res);
      await startPort();
    }
    resolveDevice();
  }, []);

  useFetch({
    request: _getCustomParam, //自定义参数配置二级监管平台类型（两位数字，第一位与“监管请求平台类型”保持一致 00：省监管 01：省监管-河南 02:广东 05:镇江）
    query: { paramCode: 'jg_request_platform_type_second', schoolId: Auth.get('schoolId') },
    depends: [ignore],
    callback: (data: any) => {
      const areaNum = _get(data, 'paramValue', '');
      $setAreaNum(areaNum);
    },
  });
  useFetch({
    request: _getNacosConfig,
    depends: [ignore],
    callback: (data: any) => {
      Auth.set('hidePrivacy', data);
    },
  });

  // 更新未读消息数量
  useEffect(() => {
    if (!$msgFlag) {
      // 第一次不执行
      return;
    }
    //系统公告
    _getMessageList({ page: 1, limit: 9999, screen: 1 })?.then((res) => {
      // 系统通知
      _getSchMsgList({ page: 1, limit: 9999, isDeleted: 0, status: 0 })?.then((res2) => {
        $setMsgCount((res?.data?.msgRead || 0) + (res2?.data?.total || 0));
      });
    });
  }, [$msgFlag]);

  useFetch({
    request: _getColumInfo, //自定义参数配置二级监管平台类型（两位数字，第一位与“监管请求平台类型”保持一致 00：省监管 01：省监管-河南 02:广东 05:镇江）
    depends: [$columns, $companyId],
    callback: (data: any = []) => {
      var columnsAll = {};
      data.forEach((x: any) => {
        if (x.dict) {
          columnsAll[x.dict] = { showList: x.showList, hideList: x.hideList };
        }
      });

      setColumnsAll(columnsAll);
    },
  });

  return (
    <GlobalContext.Provider
      value={{
        $elementAuthTable,
        $menuAuthTable,
        $elementTooltip,
        $menuTooltip,
        $token,
        $setToken,
        $userId,
        $setUserId,
        $schoolId,
        $setSchoolId,
        $username,
        $setUsername,
        $schoolLabel,
        $setSchoolLabel,
        $rolesIds,
        $setRolesIds,
        $companyId,
        $setCompanyId,
        $operatorName,
        $setOperatorName,
        $menuTree,
        $schoolName,
        $setSchoolName,
        isLoading,
        $openAPIToken,
        $setOpenAPIToken,
        $publicMenuTreeData,
        $allRouterWithName,
        $setAllRouterWithName,
        $setPublicMenuTreeData,
        $initPanel,
        $isForceUpdatePlugin,
        $areaNum,
        $maxImgSize,
        $minImgSize,
        $messageCount,
        $setMessageCount,
        $setMsgCount,
        $pwdExpire,
        $setPwdExpire,
        $setColumns,
        $columnsAll,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
}
