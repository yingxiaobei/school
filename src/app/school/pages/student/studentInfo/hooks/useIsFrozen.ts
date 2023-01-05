import { useFetch } from 'hooks';
import { useState } from 'react';
import { isFreezingModeStudent } from '../_api';

export const useIsFrozen = (sid: number | string | null) => {
  const [isFrozenStudent, setIsFrozenStudent] = useState(false);

  useFetch({
    request: isFreezingModeStudent,
    query: {
      sid,
    },
    callback(data: boolean) {
      setIsFrozenStudent(data);
    },
    depends: [sid],
    forceCancel: !sid,
  });

  return isFrozenStudent;
};
