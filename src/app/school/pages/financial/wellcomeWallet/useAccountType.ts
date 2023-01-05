import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { _get } from 'utils';
export default () => {
  const history = useHistory();
  const [accountType, setAccountType] = useState(() => {
    return _get(history, 'location.state.accountType', '') + '';
  });

  const changeAccountType = (key: string) => {
    setAccountType(key);
  };

  return [accountType, changeAccountType] as [string, (string: any) => void];
};
