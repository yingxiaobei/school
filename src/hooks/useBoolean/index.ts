import { useState } from 'react';

interface IUseBoolean {
  (defaultValue?: boolean): [boolean, { _switch(): void; _setTruthy(): void; _setFalsy(): void }];
}

export const useBoolean: IUseBoolean = (defaultValue = false) => {
  const [isTruthy, setIsTruthy] = useState(defaultValue);

  function _switch() {
    setIsTruthy(!isTruthy);
  }

  function _setTruthy() {
    setIsTruthy(true);
  }

  function _setFalsy() {
    setIsTruthy(false);
  }

  return [isTruthy, { _switch, _setTruthy, _setFalsy }];
};
