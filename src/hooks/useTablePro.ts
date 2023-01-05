import { useState } from 'react';
import { _get } from 'utils';
import { useFetch, useForceUpdate, useSearch, useVisible } from 'hooks';
import { AxiosResponse } from 'axios';

interface ISearchFormat {
  [propName: string]: { fun: Function; param?: string };
}

type Rows<T = unknown> = { rows: T[]; total: number };

interface IUserTableConfig<T> {
  request(...params: any[]): Promise<AxiosResponse<T> | undefined | void> | undefined; // 获取表单数据的请求
  initialSearch?: object; // Search组件需要设置的默认值
  extraParams?: object; // 额外的查询参数
  searchFormat?: ISearchFormat; // 处理搜索数据
  requiredFields?: string[]; // 获取表单数据的请求的必传字段
  dataSourceFormatter?(
    data: T extends Rows ? T['rows'] : Rows<T>['rows'],
  ): T extends Rows ? T['rows'] : Rows<T>['rows']; // 格式化dataSource
  cb?(data: T): void; // 调用接口后执行的回调函数
  initPageSize?: any; // 初始页面大小
  customHeader?: any;
  initPageSizeOptions?: number[]; //指定每页可以显示多少条
}

interface IUseTableRes {
  tableProps: any;
  search: object;
  _refreshTable(): void; // 强制刷新Table
  _handleSearch(name: string, value: any): void;
  _data: any;
  isEdit: boolean;
  setIsEdit(params: boolean): void;
  isAddOrEditVisible: boolean;
  _switchIsAddOrEditVisible(): void;
  currentId: string | number | null;
  setCurrentId(params: string | number | null): void;
  currentRecord: any;
  setCurrentRecord(params: any): void;
  _handleAdd(): void;
  _handleOk(): void;
  _handleEdit(record: any, id: string | number | null): void;
  otherState: object;
  setOtherState(params: object): void;
}

export const useTablePro = <T = any>({
  request,
  extraParams,
  requiredFields = [],
  initialSearch = {},
  searchFormat = {},
  dataSourceFormatter = (data) => data,
  cb,
  initPageSize = 10,
  customHeader = {},
  initPageSizeOptions = [10, 20, 50, 100],
}: IUserTableConfig<T>): IUseTableRes => {
  const [search, _handleSearch] = useSearch(initialSearch);
  const [pagination, setPagination] = useState({
    pageSize: initPageSize,
    total: 0,
    current: 1,
    pageSizeOptions: initPageSizeOptions,
  });
  const [ignore, forceUpdate] = useForceUpdate();
  const [isEdit, setIsEdit] = useState(false); // 是否处于编辑模式
  const [isAddOrEditVisible, _switchIsAddOrEditVisible] = useVisible(); // 新增/编辑弹窗可见性
  const [currentId, setCurrentId] = useState(null as number | string | null); // 当前选中记录的Id
  const [currentRecord, setCurrentRecord] = useState(null); // 当前选中的记录
  const [otherState, setOtherState] = useState({});
  const query = {};

  //  searchFormat: {
  //   startDate: { fun: formatTime, param: 'BEGIN' },   startDate ：search中对应的字段 fun：处理数据的函数，第一个参数为search中对应的字段 param：处理数据函数的参数，第二个参数开始
  //   endDate: { fun: formatTime, param: 'END' },
  // }

  if (Object.keys(searchFormat).length != 0 && Object.keys(search).length != 0) {
    //需要处理搜索数据且搜索有数据
    Object.entries(searchFormat).forEach((item: any) => {
      query[item[0]] = item[1].fun.call(null, _get(search, item[0]), _get(item[1], 'param'));
    });
  }

  const { data, isLoading } = useFetch<any, T>({
    request,
    query: { ...extraParams, ...search, ...query, page: pagination.current, limit: pagination.pageSize },
    depends: [pagination.current, pagination.pageSize, ignore],
    requiredFields,
    callback: (data) => {
      _get(data, 'total', 0) !== pagination.total && setPagination({ ...pagination, total: _get(data, 'total', 0) });
      cb && cb(data);
    },
    failCallback: (res) => {
      //code!=200,将total设为0
      setPagination({ ...pagination, total: 0 });
    },
    customHeader: customHeader,
  });

  function _refreshTable() {
    setPagination({ ...pagination, current: 1 });
    if (pagination.current === 1) {
      forceUpdate();
    }
  }

  function _handleAdd() {
    setCurrentId(null);
    setCurrentRecord(null);
    setIsEdit(false);
    _switchIsAddOrEditVisible();
  }

  function _handleEdit(record: any, id: string) {
    _switchIsAddOrEditVisible();
    setCurrentId(id);
    setCurrentRecord(record);
    setIsEdit(true);
  }

  function _handleOk() {
    _switchIsAddOrEditVisible();
    _refreshTable();
  }

  return {
    search,
    _handleSearch,
    tableProps: {
      loading: isLoading,
      bordered: true,
      dataSource: dataSourceFormatter(_get(data, 'rows', [])),
      pagination: {
        ...pagination,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number) => `共 ${total} 条`,
        onShowSizeChange: (_: any, pageSize: number) => {
          setPagination({ ...pagination, current: 1, pageSize });
        },
        onChange: (page: number) => {
          setPagination((pagination) => ({ ...pagination, current: page }));
        },
      },
    },
    _refreshTable,
    _data: data,
    isEdit,
    setIsEdit,
    isAddOrEditVisible,
    _switchIsAddOrEditVisible,
    currentId,
    setCurrentId,
    currentRecord,
    setCurrentRecord,
    _handleAdd,
    _handleOk,
    otherState,
    setOtherState,
    _handleEdit,
  };
};
