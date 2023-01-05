import { useFetch } from 'hooks';
import { useState } from 'react';
import { showNetworkTimeButton } from '../_api';

export const useShowDistanceEduBtn = () => {
  const [showBtn, setShowBtn] = useState(false);

  useFetch({
    request: showNetworkTimeButton,
    callback(data) {
      setShowBtn(data);
    },
  });

  return showBtn;
};
