import { useState, useEffect } from 'react';
import { _get } from 'utils';
import { AxiosResponse } from 'axios';

interface IParams<T = { [key: string]: any }, S = any> {
  request(query?: T, customHeader?: any): Promise<AxiosResponse<S> | undefined | void> | undefined;
  query?: T;
  depends?: any[];
  callback?(data: S): void;
  failCallback?(res: any): void; //处理外层200，但后端返回的code!=200的情况
  requiredFields?: string[];
  forceCancel?: boolean;
  customHeader?: any; //TODO:替代为key
}

interface IReturn<S> {
  res: any;
  isLoading: boolean;
  finished: boolean;
  isError: boolean;
  data: S;
}

export const useFetch = <T, S = any>({
  request = () => Promise.resolve(),
  query,
  depends = [],
  callback = () => {},
  failCallback = () => {},
  requiredFields = [],
  forceCancel = false, // 取消请求
  customHeader = {},
}: IParams<T, S>): IReturn<S> => {
  const [fetchStore, setFetchStore] = useState({ res: null, isLoading: true, isError: false, finished: false } as any);
  const _query: any = query;

  useEffect(() => {
    let didCancel = false;
    // 如果没有传入必填字段则不触发请求 | 主动取消请求
    if (requiredFields.some((field: string) => typeof _query === 'object' && _query[field] == null) || forceCancel) {
      setFetchStore((fetchStore: any) => ({ ...fetchStore, isLoading: false }));
      return;
    }

    const fetchData = async () => {
      setFetchStore((fetchStore: any) => ({ ...fetchStore, isLoading: true, isError: false, finished: false }));
      try {
        const res: any = await request(query, customHeader);
        if (!didCancel) {
          setFetchStore((fetchStore: any) => ({
            ...fetchStore,
            isError: false,
            res,
            isLoading: false,
            finished: true,
          }));
          _get(res, 'data') && callback(_get(res, 'data'));
          _get(res, 'code') !== 200 && failCallback(res);
        }
      } catch (error) {
        if (!didCancel) {
          setFetchStore((fetchStore: any) => ({
            ...fetchStore,
            isError: true,
            isLoading: false,
            finished: true,
          }));
        }
      } finally {
        if (!didCancel) {
          setFetchStore((fetchStore: any) => ({ ...fetchStore, isLoading: false, finished: true }));
        }
      }
    };

    fetchData();
    return () => {
      didCancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, depends);

  return {
    res: _get(fetchStore, 'res'),
    isLoading: fetchStore.isLoading,
    finished: fetchStore.finished,
    isError: fetchStore.isError,
    data: _get(fetchStore, 'res.data'),
  };
};
