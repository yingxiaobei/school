import { useCallback, useContext, useState } from 'react';
import { _getCode } from '../api';
import OptionsContext from '../optionsContext';
import { isEmpty } from 'lodash';
import { _get } from 'utils';

type DirectionKey = string;

/**
 * @description 一定 一定 一定要注意！！！！！在useEffect中调用 customerFetch 时候的依赖项 避免无限重复请求
 *
 * @description 由于useOption和useHash，hook无法在遍历或者条件语句中使用，
 * @description 只能延伸出调用（customerFetch）方法 来获取通过字典key获得的对应options还有hash 并且缓存。
 * @since heyuan 分支
 */
export const useAuto = () => {
  const { $optionStore, $setOptionStore, $setHashStore, $hashStore } = useContext(OptionsContext);
  const [optionStore, setOptionStore] = useState<Record<DirectionKey, IOption[]>>(() => {
    return $optionStore;
  });
  const [hashStore, setHashStore] = useState<Record<DirectionKey, { [key: string]: string }>>(() => {
    return $hashStore;
  });

  const _fetch = useCallback(async function (dictionaryKey: string) {
    const storeKey = `-1${dictionaryKey}`;
    const isExist = !isEmpty($optionStore[storeKey]);
    if (isExist) {
      let options = $optionStore[storeKey];
      let hash = $hashStore[storeKey];
      setOptionStore((oldOptionsStore) => ({
        ...oldOptionsStore,
        [storeKey]: options,
      }));

      setHashStore((oldHashStore) => ({
        ...oldHashStore,
        [storeKey]: hash,
      }));
    } else {
      const res = await _getCode({ codeType: dictionaryKey, parentCodeKey: '-1' });
      const data = _get(res!, ['data'], [] as { text: string; value: string }[]);
      const options = (data || []).map((x) => ({ value: x.value, label: x.text }));
      const hash = options.reduce(
        (acc, x) => Object.assign(acc, { [x.value]: x.label }),
        {} as { [key: string]: string },
      );

      setOptionStore((oldOptionsStore) => ({
        ...oldOptionsStore,
        [storeKey]: options,
      }));

      setHashStore((oldHashStore) => ({
        ...oldHashStore,
        [storeKey]: hash,
      }));

      $setOptionStore((pre: any) => ({ ...pre, [storeKey]: options }));
      $setHashStore((pre: any) => ({ ...pre, [storeKey]: hash }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { optionStore, hashStore, customerFetch: _fetch };
};
