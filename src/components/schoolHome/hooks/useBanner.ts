import { _getBaseInfo } from 'api';
import { useFetch } from 'hooks';
import { useState } from 'react';
import { Auth, _get } from 'utils';
import { AD } from '../schoolHomeType';
import { _getBannerList } from '../_api';

function useBanner(): [AD[], ...any] {
  const [areaCode, setAreaCode] = useState('');

  // 驾校基本信息详情
  useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getBaseInfo,
    callback: (data: any) => {
      setAreaCode(_get(data, 'areaCode', ''));
    },
  });

  // todo: 目前PC端只有一致栏目
  const { data, res, isLoading } = useFetch({
    request: _getBannerList,
    query: {
      adFieldList: [
        {
          fieldNumber: '301,30101',
        },
      ],
      areaCode,
      deviceType: 3,
    },
    forceCancel: !areaCode,
    // requiredFields: [areaCode],
    depends: [areaCode],
  });

  return [_get(data, '0.ads') as AD[], res, isLoading];
}

export default useBanner;
