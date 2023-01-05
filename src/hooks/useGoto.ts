import { useHistory } from 'react-router-dom';
import { PUBLIC_URL } from 'constants/env';

export function useGoto() {
  const history = useHistory();

  const _push = (path: string, state?: any) => history.push(`${PUBLIC_URL}${path}`, state);
  const _replace = (path: string, state?: any) => history.replace(`${PUBLIC_URL}${path}`, state);

  return { _push, _replace };
}
