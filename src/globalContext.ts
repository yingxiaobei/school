import { createContext } from 'react';

interface ContextState {
  $elementAuthTable: any;
  $menuAuthTable: any;
  $elementTooltip: any;
  $menuTooltip: any;
  $token: string | null;
  $setToken(p: string): void;
  $userId: string | null;
  $setUserId(p: string): void;
  $schoolId: string | null;
  $setSchoolId(p: string): void;
  $username: string | null;
  $setUsername(p: string): void;
  $schoolLabel: string | null;
  $setSchoolLabel(p: string): void;
  $rolesIds: string | null;
  $setRolesIds(p: string): void;
  $companyId: string | null;
  $setCompanyId(p: string): void;
  $operatorName: string | null;
  $setOperatorName(p: string): void;
  $menuTree: any[];
  $schoolName: string | null;
  $setSchoolName(p: string): void;
  isLoading: boolean;
  $openAPIToken: string | null;
  $setOpenAPIToken(p: string): void;
  $publicMenuTreeData: any[];
  $setPublicMenuTreeData: any;
  $allRouterWithName: any[];
  $setAllRouterWithName: any;
  $initPanel: any;
  $areaNum: any;
  $isForceUpdatePlugin: boolean;
  $maxImgSize: any;
  $minImgSize: number;
  $messageCount: number;
  $setMsgCount(p: number): void;
  $setMessageCount(): void;
  $pwdExpire: any;
  $setPwdExpire: any;
  $setColumns(): void;
  $columnsAll: any; //所有菜单的自定义列（需数据字典配置）
}

const GlobalContext = createContext({} as ContextState);

export default GlobalContext;
