import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { PUBLIC_URL } from 'constants/env';

export const useLeave = (pre$CompanyId: string | null | undefined, $companyId: string | null) => {
  const history = useHistory();
  // TODO: 寻找更合适的处理方案
  useEffect(() => {
    pre$CompanyId === null &&
      $companyId &&
      setTimeout(() => {
        history.replace(`${PUBLIC_URL}`);
      }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [$companyId]);
};
