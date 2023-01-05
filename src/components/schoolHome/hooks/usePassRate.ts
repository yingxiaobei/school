import { useFetch } from 'hooks';
import { useState } from 'react';
import { _get } from 'utils';
import { Subject } from '../schoolHomeType';
import { _examPassRateCoach } from '../_api';

function usePassRate(isOpen: boolean = false) {
  const [subjectTwo, setSubjectTwo] = useState<Subject>({} as Subject); // 科目二
  const [subjectTree, setSubjectTree] = useState<Subject>({} as Subject); // 科目三
  const { isLoading } = useFetch({
    request: _examPassRateCoach,
    query: {
      limit: 10,
      page: 1,
      period: 'month', // 近一月
    },
    forceCancel: !isOpen,
    depends: [isOpen],
    callback(data) {
      const total = _get(data, 'rows', []).filter((items: any) => {
        return _get(items, 'title', '') === 'total';
      });
      _get(total, '0.subjectItems', []).forEach((element: any) => {
        if (element.subject === '科目二') {
          setSubjectTwo(element);
        }
        if (element.subject === '科目三') {
          setSubjectTree(element);
        }
      });
    },
  });

  return [subjectTwo, subjectTree, isLoading] as const;
}

export default usePassRate;
