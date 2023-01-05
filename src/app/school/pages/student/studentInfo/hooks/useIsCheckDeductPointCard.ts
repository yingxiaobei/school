import { useFetch } from 'hooks';
import { _getCustomParam } from 'api';
import { Auth, _get } from 'utils';

export const useIsCheckDeductPointCard = () => {
  const { data } = useFetch({
    request: _getCustomParam,
    query: { paramCode: 'enable_cardconsump_on_register', schoolId: Auth.get('schoolId') },
  });

  return _get(data, 'paramValue') === '1';
};
