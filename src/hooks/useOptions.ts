import { useContext } from 'react';
import { isEmpty } from 'lodash';
import { _get } from 'utils';
import { TCategory } from './constants';
import { _getCode, _getBusinessScope, _getApplyStatus, _getSubjectApply, _getCourse, _getBusinessType } from 'api';
import { useFetch } from 'hooks';
import { HASH } from './constants';
import OptionsContext from 'optionsContext';

/**
 * @param  {TCategory} category
 * @param  {boolean=false} pauseRequest
 */
export const useOptions = (
  category: TCategory,
  pauseRequest: boolean = false,
  parentCodeKey: string = '-1',
  excludeCode: string[] = [],
  otherConfig: { query?: any; forceUpdate?: boolean; depends?: string[] } = {},
) => {
  const { $optionStore, $setOptionStore, $setHashStore } = useContext(OptionsContext);
  const { query = {}, forceUpdate = false, depends = [] } = otherConfig || {};

  const isExist = !isEmpty($optionStore[`${parentCodeKey}${category}`]) && !forceUpdate;
  const specialCategoryMap = {
    SchoolSubjectApply: {
      // 获取驾校报审科目列表(阶段报审)
      request: _getSubjectApply,
    },
    SubjectApplyStatus: {
      // 获取驾校阶段核实状态
      request: _getApplyStatus,
    },
    business_scope: {
      // 驾校经营范围使用
      request: _getBusinessScope,
      query,
    },
    combo: {
      // 驾校课程类型
      request: _getCourse,
    },
    businessType: {
      // 业务类型（学员档案）
      request: _getBusinessType,
      query,
    },
  };

  const { data } = useFetch({
    request: _get(specialCategoryMap, `${category}.request`) || _getCode,
    query: _get(specialCategoryMap, `${category}.request`)
      ? _get(specialCategoryMap, `${category}.query`, {})
      : { codeType: category, parentCodeKey },
    forceCancel: pauseRequest || isExist,
    callback: (data) => {
      const options = (data || []).map((x: any) => ({ value: x.value, label: x.text }));
      const hash = options.reduce((acc: any, x: any) => Object.assign(acc, { [x.value]: x.label }), {});

      $setOptionStore((pre: any) => ({ ...pre, [`${parentCodeKey}${category}`]: options }));
      $setHashStore((pre: any) => ({ ...pre, [`${parentCodeKey}${category}`]: hash }));
    },
    depends,
  });

  if (isExist) {
    return $optionStore[`${parentCodeKey}${category}`].filter((x: any) => !excludeCode.includes(x.value)) as IOption[];
  }

  return (pauseRequest
    ? HASH[category]
    : (data || []).map((x: any) => {
        return { value: x.value, label: x.text };
      })
  ).filter((x: any) => !excludeCode.includes(x.value)) as IOption[];
};
