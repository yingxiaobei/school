declare interface PaginationResponse<Item> {
  data: {
    total: number;
    rows: Item[];
    [key: string]: any;
  };
  code: number;
  message: string;
}

declare interface Response {
  data: any;
  code: number;
  message: string;
}

declare interface IPagination {
  pageSize: number | undefined;
  total: number;
  current: number;
}

declare type IOption = {
  value: any;
  label: string;
};

declare interface IPaginationParams {
  page: number;
  limit: number;
}

declare module '*.css';

declare module 'recharts';

declare module 'uuid';

declare module 'three';

declare module 'three/examples/jsm/controls/OrbitControls';

declare module 'three/examples/jsm/loaders/OBJLoader';

declare module 'three/examples/jsm/loaders/MTLLoader';

declare module '@testing-library/react-hooks';
declare module 'jsonp';

declare interface ReduxProps {
  storeData?: any;
  setStoreData?: (type: string, payload: any) => object;
}

type RefType = MutableRefObject<unknown> | ((instance: unknown) => void);

type CommonObjectType<T = any> = Record<string, T>;

declare interface Window {
  REACT_APP_USER_CENTER_URL?: string;
  REACT_APP_PUBLIC_URL?: string;
  REACT_APP_API_URL?: string;
  REACT_APP_PAY_REDIRECT_URL?: string;
  REACT_APP_PORTAL_URL?: string;
  REACT_APP_SCHOOL_URL?: string;
  REACT_APP_SYS_URL?: string;
  REACT_APP_SCHOOL_TIME_QUERY?: string;
  REACT_APP_PORTAL_CITY_CODE?: string;
  REACT_APP_PORTAL_APP_CODE?: string;
  REACT_APP_PORTAL_SIGN_NAME?: string;
  REACT_APP_PORTAL_TEMPLATE_CODE?: string;
  REACT_APP_PORTAL_OPEN_API_PREFIX?: string;
  REACT_APP_PORTAL_ID?: string;
  createCapability?: any;
  iWebAssist?: any;
  CryptoJS?: any;
  md5?: any;
  JSMpeg?: any;
  streamMedia?: any;
  AMap?: any;
}

declare interface ChangeRecordRes {
  aftKeyValue: string; // 变更后内容
  befKeyValue: string; // 变更前内容
  createTime: string;
  id: string;
  keycolumn: string;
  keycolumnName: string; // 变更内容
  updateUserId: string;
  updateUserName: string; // 操作人
}

declare interface LogRes {
  entityId: string; // 业务主键
  httpMethod: string; //   请求方法
  logTime: string; //   日志插入时间
  format: string; //
  platformType: string; //   平台类型
  requestContent: string; //   请求内容
  responseCode: string; //   响应码
  responseContent: string; //   响应内容
  schoolId: string; //   所属驾校ID
  serviceName: string; //   服务名称
  serviceUrl: string; //   服务URL
}
