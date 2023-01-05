import { useFetch } from 'hooks';
import { _get } from 'utils';
import { CoachingData } from '../schoolHomeType';
import { _getInfo } from '../_api';

function useCoaching(isOpen: boolean = false) {
  const { data, isLoading } = useFetch({
    request: _getInfo,
    query: {
      limit: 3, // 目前产品原型图中的数据展示为3条
      page: 1,
      statisticType: '1',
    },
    forceCancel: !isOpen,
    depends: [isOpen],
  });
  return [_get(data, 'rows', []) as Array<CoachingData>, isLoading] as const;
}

export default useCoaching;
