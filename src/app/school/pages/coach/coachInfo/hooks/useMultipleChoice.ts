import { _getCustomParam } from 'api';
import { useFetch } from 'hooks';
import { useState } from 'react';
import { Auth, _get } from 'utils';

export function useMultipleChoice() {
  const [isSupportMultipleChoice, setIsSupportMultipleChoice] = useState(false);
  // 需要修改的 增改查
  // 教练员准教车型是否允许多选 0：不允许 1：允许(string)
  useFetch({
    request: _getCustomParam,
    query: { paramCode: 'is_allow_coa_multiple_choice', schoolId: Auth.get('schoolId') },
    callback(data) {
      if (data) {
        let res: '0' | '1' = _get(data, 'paramValue', '0');
        if (res === '0') {
          setIsSupportMultipleChoice(false);
        } else {
          setIsSupportMultipleChoice(true);
        }
      }
      // console.log(data);
    },
  });

  return isSupportMultipleChoice;
}
