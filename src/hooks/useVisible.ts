import { useState } from 'react';

interface UseVisible {
  (): [boolean, () => void];
}

export const useVisible: UseVisible = () => {
  const [visible, setVisible] = useState(false);

  function _switchVisible() {
    setVisible((visible) => !visible);
  }

  return [visible, _switchVisible];
};
