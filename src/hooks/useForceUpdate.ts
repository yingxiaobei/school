import { useReducer } from 'react';

export function useForceUpdate(): [number, () => void] {
  const [ignore, forceUpdate] = useReducer((x) => x + 1, 0);

  return [ignore, forceUpdate];
}
