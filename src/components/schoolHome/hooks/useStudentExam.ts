import { useFetch } from 'hooks';
import moment from 'moment';
import { _get } from 'utils';
import { StudentExamData } from '../schoolHomeType';
import { _getExamList } from '../_api';

function useStudentExam(isOpen: boolean = false) {
  const { data, isLoading } = useFetch({
    request: _getExamList,
    query: {
      limit: 3, // 目前产品原型图中的数据展示为3条
      page: 1,
      startDate: moment(new Date()).add(1, 'days').format('YYYY-MM-DD'),
      endDate: moment(new Date()).add(1, 'days').format('YYYY-MM-DD'),
    },
    forceCancel: !isOpen,
    depends: [isOpen],
  });

  return [_get(data, 'rows', []) as Array<StudentExamData>, isLoading] as const;
}

export default useStudentExam;
