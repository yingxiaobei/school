import { _get } from 'utils';

interface HashList {
  total: number;
  msg: string;
}
// 批量审核错误参数
interface BulkStatisticsResultProps {
  (initialState: {
    request(...params: any[]): any;
    rows: any[];
    waiting?: any;
    otherProps?: { [key: string]: any };
  }): Promise<{
    total: number;
    successTotal: number;
    errorTotal: number;
    errHashList: HashList;
  }>;
}

export const BulkStatisticsResult: BulkStatisticsResultProps = async (initialState) => {
  const { request, rows, otherProps, waiting = (i: number = 0, total: number = 0) => {} } = initialState;

  const total = _get(rows, 'length', 0);
  let errorTotal = 0;
  let errHashList = {} as HashList;

  for (let i: number = 0; i < _get(rows, 'length', 0); i++) {
    waiting(i + 1, total); // 进行到第几条 描点 暴漏进行中的条数
    const res = await request({ sid: _get(rows[i], 'sid', ''), ...otherProps });
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
    }
  }

  return {
    total,
    successTotal: total - errorTotal,
    errorTotal,
    errHashList,
  };
};
