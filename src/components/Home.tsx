import { Auth, _get } from 'utils';
import { useFetch } from 'hooks';
import { _getBaseInfo } from 'api';
import SuperviseHome from './SuperviseHome';
import { useState } from 'react';
import { IF, Loading } from 'components';
import SchoolHome from './schoolHome';
import { PUBLIC_URL } from 'constants/env';

export default function Home() {
  // 基本信息详情
  const { isLoading } = useFetch({
    query: {
      id: Auth.get('schoolId'),
    },
    request: _getBaseInfo,
    callback(data: any) {
      setIsSuper(String(_get(data, 'type', '')) === '2');
    },
  });
  const [isSuper, setIsSuper] = useState(false);

  return (
    <div>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <IF
            condition={isSuper || PUBLIC_URL == '/kedu/'}
            then={<SuperviseHome />}
            else={
              <div>
                <SchoolHome />
              </div>
            }
          />
        }
      />
    </div>
  );
}
