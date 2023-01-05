import { AxiosResponse } from 'axios';
import { useState } from 'react';
import { _get } from 'utils';

interface IUseRequest {
  (
    request: (query?: any, customHeader?: any) => Promise<AxiosResponse<any> | undefined>,
    options?: {
      onSuccess?(params?: any): void;
      onFail?(params?: any, code?: any): void;
    },
  ): { loading: boolean; run: (query?: any, customHeader?: any) => Promise<void>; data: any };
}

export const useRequest: IUseRequest = (request, options = {}) => {
  const { onSuccess = () => {}, onFail = () => {} } = options;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  async function run(query?: any, customHeader?: any) {
    try {
      setLoading(true);
      const res = await request(query, customHeader);
      if (_get(res, 'code') === 200) {
        setData(_get(res, 'data'));
        onSuccess(_get(res, 'data'));
      } else {
        onFail(_get(res, 'message'), _get(res, 'code'));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return { loading, run, data };
};
