import { message } from 'antd';
import { useState } from 'react';
import { _get } from 'utils';

interface HashList {
  total: number;
  msg: string;
}

interface priKeyValMap {
  key: string;
  value: string;
}

interface IBulkStatisticsResult {
  (
    request: (query?: any, customHeader?: any) => void,
    options?: {
      onOk?(params?: any): void;
    },
  ): {
    loading: boolean;
    run: (
      rows: any,
      otherProps: {
        otherParams?: any;
        priKeyValMap?: priKeyValMap[];
        customHeader?: {};
      },
    ) => void;
  };
}

//批量调用接口，统一返回执行结果
export const useBulkStatisticsResult: IBulkStatisticsResult = (request, options = {}) => {
  const { onOk = () => {} } = options;
  const [loading, setLoading] = useState(false);

  async function run(
    rows: any,
    otherProps: { otherParams?: object; priKeyValMap?: priKeyValMap[]; customHeader?: object },
  ) {
    const total = _get(rows, 'length', 0);
    let errorTotal = 0;
    let errHashList = {} as HashList;
    let successList = {} as HashList;
    try {
      setLoading(true);
      for (let i: number = 0; i < _get(rows, 'length', 0); i++) {
        var arr =
          otherProps?.priKeyValMap?.map((x) => {
            return { [x.key]: rows[i]?.[x.value] };
          }) || [];
        const priKeyObj = Object.assign({}, ...arr);
        const res = await request({ ...priKeyObj, ...otherProps?.otherParams }, otherProps?.customHeader);

        const code = _get(res, 'code');
        if (code !== 200) {
          errorTotal++;
          if (!errHashList[code]) {
            errHashList[code] = {
              total: 1,
              msg: _get(res, 'message', '未知错误'),
            };
          } else {
            errHashList[code]['total']++;
          }
        } else {
          if (!successList[code]) {
            successList[code] = {
              total: 1,
              msg: _get(res, 'data', '操作成功'),
            };
          } else {
            successList[code]['total']++;
          }
        }
      }
    } catch (error) {
      setLoading(false);
      message.error('网络异常，请稍后再试');
      return;
    }
    onOk({
      total,
      errorTotal,
      errHashList,
      successList,
    });
    setLoading(false);
  }
  return { loading, run };
};
