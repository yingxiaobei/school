import { useFetch } from 'hooks';
import { useState } from 'react';
import { _get } from 'utils';
import { _getClassList } from '../_api';

export const useClassOption = (customSchoolId: string, $companyId: string | null) => {
  const [classOptions, setClassOptions] = useState([]);

  useFetch({
    request: _getClassList,
    query: {
      page: 1,
      limit: 100,
    },
    customHeader: { customSchoolId },
    depends: [$companyId, customSchoolId],
    callback(classList) {
      const effectiveClass = _get(classList, 'rows', []).filter((clazz: any) => clazz.status_cd === '2');
      const classOptions = effectiveClass.map((x: any) => {
        return { label: x.packlabel, value: x.packid };
      });
      setClassOptions(classOptions);
    },
  });

  return classOptions;
};
