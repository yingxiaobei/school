import { useOptions } from 'hooks';
import { isEmpty } from 'lodash';
import { useContext } from 'react';
import { TCategory } from './constants';
import OptionsContext from 'optionsContext';

// TODO: twk-函数多参数类型

/**
 * @param  {TCategory} category
 * @param  {boolean=false} pauseRequest
 */
export const useHash = (
  category: TCategory,
  pauseRequest: boolean = false,
  parentCodeKey: string = '-1',
  excludeCode: string[] = [],
  otherConfig: { query?: object; forceUpdate?: boolean; depends?: any[] } = {},
) => {
  const { $hashStore } = useContext(OptionsContext);
  const options: IOption[] = useOptions(category, pauseRequest, parentCodeKey, excludeCode, otherConfig) || [];
  const isExist = !isEmpty($hashStore[`${parentCodeKey}${category}`]);

  if (isEmpty(options)) {
    return {};
  }

  if (isExist) {
    return $hashStore[`${parentCodeKey}${category}`];
  }

  const res = options.reduce((acc: any, x: IOption) => Object.assign(acc, { [x.value]: x.label }), {});

  return res as { [key: string]: string };
};
